'use client';

import { useEffect, useRef, type RefObject } from 'react';

/* ===========================================================================
   Site motion engine (shared — /about, /projects, and every page rebuilt to
   their level). One requestAnimationFrame loop drives every scroll- and
   pointer-linked effect on the page, and it sleeps whenever nothing is moving.
   Effects never attach their own scroll listeners: they read scroll from the
   frame, cache geometry in measure passes (resize, font load, reflow) and write
   transform / opacity. One curve — the site's --ease-luxury — or a straight tie
   to scroll. AESTHETIC_DIRECTION.md §5 (motion) · §7 (interactivity).
   =========================================================================== */

export const clamp = (v: number, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Where v sits between a and b, as 0..1. */
export const span = (v: number, a: number, b: number) =>
    a === b ? (v < a ? 0 : 1) : clamp((v - a) / (b - a));

function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
    const cx = 3 * x1;
    const bx = 3 * (x2 - x1) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * y1;
    const by = 3 * (y2 - y1) - cy;
    const ay = 1 - cy - by;
    const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
    const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
    const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
    return (p: number) => {
        if (p <= 0) return 0;
        if (p >= 1) return 1;
        let t = p;
        for (let i = 0; i < 8; i++) {
            const err = sampleX(t) - p;
            if (Math.abs(err) < 1e-6) break;
            t = clamp(t - err / slopeX(t));
        }
        return sampleY(t);
    };
}

/** The site's one curve: --ease-luxury, cubic-bezier(0.16, 1, 0.3, 1). */
export const ease = cubicBezier(0.16, 1, 0.3, 1);

/** Frame-rate-independent exponential approach — this is what gives everything its weight. */
export const damp = (from: number, to: number, lambda: number, dt: number) =>
    lerp(from, to, 1 - Math.exp(-lambda * dt));

export const matches = (query: string) =>
    typeof window !== 'undefined' && window.matchMedia(query).matches;
export const reducedMotion = () => matches('(prefers-reduced-motion: reduce)');
export const finePointer = () => matches('(hover: hover) and (pointer: fine)');

/** Smooth-scroll to a page section (user-initiated only — never scroll-jacking). */
export function scrollToId(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 24;
    window.scrollTo({ top, behavior: reducedMotion() ? 'auto' : 'smooth' });
}

/* ---------------------------------------------------------------------------
   The loop
   --------------------------------------------------------------------------- */

export type Frame = {
    /** window.scrollY */
    y: number;
    /** viewport height */
    vh: number;
    /** viewport width */
    vw: number;
    /** seconds since the previous frame (clamped) */
    dt: number;
    /** performance.now() */
    now: number;
};

/** Return true while still animating; the loop sleeps once every subscriber returns false. */
type FrameFn = (f: Frame) => boolean | void;

const frameSubs = new Set<FrameFn>();
const measureSubs = new Set<() => void>();

let raf = 0;
let last = 0;
let quiet = 0;
let measureRaf = 0;
let installed = 0;
let resizeObserver: ResizeObserver | null = null;

/** Live pointer, normalised to -1..1 around the viewport centre (fine pointers only). */
export const pointer = { x: 0, y: 0 };

function tick(now: number) {
    raf = 0;
    const dt = Math.min(0.064, Math.max(0.001, (now - last) / 1000));
    last = now;
    const frame: Frame = {
        y: window.scrollY,
        vh: window.innerHeight,
        vw: window.innerWidth,
        dt,
        now,
    };
    let busy = false;
    frameSubs.forEach((fn) => {
        if (fn(frame)) busy = true;
    });
    quiet = busy ? 0 : quiet + 1;
    // a few grace frames after the last movement, then the loop sleeps
    if (quiet < 4 && frameSubs.size) raf = requestAnimationFrame(tick);
}

/** Wake the loop — on scroll, pointer, resize, or any state change an effect cares about. */
export function wake() {
    quiet = 0;
    if (!raf && frameSubs.size && typeof window !== 'undefined') {
        last = performance.now();
        raf = requestAnimationFrame(tick);
    }
}

