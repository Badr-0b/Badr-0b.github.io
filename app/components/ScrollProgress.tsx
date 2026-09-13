'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ScrollProgress.css';

gsap.registerPlugin(ScrollTrigger);

interface ScrollProgressProps {
    /** Only arm once the entrance has handed off (scroll is unlocked). */
    active: boolean;
}

/**
 * The descent instrument — a hairline "spine" whose fill tracks whole-page scroll progress,
 * paired with a Space-Mono depth readout. The site quietly tracks your descent (§7, §3).
 * Static/hidden under reduced motion.
 */
export default function ScrollProgress({ active }: ScrollProgressProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const fillRef = useRef<HTMLSpanElement>(null);
    const readoutRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!active) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const root = rootRef.current;
        const fill = fillRef.current;
        const readout = readoutRef.current;
        if (!root || !fill || !readout) return;

        const setY = gsap.quickSetter(fill, 'scaleY');
        setY(0);
        let last = -1;

        const st = ScrollTrigger.create({
            start: 0,
            end: 'max',
            onUpdate: (self) => {
                setY(self.progress);
                const pct = Math.round(self.progress * 100);
                if (pct !== last) {
                    last = pct;
                    readout.textContent = `↓ ${String(pct).padStart(2, '0')}`;
                }
            },
        });

        const reveal = gsap.fromTo(
            root,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.9, ease: 'power2.out' }
        );

        return () => {
            st.kill();
            reveal.kill();
            gsap.set(root, { clearProps: 'all' });
        };
    }, [active]);

    return (
        <div className="scroll-spine" ref={rootRef} aria-hidden="true">
            <span className="scroll-spine__track">
                <span className="scroll-spine__fill" ref={fillRef} />
            </span>
            <span className="scroll-spine__readout" ref={readoutRef}>
                ↓ 00
            </span>
        </div>
    );
}
