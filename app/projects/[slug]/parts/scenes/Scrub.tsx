'use client';

import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../../../../components/LanguageContext';
import { damp, matches, onFrame, onMeasure, reducedMotion, span } from '../../../../kit/motion';

/**
 * The shell every story scene shares: on desktop a pinned scene (a sticky stage
 * over a tall track, scrubbed — never scroll-jacked); on narrow screens the same
 * scrub, in flow. `apply(q)` receives the damped progress 0..1 and writes the DOM
 * directly. Reduced motion: apply(1) once — the finished state.
 */
export default function Scrub({
    idx,
    name,
    apply,
    className = '',
    children,
}: {
    idx: string;
    name: string;
    apply: (q: number) => void;
    className?: string;
    children: React.ReactNode;
}) {
    const { language } = useLanguage();
    const trackRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const applyRef = useRef(apply);
    applyRef.current = apply;

    useEffect(() => {
        const track = trackRef.current;
        const stage = stageRef.current;
        if (!track || !stage) return;
        if (reducedMotion()) {
            applyRef.current(1);
            return;
        }
        stage.classList.add('is-live');
        let pinned = false;
        let top = 0;
        let H = 0;
        let stageTop = 0;
        let p = -1;
        const offMeasure = onMeasure(() => {
            pinned = matches('(min-width: 900px)');
            const sy = window.scrollY;
            top = track.getBoundingClientRect().top + sy;
            H = track.offsetHeight;
            stageTop = pinned ? top : stage.getBoundingClientRect().top + sy;
            if (p >= 0) applyRef.current(p);
        });
        const offFrame = onFrame(({ y, vh, dt }) => {
            const target = pinned ? span(y, top, top + H - vh) : span(y, stageTop - vh * 0.8, stageTop - vh * 0.1);
            const prev = p;
            p = p < 0 ? target : damp(p, target, 7, dt);
            if (prev >= 0 && Math.abs(p - prev) < 0.00015) return false;
            applyRef.current(p);
            return Math.abs(target - p) > 0.0004;
        });
        return () => {
            offFrame();
            offMeasure();
            stage.classList.remove('is-live');
        };
    }, [language]);

    return (
        <section className={`pj-sec pd-story ${className}`} id="story" aria-labelledby="story-title">
            <header className="pj-sec__label" data-reveal="fade">
                <span className="pj-sec__idx">{idx}</span>
                <h2 className="pj-sec__name" id="story-title">
                    {name}
                </h2>
            </header>
            <div className="pd-story__track" ref={trackRef}>
                <div className="pd-story__stage" ref={stageRef}>
                    {children}
                </div>
            </div>
        </section>
    );
}
