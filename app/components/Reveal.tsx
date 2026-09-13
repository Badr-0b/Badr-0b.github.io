'use client';

import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
    children: React.ReactNode;
    /** stagger delay in ms */
    delay?: number;
    className?: string;
}

/**
 * Scroll-driven reveal. One motion language: opacity 0->1, translateY up, expo-out.
 * Reveals once, then stops observing. Reduced-motion renders instantly (handled in CSS + here).
 * See AESTHETIC_DIRECTION.md §5.
 */
export default function Reveal({ children, delay = 0, className = '' }: RevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setInView(true);
            return;
        }

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setInView(true);
                        io.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
        );

        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`reveal ${inView ? 'in' : ''} ${className}`.trim()}
            style={delay ? { transitionDelay: `${delay}ms` } : undefined}
        >
            {children}
        </div>
    );
}
