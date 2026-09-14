'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';

let registered = false;
function register() {
    if (registered) return;
    gsap.registerPlugin(ScrollTrigger, CustomEase);
    // idempotent with useHomeJourney — same one curve, matches --ease-luxury (§5)
    try {
        CustomEase.create('luxury', '0.16,1,0.3,1');
    } catch {
        /* already defined by another module — fine */
    }
    registered = true;
}

/**
 * Projects mosaic — a horizontal cinematic pan driven by vertical scroll.
 *
 * Mechanics mirror useHomeJourney: NO ScrollTrigger.pin. A CSS `position: sticky`
 * stage holds the frame while an un-pinned, scrubbed timeline translates the track
 * on X. This respects `overflow-x: clip` on <body> and the site's sticky-not-pin
 * convention. Desktop-only + reduced-motion-safe via matchMedia; on mobile /
 * reduced-motion nothing is built and CSS renders a normal vertical stack.
 * Mirrored for RTL. See AESTHETIC_DIRECTION.md §5/§7.
 */
export function useProjectsGallery(scopeRef: React.RefObject<HTMLElement | null>) {
    useEffect(() => {
        const scope = scopeRef.current;
        if (!scope) return;
        register();

        const mm = gsap.matchMedia(scope);

        mm.add('(min-width: 761px) and (prefers-reduced-motion: no-preference)', () => {
            const scrollEl = scope.querySelector<HTMLElement>('.pj__scroll');
            const track = scope.querySelector<HTMLElement>('.pj__track');
            const gallery = scope.querySelector<HTMLElement>('.pj__gallery');
            if (!scrollEl || !track) return;

            // switch CSS from vertical stack → sticky horizontal mode
            scrollEl.classList.add('is-pan');

            const isRTL = document.documentElement.dir === 'rtl';
            // Hold the pan a touch longer than the raw pixel travel so exploring feels
            // deliberate (a pinned-scene hold, still 1:1 scroll-linked, never hijacked).
            const PAN_FACTOR = 1.2;
            // measure against the visible gallery area (rail-aware), not the full window
            const viewport = () => gallery?.clientWidth ?? window.innerWidth;
            const travel = () => Math.max(0, track.scrollWidth - viewport());
            const scrollLen = () => travel() * PAN_FACTOR;

            // The sticky stage (100vh) needs the outer track tall enough that the
            // "stuck" scroll distance covers the pan: height = scrollLen + vh.
            const setHeight = () => {
                scrollEl.style.height = scrollLen() + window.innerHeight + 'px';
            };
            setHeight();
            ScrollTrigger.addEventListener('refreshInit', setHeight);

            const tween = gsap.to(track, {
                // content exits toward the reading-end: left in LTR, right in RTL
                x: () => (isRTL ? travel() : -travel()),
                ease: 'none',
                scrollTrigger: {
                    trigger: scrollEl,
                    start: 'top top',
                    end: () => '+=' + scrollLen(),
                    scrub: 0.6,
                    invalidateOnRefresh: true,
                    // progress readout + fill, tied to the pan
                    onUpdate: (self) => {
                        const readout = scope.querySelector('.pj__progress-now');
                        const fill = scope.querySelector<HTMLElement>('.pj__progress-fill');
                        const tiles = track.querySelectorAll('.pj__tile[data-idx]').length || 1;
                        if (readout) {
                            const n = Math.min(
                                tiles,
                                Math.max(1, Math.ceil(self.progress * tiles) || 1)
                            );
                            readout.textContent = String(n).padStart(2, '0');
                        }
                        if (fill) fill.style.width = (self.progress * 100).toFixed(1) + '%';
                    },
                },
            });

            return () => {
                ScrollTrigger.removeEventListener('refreshInit', setHeight);
                tween.scrollTrigger?.kill();
                tween.kill();
                scrollEl.classList.remove('is-pan');
                scrollEl.style.height = '';
                gsap.set(track, { clearProps: 'x' });
            };
        });

        // Recompute once layout settles: next frame, after the entrance beat, and once
        // the async Fontshare faces load (their height shift moves every measurement).
        let cancelled = false;
        const refresh = () => {
            if (!cancelled) ScrollTrigger.refresh();
        };
        const fonts = (document as unknown as { fonts?: { ready?: Promise<unknown> } }).fonts;
        if (fonts?.ready) fonts.ready.then(refresh);
        const raf = requestAnimationFrame(refresh);
        const t = window.setTimeout(refresh, 900);

        return () => {
            cancelled = true;
            cancelAnimationFrame(raf);
            window.clearTimeout(t);
            mm.revert();
        };
    }, [scopeRef]);
}
