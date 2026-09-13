'use client';

import React, { useEffect, useRef } from 'react';
import './CustomCursor.css';

/**
 * Reticle cursor — a small accent dot that expands into a ring over interactive
 * elements, chasing the pointer with a weighted lag. Desktop (fine pointer) only.
 * See AESTHETIC_DIRECTION.md §7.
 */
export default function CustomCursor() {
    const dotRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
        if (!mq.matches) return;

        const dot = dotRef.current;
        if (!dot) return;

        document.body.classList.add('cursor-ready');

        let x = window.innerWidth / 2;
        let y = window.innerHeight / 2;
        let tx = x;
        let ty = y;
        let raf = 0;
        let visible = false;

        const interactive = 'a, button, input, textarea, select, label, [data-hover]';

        const onMove = (e: MouseEvent) => {
            tx = e.clientX;
            ty = e.clientY;
            if (!visible) {
                visible = true;
                dot.classList.add('is-visible');
            }
        };
        const onOver = (e: MouseEvent) => {
            if ((e.target as Element)?.closest?.(interactive)) dot.classList.add('is-hover');
        };
        const onOut = (e: MouseEvent) => {
            if ((e.target as Element)?.closest?.(interactive)) dot.classList.remove('is-hover');
        };
        const onLeave = () => {
            visible = false;
            dot.classList.remove('is-visible');
        };

        const loop = () => {
            x += (tx - x) * 0.16;
            y += (ty - y) * 0.16;
            dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
            raf = requestAnimationFrame(loop);
        };

        window.addEventListener('mousemove', onMove);
        document.addEventListener('mouseover', onOver);
        document.addEventListener('mouseout', onOut);
        document.addEventListener('mouseleave', onLeave);
        loop();

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseover', onOver);
            document.removeEventListener('mouseout', onOut);
            document.removeEventListener('mouseleave', onLeave);
            document.body.classList.remove('cursor-ready');
        };
    }, []);

    return <div className="cursor-dot" ref={dotRef} aria-hidden="true" />;
}
