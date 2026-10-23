'use client';

import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../../components/LanguageContext';
import { finePointer, onFrame, onMeasure, wake } from '../../kit/motion';
import { PLACE } from '../../about/about.data';
import { useClock } from '../useClock';

const SVG = 'http://www.w3.org/2000/svg';
const INSET = 26;

/**
 * Ticks every 10px, longer every 50, numbered every 100 — measured in real CSS pixels
 * from the frame's inline-start corner (`flip`: the right one, in RTL).
 */
function ticks(svg: SVGSVGElement, length: number, axis: 'x' | 'y', flip: boolean) {
    svg.replaceChildren();
    const g = document.createElementNS(SVG, 'path');
    let d = '';
    const labels: [number, string][] = [];
    for (let p = 0; p <= length - INSET * 2; p += 10) {
        const at = axis === 'x' && flip ? length - INSET - p : INSET + p;
        const len = p % 100 === 0 ? 8 : p % 50 === 0 ? 5 : 2.5;
        if (axis === 'x') d += `M${at} 0V${len}`;
        else d += flip ? `M24 ${at}H${24 - len}` : `M0 ${at}H${len}`;
        if (p % 100 === 0 && p > 0) labels.push([at, String(p)]);
    }
    g.setAttribute('d', d);
    g.setAttribute('class', 'hm-ruler__ticks');
    svg.appendChild(g);
    for (const [at, text] of labels) {
        const tx = document.createElementNS(SVG, 'text');
        tx.setAttribute('class', 'hm-ruler__n');
        if (axis === 'x') {
            tx.setAttribute('x', String(flip ? at - 3 : at + 3));
            tx.setAttribute('y', '16');
            if (flip) tx.setAttribute('text-anchor', 'end');
        } else {
            tx.setAttribute('x', flip ? '13' : '11');
            tx.setAttribute('y', String(at + 3));
            tx.setAttribute('text-anchor', flip ? 'end' : 'start');
        }
        tx.textContent = text;
        svg.appendChild(tx);
    }
    if (axis === 'x') svg.setAttribute('viewBox', `0 0 ${length} 20`);
    else svg.setAttribute('viewBox', `0 0 24 ${length}`);
    svg.style.width = axis === 'x' ? `${length}px` : '24px';
    svg.style.height = axis === 'x' ? '20px' : `${length}px`;
}

/**
 * The hero's viewport, drawn the way a CAD view is: four corner marks (which open
 * out to frame the whole stage as the page scrolls — see useShow), rulers on two
 * edges that mark where the pointer is, the view's name, the place and its time,
 * and the camera's live heading. Decorative: every fact is stated elsewhere.
 */
export default function Frame() {
    const { t } = useLanguage();
    const { time } = useClock();
    const viewRef = useRef<HTMLDivElement>(null);
    const rxRef = useRef<SVGSVGElement>(null);
    const ryRef = useRef<SVGSVGElement>(null);
    const mxRef = useRef<HTMLSpanElement>(null);
    const myRef = useRef<HTMLSpanElement>(null);
    const mxNRef = useRef<HTMLElement>(null);
    const myNRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const view = viewRef.current;
        const rx = rxRef.current;
        const ry = ryRef.current;
        const mx = mxRef.current;
        const my = myRef.current;
        if (!view || !rx || !ry || !mx || !my) return;
        const pin = view.closest('.hm-show__pin') as HTMLElement | null;
        const root = view.closest('.hm') as HTMLElement | null;
        let w = 1;
        let h = 1;
        let rtl = false;

        const offMeasure = onMeasure(() => {
            const src = root?.querySelector<HTMLElement>('.hm-hero__view');
            if (!src || !pin) return;
            const pr = pin.getBoundingClientRect();
            const r = src.getBoundingClientRect();
            w = Math.max(1, r.width);
            h = Math.max(1, r.height);
            rtl = document.documentElement.dir === 'rtl';
            view.style.transform = `translate3d(${(r.left - pr.left).toFixed(1)}px, ${(r.top - pr.top).toFixed(1)}px, 0)`;
            view.style.width = `${w}px`;
            view.style.height = `${h}px`;
            ticks(rx, w, 'x', rtl);
            ticks(ry, h, 'y', rtl);
        });

        if (!finePointer()) return offMeasure;

        let px = -1;
        let py = -1;
        let on = false;
        const onMove = (e: PointerEvent) => {
            if (e.pointerType !== 'mouse') return;
            const r = view.getBoundingClientRect();
            px = e.clientX - r.left;
            py = e.clientY - r.top;
            wake();
        };
        const onLeave = () => {
            px = -1;
            wake();
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        document.documentElement.addEventListener('pointerleave', onLeave);

        let sx = '';
        let sy = '';
        const offFrame = onFrame(() => {
            const inside = px >= INSET && px <= w - INSET && py >= INSET && py <= h - INSET;
            if (inside !== on) {
                on = inside;
                mx.toggleAttribute('data-on', on);
                my.toggleAttribute('data-on', on);
            }
            if (!on) return false;
            mx.style.transform = `translate3d(${px.toFixed(1)}px, 0, 0)`;
            my.style.transform = `translate3d(0, ${py.toFixed(1)}px, 0)`;
            const nx = String(Math.round(rtl ? w - px : px)).padStart(4, '0');
            const ny = String(Math.round(py)).padStart(4, '0');
            if (nx !== sx && mxNRef.current) mxNRef.current.textContent = sx = nx;
            if (ny !== sy && myNRef.current) myNRef.current.textContent = sy = ny;
            return false;
        });

        return () => {
            offFrame();
            offMeasure();
            window.removeEventListener('pointermove', onMove);
            document.documentElement.removeEventListener('pointerleave', onLeave);
        };
    }, []);

    return (
        <div className="hm-frame" aria-hidden="true">
            {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
                <span key={c} className={`hm-frame__corner hm-frame__corner--${c}`} data-sh="corner" data-c={c} />
            ))}

            <div className="hm-frame__view" ref={viewRef} data-sh="view-chrome">
                <svg className="hm-ruler hm-ruler--x" ref={rxRef} />
                <svg className="hm-ruler hm-ruler--y" ref={ryRef} />
                <span className="hm-ruler__mark hm-ruler__mark--x" ref={mxRef}>
                    <i />
                    <b ref={mxNRef}>0000</b>
                </span>
                <span className="hm-ruler__mark hm-ruler__mark--y" ref={myRef}>
                    <i />
                    <b ref={myNRef}>0000</b>
                </span>
                <p className="hm-frame__label hm-frame__label--start">
                    {t('home.view.name')} 01 <span className="hm-frame__sep">—</span> {t('home.view.mode')} ·{' '}
                    {t('projects.meta.nts')}
                </p>
                <p className="hm-frame__label hm-frame__label--end">
                    <span dir="ltr">{PLACE.coords}</span> <span className="hm-frame__sep">·</span>{' '}
                    <span dir="ltr">{time} GMT+3</span>
                </p>
            </div>

            <p className="hm-frame__readout" data-sh="readout">
                <span dir="ltr" data-sh-cam>
                    AZ 000° · EL 00°
                </span>
            </p>
        </div>
    );
}