function runMeasure() {
    measureRaf = 0;
    measureSubs.forEach((fn) => fn());
    wake();
}

/** Re-measure every effect on the next frame (coalesced). */
export function requestMeasure() {
    if (measureRaf || typeof window === 'undefined') return;
    measureRaf = requestAnimationFrame(runMeasure);
}

const onScroll = () => wake();
const onResize = () => requestMeasure();
const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    wake();
};

function install() {
    if (installed++) return;
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    // any reflow (language switch, font swap, late content) changes geometry
    resizeObserver = new ResizeObserver(() => requestMeasure());
    resizeObserver.observe(document.body);
    document.fonts?.ready.then(() => requestMeasure());
}

function uninstall() {
    if (--installed > 0) return;
    installed = 0;
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('pointermove', onPointerMove);
    resizeObserver?.disconnect();
    resizeObserver = null;
    if (raf) cancelAnimationFrame(raf);
    if (measureRaf) cancelAnimationFrame(measureRaf);
    raf = 0;
    measureRaf = 0;
}

/** Subscribe to the frame loop. Returns an unsubscribe. */
export function onFrame(fn: FrameFn) {
    install();
    frameSubs.add(fn);
    wake();
    return () => {
        frameSubs.delete(fn);
        uninstall();
    };
}

/**
 * Subscribe to measure passes. Runs once immediately (the DOM is laid out by the
 * time effects run), then on every resize / reflow / font load.
 */
export function onMeasure(fn: () => void) {
    install();
    measureSubs.add(fn);
    fn();
    requestMeasure();
    return () => {
        measureSubs.delete(fn);
        uninstall();
    };
}

/* ---------------------------------------------------------------------------
   Magnet — a small control drifts a few pixels toward the pointer while it is
   near, then settles back. Damped, never springy; fine pointers only.
   --------------------------------------------------------------------------- */
export function useMagnet<T extends HTMLElement>(strength = 0.28, max = 6) {
    const ref = useRef<T>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el || !finePointer() || reducedMotion()) return;
        let tx = 0;
        let ty = 0;
        let x = 0;
        let y = 0;
        const zone = (el.closest('[data-magnet-zone]') as HTMLElement | null) ?? el;
        const onMove = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            tx = clamp((e.clientX - (r.left + r.width / 2)) * strength, -max, max);
            ty = clamp((e.clientY - (r.top + r.height / 2)) * strength, -max, max);
            wake();
        };
        const onLeave = () => {
            tx = 0;
            ty = 0;
            wake();
        };
        zone.addEventListener('pointermove', onMove);
        zone.addEventListener('pointerleave', onLeave);
        let settled = true;
        const off = onFrame(({ dt }) => {
            if (Math.abs(tx - x) < 0.02 && Math.abs(ty - y) < 0.02) {
                if (!settled) {
                    x = tx;
                    y = ty;
                    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
                    settled = true;
                }
                return false;
            }
            settled = false;
            x = damp(x, tx, 10, dt);
            y = damp(y, ty, 10, dt);
            el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
            return true;
        });
        return () => {
            off();
            zone.removeEventListener('pointermove', onMove);
            zone.removeEventListener('pointerleave', onLeave);
            el.style.transform = '';
        };
    }, [strength, max]);
    return ref;
}

/* ---------------------------------------------------------------------------
   Reveal — enter-on-scroll for [data-reveal] (rise · mask · words · fade).
   Adds .is-in once, then stops watching. Reduced motion: everything is in.
   `key` re-scans for elements that lost or never had .is-in (e.g. a language switch).
   --------------------------------------------------------------------------- */
export function useReveal(scope: RefObject<HTMLElement | null>, key?: unknown) {
    useEffect(() => {
        const root = scope.current;
        if (!root) return;
        const els = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)'));
        if (reducedMotion() || typeof IntersectionObserver === 'undefined') {
            els.forEach((el) => el.classList.add('is-in'));
            return;
        }
        const io = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    entry.target.classList.add('is-in');
                    io.unobserve(entry.target);
                }
            },
            { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
        );
        els.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, [scope, key]);
}
