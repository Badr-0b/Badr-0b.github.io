'use client';

import { useEffect, useRef, type MutableRefObject, type RefObject } from 'react';
import { clamp, damp, ease, lerp, matches, onFrame, onMeasure, reducedMotion, span } from '../kit/motion';
import { centreOf, schedule, type Rect, type Show } from './show';

export type Mode = 'flow' | 'pinned';

/**
 * The landing's conductor. One measure pass reads the layout (the hero's viewport,
 * the pinned stage, where an artifact is inspected); one frame callback turns the
 * scroll into the show state and writes the DOM side of it: the hero leaving, the
 * viewport's corners opening out to frame the stage, each artifact's panel rising
 * in and out, the register's progress. The 3D scene reads the same state.
 *
 * Elements are found by [data-sh] inside the root, so the parts stay plain markup.
 */
export function useShow(
    rootRef: RefObject<HTMLElement | null>,
    show: MutableRefObject<Show>,
    n: number,
    setMode: (m: Mode) => void
) {
    const geo = useRef({ bayTop: 0, bayH: 1, vh: 1, pinned: false });

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        const reduce = reducedMotion();
        const sc = schedule(n);
        const s = show.current;

        const all = (sel: string) => Array.from(root.querySelectorAll<HTMLElement>(sel));
        let copy: HTMLElement[] = [];
        let foot: HTMLElement[] = [];
        let corners: HTMLElement[] = [];
        let viewChrome: HTMLElement[] = [];
        let readout: HTMLElement | null = null;
        let panels: HTMLElement[] = [];
        let chrome: HTMLElement[] = [];
        let regItems: HTMLElement[] = [];
        let regFill: HTMLElement | null = null;

        let pinned = false;
        let rtl = false;
        let heroH = 1;
        let copyTop = 0;
        let copyBottom = 1;
        let footTop = 0;
        let bayTop = 0;
        let bayH = 1;
        let hp = -1;
        let q = -1;
        let current = -2;
        // writes only what changed since the last frame
        let written = new WeakMap<HTMLElement, Record<string, string>>();
        const set = (el: HTMLElement | null, prop: 'opacity' | 'transform' | 'visibility', v: string) => {
            if (!el) return;
            let w = written.get(el);
            if (!w) written.set(el, (w = {}));
            if (w[prop] === v) return;
            w[prop] = v;
            el.style[prop] = v;
        };

        const rel = (el: Element | null, to: DOMRect): Rect => {
            if (!el) return { x: 0, y: 0, w: 1, h: 1 };
            const r = el.getBoundingClientRect();
            return { x: r.left - to.left, y: r.top - to.top, w: r.width, h: r.height };
        };

        const offMeasure = onMeasure(() => {
            copy = all('[data-sh="copy"]');
            foot = all('[data-sh="foot"]');
            corners = all('[data-sh="corner"]');
            viewChrome = all('[data-sh="view-chrome"]');
            readout = root.querySelector<HTMLElement>('[data-sh="readout"]');
            panels = all('[data-sh="panel"]');
            chrome = all('[data-sh="bay-chrome"]');
            regItems = all('[data-sh="reg"]');
            regFill = root.querySelector<HTMLElement>('[data-sh="reg-fill"]');

            const want: Mode = !reduce && !s.noGL && matches('(min-width: 900px)') ? 'pinned' : 'flow';
            if (root.dataset.mode !== want) setMode(want);
            pinned = root.dataset.mode === 'pinned';
            rtl = document.documentElement.dir === 'rtl';

            const sy = window.scrollY;
            const showEl = root.querySelector<HTMLElement>('.hm-show');
            const hero = root.querySelector<HTMLElement>('.hm-hero');
            const bay = root.querySelector<HTMLElement>('.hm-bay');
            const pin = root.querySelector<HTMLElement>('.hm-show__pin');
            heroH = hero?.offsetHeight || window.innerHeight;
            // in flow the copy sits below the viewport on narrow screens: it leaves by its own position
            // (offsetTop: the copy carries its own scroll transform, which a rect would include)
            const heroTop = hero ? hero.getBoundingClientRect().top + sy : 0;
            copyTop = heroTop + (copy[0]?.offsetTop ?? 0);
            copyBottom = copyTop + (copy[0]?.offsetHeight ?? 1);
            const fr = foot[0]?.getBoundingClientRect();
            footTop = fr ? fr.top + sy : 0;
            const br = bay?.getBoundingClientRect();
            bayTop = br ? br.top + sy : 0;
            bayH = bay?.offsetHeight || 1;
            const sr = showEl?.getBoundingClientRect();
            s.trackEnd = sr ? sr.top + sy + sr.height : heroH;

            // the hero's viewport, relative to the pin (the canvas' box)
            const pr = pin?.getBoundingClientRect() ?? new DOMRect();
            s.view = rel(root.querySelector('.hm-hero__view'), pr);
            // the pinned stage and where its artifact sits, relative to the stage (= the screen, when stuck)
            const stageEl = root.querySelector<HTMLElement>('.hm-bay__stage');
            const stR = stageEl?.getBoundingClientRect() ?? new DOMRect();
            s.stage = rel(root.querySelector('.hm-bay__frame'), stR);
            const pan = rel(root.querySelector('.hm-bay__panels'), stR);
            const free = rtl
                ? { x: pan.x + pan.w, w: s.stage.x + s.stage.w - (pan.x + pan.w) }
                : { x: s.stage.x, w: pan.x - s.stage.x };
            s.focus = {
                x: free.x + free.w * 0.5,
                y: s.stage.y + s.stage.h * 0.5,
                r: Math.min(free.w * 0.34, s.stage.h * 0.31),
            };
            s.pinned = pinned;
            geo.current = { bayTop, bayH, vh: window.innerHeight, pinned };
            hp = -1;
            q = -1;
            current = -2;
            written = new WeakMap();
            if (!pinned) {
                // leaving the pinned layout: hand the stage's elements back to CSS
                [...panels, ...chrome].forEach((el) => {
                    el.style.opacity = '';
                    el.style.transform = '';
                    el.style.visibility = '';
                });
            }
        });

        const offFrame = onFrame(({ y, vh, dt }) => {
            const hy = span(y, 0, heroH);
            const hpT = pinned ? hy : 0;
            const qT = pinned ? span(y, bayTop, bayTop + bayH - vh) : 0;
            const prevHp = hp;
            const prevQ = q;
            hp = hp < 0 || reduce ? hpT : damp(hp, hpT, 7, dt);
            q = q < 0 || reduce ? qT : damp(q, qT, 7, dt);
            s.hy = hy;
            s.hpT = hpT;
            s.qT = qT;
            s.hp = hp;
            s.q = q;
            const moving = Math.abs(hpT - hp) > 0.0004 || Math.abs(qT - q) > 0.0004;
            if (prevHp >= 0 && prevQ >= 0 && !moving && y > heroH * 1.05 && !pinned) return false;

            /* ---- the hero leaves: the copy a little faster than the page, fading ---- */
            if (!reduce) {
                const gone = y > heroH;
                const fade = pinned
                    ? 1 - span(y, heroH * 0.06, heroH * 0.48)
                    : 1 - span(y, copyTop - vh * 0.12, copyBottom - vh * 0.22);
                const lift = pinned ? 0.14 : 0.08;
                copy.forEach((el) => {
                    set(el, 'transform', gone ? 'translate3d(0, 0, 0)' : `translate3d(0, ${(-y * lift).toFixed(1)}px, 0)`);
                    set(el, 'opacity', gone ? '0' : fade.toFixed(3));
                });
                const footFade = pinned ? 1 - span(y, 0, heroH * 0.22) : 1 - span(y, footTop - vh * 0.6, footTop - vh * 0.3);
                foot.forEach((el) => set(el, 'opacity', footFade.toFixed(3)));
            }

            /* ---- the viewport opens out into the stage ---- */
            const e = pinned ? ease(clamp(hp)) : 0;
            const v = s.view;
            const st = s.stage;
            const r: Rect = pinned
                ? { x: lerp(v.x, st.x, e), y: lerp(v.y, st.y, e), w: lerp(v.w, st.w, e), h: lerp(v.h, st.h, e) }
                : v;
            const C = 14;
            corners.forEach((el) => {
                const c = el.dataset.c ?? 'tl';
                const x = c.endsWith('l') ? r.x : r.x + r.w - C;
                const yy = c.startsWith('t') ? r.y : r.y + r.h - C;
                set(el, 'transform', `translate3d(${x.toFixed(1)}px, ${yy.toFixed(1)}px, 0)`);
            });
            if (readout) {
                const x = rtl ? r.x : r.x + r.w;
                set(readout, 'transform', `translate3d(${x.toFixed(1)}px, ${(r.y + r.h + 14).toFixed(1)}px, 0) translateX(${rtl ? '0' : '-100%'})`);
            }
            const vc = pinned ? 1 - span(hp, 0.02, 0.3) : 1;
            viewChrome.forEach((el) => {
                set(el, 'opacity', vc.toFixed(3));
                set(el, 'visibility', vc < 0.01 ? 'hidden' : 'visible');
            });

            if (!pinned) return moving;

            /* ---- the stage: chrome, panels, register ---- */
            const ch = span(hp, 0.6, 1);
            chrome.forEach((el) => {
                set(el, 'opacity', ch.toFixed(3));
                set(el, 'visibility', ch < 0.01 ? 'hidden' : 'visible');
            });
            const end = sc.windows[n - 1][1];
            panels.forEach((el, k) => {
                const [a, b] = sc.windows[k];
                const inn = k === 0 ? span(hp, 0.62, 1) : span(q, a - sc.move * 0.38, a + 0.004);
                const out = k === n - 1 ? span(q, end + sc.end * 0.1, end + sc.end * 0.55) : span(q, b - 0.004, b + sc.move * 0.38);
                const o = clamp(inn * (1 - out));
                const dy = (1 - inn) * 28 - out * 28;
                set(el, 'opacity', o.toFixed(3));
                set(el, 'transform', `translate3d(0, ${dy.toFixed(1)}px, 0)`);
                set(el, 'visibility', o < 0.01 ? 'hidden' : 'visible');
            });
            if (regFill) set(regFill, 'transform', `scaleX(${clamp(q / end).toFixed(4)})`);
            let c = -1;
            for (let k = 0; k < n; k++) if (q >= sc.windows[k][0] - sc.move * 0.5) c = k;
            if (hp < 0.6) c = -1;
            if (c !== current) {
                current = c;
                regItems.forEach((el, k) => el.toggleAttribute('data-on', k === c));
            }
            return moving;
        });

        return () => {
            offFrame();
            offMeasure();
        };
    }, [rootRef, show, n, setMode]);

    /** smooth-scroll to an artifact's station (user-initiated) */
    const goTo = (k: number) => {
        const g = geo.current;
        const sc = schedule(n);
        const top = g.pinned ? g.bayTop + centreOf(k, sc) * (g.bayH - g.vh) : (() => {
            const el = document.getElementById(`work-${k}`);
            return el ? el.getBoundingClientRect().top + window.scrollY - 96 : 0;
        })();
        window.scrollTo({ top, behavior: reducedMotion() ? 'auto' : 'smooth' });
    };

    return goTo;
}
