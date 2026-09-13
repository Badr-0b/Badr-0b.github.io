'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';

let registered = false;
function register() {
    if (registered) return;
    gsap.registerPlugin(ScrollTrigger, CustomEase);
    // the site's one motion curve — matches --ease-luxury (AESTHETIC_DIRECTION.md §5)
    CustomEase.create('luxury', '0.16,1,0.3,1');
    registered = true;
}

/**
 * The landing "journey" — GSAP + ScrollTrigger, built once the entrance hands off.
 * One easing (enters use 'luxury'; scrubs use 'none' = linear tie to scroll). Everything is
 * transform/opacity only, mirrored for RTL in CSS, and rebuilt per breakpoint via matchMedia.
 * Under reduced-motion nothing is built — CSS end-states show the whole page. See §5/§7.
 */
export function useHomeJourney(
    scopeRef: React.RefObject<HTMLElement | null>,
    entered: boolean
) {
    useEffect(() => {
        if (!entered) return;
        const scope = scopeRef.current;
        if (!scope) return;
        register();

        const q = gsap.utils.selector(scope);
        const mm = gsap.matchMedia(scope);

        mm.add(
            {
                isDesktop: '(min-width: 761px) and (prefers-reduced-motion: no-preference)',
                isMobile: '(max-width: 760px) and (prefers-reduced-motion: no-preference)',
            },
            (ctx) => {
                const isDesktop = Boolean(
                    (ctx.conditions as Record<string, boolean>).isDesktop
                );

                // ---- HERO — compose in (echoes the entrance's translateY + clip reveal) ----
                const heroIn = gsap.timeline({ defaults: { ease: 'luxury' } });
                heroIn
                    .fromTo(q('.hero__eyebrow'), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0)
                    .fromTo(
                        q('.hero__title'),
                        { autoAlpha: 0, y: 28, clipPath: 'inset(0 0 100% 0)' },
                        { autoAlpha: 1, y: 0, clipPath: 'inset(0 0 -0.12em 0)', duration: 1.05 },
                        0.06
                    )
                    .fromTo(q('.hero__sub'), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.3)
                    .fromTo(q('.hero__cta'), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.44)
                    .fromTo(
                        q('.hero__meta, .hero__index'),
                        { autoAlpha: 0, y: 10 },
                        { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.12 },
                        0.55
                    );

                // ---- HERO — parallax exit: layers leave the threshold at different rates ----
                gsap
                    .timeline({
                        defaults: { ease: 'none' },
                        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.5 },
                    })
                    .to(q('.hero__eyebrow'), { yPercent: -80, autoAlpha: 0 }, 0)
                    .to(q('.hero__title'), { yPercent: -34, autoAlpha: 0.04 }, 0)
                    .to(q('.hero__sub'), { yPercent: -55, autoAlpha: 0 }, 0)
                    .to(q('.hero__cta'), { yPercent: -90, autoAlpha: 0 }, 0)
                    .to(q('.hero__meta'), { yPercent: -46, autoAlpha: 0 }, 0)
                    .to(q('.hero__index'), { yPercent: -30, autoAlpha: 0 }, 0);

                // ---- SELECTED WORK — sticky gallery, panels cross-fade on the descent ----
                const wscroll = scope.querySelector('.work__scroll');
                const panels = q('.work__panel') as HTMLElement[];
                if (isDesktop && wscroll && panels.length) {
                    // CSS makes the stage sticky over a tall track; a scrubbed (un-pinned)
                    // timeline cross-fades the panels as that track passes.
                    wscroll.classList.add('is-gallery');
                    gsap.set(panels, { autoAlpha: 0, yPercent: 8 });
                    gsap.set(panels[0], { autoAlpha: 1, yPercent: 0 });
                    const gal = gsap.timeline({
                        defaults: { ease: 'none' },
                        scrollTrigger: { trigger: wscroll, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
                    });
                    // sequential dissolve — the outgoing panel clears before the next resolves,
                    // so two titles never muddle together at the crossover.
                    for (let i = 1; i < panels.length; i++) {
                        const at = i - 1;
                        gal.to(panels[i - 1], { autoAlpha: 0, yPercent: -8, duration: 0.55 }, at)
                            .fromTo(
                                panels[i],
                                { autoAlpha: 0, yPercent: 8 },
                                { autoAlpha: 1, yPercent: 0, duration: 0.55 },
                                at + 0.5
                            );
                    }
                    gal.to({}, { duration: 0.35 }); // hold the last panel a beat before release
                } else {
                    // mobile / fallback — scrubbed vertical reveal of the list
                    gsap.fromTo(
                        panels,
                        { autoAlpha: 0, y: 40 },
                        {
                            autoAlpha: 1,
                            y: 0,
                            ease: 'none',
                            stagger: 0.1,
                            scrollTrigger: { trigger: '.work', start: 'top 75%', end: 'top 30%', scrub: true },
                        }
                    );
                }

                // ---- EXPERIENCE — scrubbed transition into frame ----
                gsap.fromTo(
                    q('.exp__item'),
                    { autoAlpha: 0, y: 64 },
                    {
                        autoAlpha: 1,
                        y: 0,
                        ease: 'none',
                        scrollTrigger: { trigger: '.experience', start: 'top 82%', end: 'top 44%', scrub: true },
                    }
                );

                // ---- STATEMENT — held monolith, words resolve on the descent ----
                const sscroll = scope.querySelector('.statement__scroll');
                const words = q('.statement__text [data-word]') as HTMLElement[];
                if (isDesktop && sscroll && words.length) {
                    // CSS holds the block sticky over a tall track; scrub the word resolve + foot.
                    sscroll.classList.add('is-held');
                    gsap.set(words, { opacity: 0.14 });
                    gsap
                        .timeline({
                            defaults: { ease: 'none' },
                            scrollTrigger: { trigger: sscroll, start: 'top top', end: 'bottom 75%', scrub: 0.4 },
                        })
                        .to(words, { opacity: 1, stagger: 0.5, duration: 2 }, 0)
                        .fromTo(q('.statement__foot'), { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 1 }, '>-0.3');
                } else {
                    gsap.fromTo(
                        q('.statement__text'),
                        { autoAlpha: 0, y: 34 },
                        {
                            autoAlpha: 1,
                            y: 0,
                            ease: 'none',
                            scrollTrigger: { trigger: '.statement', start: 'top 80%', end: 'top 45%', scrub: true },
                        }
                    );
                    gsap.fromTo(
                        q('.statement__foot'),
                        { autoAlpha: 0, y: 22 },
                        {
                            autoAlpha: 1,
                            y: 0,
                            ease: 'luxury',
                            duration: 0.8,
                            scrollTrigger: { trigger: '.statement__foot', start: 'top 88%' },
                        }
                    );
                }

                // ---- CTA — arrival ----
                gsap.fromTo(
                    q('.cta__title'),
                    { autoAlpha: 0, y: 42 },
                    { autoAlpha: 1, y: 0, ease: 'luxury', duration: 1, scrollTrigger: { trigger: '.cta', start: 'top 80%' } }
                );
                gsap.fromTo(
                    q('.cta__link'),
                    { autoAlpha: 0, y: 20 },
                    {
                        autoAlpha: 1,
                        y: 0,
                        ease: 'luxury',
                        duration: 0.8,
                        delay: 0.15,
                        scrollTrigger: { trigger: '.cta', start: 'top 80%' },
                    }
                );

                return () => {
                    heroIn.kill();
                    wscroll?.classList.remove('is-gallery');
                    sscroll?.classList.remove('is-held');
                };
            }
        );

        // Recompute trigger positions once layout settles: next frame, after the entrance fade,
        // and once the async Fontshare faces load (their height shift moves every trigger).
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
    }, [scopeRef, entered]);
}
