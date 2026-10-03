'use client';

import React, { useEffect, useRef, type CSSProperties } from 'react';
import { useLanguage } from '../../components/LanguageContext';
import { HIL } from '../about.data';
import { damp, ease, lerp, matches, onFrame, onMeasure, reducedMotion, span } from '../motion';

const fmt = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
};

const SPEEDUP = Math.round(HIL.before / HIL.after);

/**
 * Lear, told with its real numbers. A validation pass ran its test cases one after
 * another, and a hang could stall it for 5.5 hours; the runner was rebuilt to execute
 * in parallel and a pass now takes ~5 minutes. As you scroll: the hang collapses, the
 * cases re-stack into parallel lanes, the pass-time readout falls 05:30:00 → 00:05:00
 * and a proportional bar shrinks to the sliver it now is.
 *
 * Desktop: a pinned scene (CSS sticky over a tall track, scrubbed — never scroll-jacked).
 * Mobile: the same scrub, in flow. Reduced motion / no JS: the finished state, statically.
 */
export default function FieldScene() {
    const { t } = useLanguage();
    const trackRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const lanesRef = useRef<HTMLDivElement>(null);
    const caseRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const numRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const hangRef = useRef<HTMLSpanElement>(null);
    const hangLabelRef = useRef<HTMLSpanElement>(null);
    const timerRef = useRef<HTMLSpanElement>(null);
    const barRef = useRef<HTMLSpanElement>(null);
    const seqRef = useRef<HTMLSpanElement>(null);
    const parRef = useRef<HTMLSpanElement>(null);
    const beforeRef = useRef<HTMLParagraphElement>(null);
    const afterRef = useRef<HTMLParagraphElement>(null);
    const fasterRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const track = trackRef.current;
        const stage = stageRef.current;
        const lanes = lanesRef.current;
        const hang = hangRef.current;
        const hangLabel = hangLabelRef.current;
        const timer = timerRef.current;
        const bar = barRef.current;
        if (!track || !stage || !lanes || !hang || !hangLabel || !timer || !bar) return;
        if (reducedMotion()) return; // the static markup already is the finished state

        const cases = caseRefs.current.filter(Boolean) as HTMLSpanElement[];
        const nums = numRefs.current.filter(Boolean) as HTMLSpanElement[];
        const N = HIL.cases.length;
        const GAP = 6;
        const BAR_H = 6;
        const LANE = 14;

        stage.classList.add('is-live');

        let pinned = false;
        let rtl = false;
        let trackTop = 0;
        let trackH = 0;
        let stageTop = 0;
        let W = 0;
        let H = 0;
        let unit = 0;
        let hangW = 0;
        let hangX = 0;
        const baseX: number[] = [];
        let p = -1;
        let lastSec = -1;

        const apply = (q: number) => {
            const hp = ease(span(q, 0.1, 0.38)); // the hang collapses
            const tq = span(q, 0.1, 0.86); // pass time falls (linear to scroll)
            const ySeq = (H - BAR_H) / 2;
            const stackH = (N - 1) * LANE + BAR_H;
            const yTop = (H - stackH) / 2;
            const place = (x: number, w: number) => (rtl ? W - x - w : x);

            for (let i = 0; i < N; i++) {
                const s = ease(span(q, 0.4 + i * 0.03, 0.66 + i * 0.03)); // re-stack, staggered
                const w = HIL.cases[i] * unit;
                const xs = baseX[i] - (i > HIL.hangAfter ? (hangW + GAP) * hp : 0);
                const x = lerp(xs, 0, s);
                const y = lerp(ySeq, yTop + i * LANE, s);
                cases[i].style.transform = `translate3d(${place(x, w).toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
                // lane labels are parked at their final spots (see measure) and only fade in
                if (nums[i]) nums[i].style.opacity = span(q, 0.72 + i * 0.012, 0.86 + i * 0.012).toFixed(3);
            }

            const hangHeight = 22;
            hang.style.transform = `translate3d(${place(hangX, hangW).toFixed(1)}px, ${(ySeq - (hangHeight - BAR_H) / 2).toFixed(1)}px, 0) scaleX(${(1 - hp).toFixed(4)})`;
            hang.style.opacity = (1 - hp).toFixed(3);
            hangLabel.style.opacity = (1 - span(q, 0.1, 0.22)).toFixed(3);

            const sec = Math.round(Math.exp(lerp(Math.log(HIL.before), Math.log(HIL.after), tq)));
            if (sec !== lastSec) {
                lastSec = sec;
                timer.textContent = fmt(sec);
            }
            bar.style.transform = `scaleX(${(sec / HIL.before).toFixed(5)})`;

            const par = span(q, 0.44, 0.6);
            if (seqRef.current) seqRef.current.style.opacity = (0.32 + 0.68 * (1 - par)).toFixed(3);
            if (parRef.current) parRef.current.style.opacity = (0.32 + 0.68 * par).toFixed(3);
            stage.classList.toggle('is-parallel', par > 0.5);

            const b = span(q, 0.34, 0.47);
            const a = span(q, 0.53, 0.67);
            if (beforeRef.current) {
                beforeRef.current.style.opacity = (1 - b).toFixed(3);
                beforeRef.current.style.transform = `translate3d(0, ${(-14 * b).toFixed(1)}px, 0)`;
            }
            if (afterRef.current) {
                afterRef.current.style.opacity = a.toFixed(3);
                afterRef.current.style.transform = `translate3d(0, ${(14 * (1 - a)).toFixed(1)}px, 0)`;
            }
            if (fasterRef.current) fasterRef.current.style.opacity = span(q, 0.84, 0.95).toFixed(3);
        };

        const offMeasure = onMeasure(() => {
            pinned = matches('(min-width: 900px)');
            rtl = document.documentElement.dir === 'rtl';
            const sy = window.scrollY;
            trackTop = track.getBoundingClientRect().top + sy;
            trackH = track.offsetHeight;
            stageTop = pinned ? trackTop : stage.getBoundingClientRect().top + sy;
            W = lanes.clientWidth;
            H = lanes.clientHeight;
            hangW = W * 0.3;
            const sum = HIL.cases.reduce((acc, d) => acc + d, 0);
            unit = Math.max(1.5, (W - hangW - GAP * N) / sum);
            let x = 0;
            for (let i = 0; i < N; i++) {
                baseX[i] = x;
                if (cases[i]) cases[i].style.width = `${(HIL.cases[i] * unit).toFixed(1)}px`;
                x += HIL.cases[i] * unit + GAP;
                if (i === HIL.hangAfter) {
                    hangX = x;
                    x += hangW + GAP;
                }
            }
            hang.style.width = `${hangW.toFixed(1)}px`;
            // lane labels sit just past the end of each bar in its final, parallel lane
            // (anchored inline-start, so RTL mirrors by flipping the offset)
            const stackTop = (H - ((N - 1) * LANE + BAR_H)) / 2;
            for (let i = 0; i < N; i++) {
                if (!nums[i]) continue;
                const nx = HIL.cases[i] * unit + 10;
                const ny = stackTop + i * LANE + BAR_H / 2;
                nums[i].style.transform = `translate3d(${(rtl ? -nx : nx).toFixed(1)}px, ${ny.toFixed(1)}px, 0) translateY(-50%)`;
            }
            // the label sits inside the hang's box (a sibling, so the collapse never squashes it)
            const labelX = (rtl ? W - hangX - hangW : hangX) + 10;
            hangLabel.style.transform = `translate3d(${labelX.toFixed(1)}px, ${(H / 2).toFixed(1)}px, 0) translateY(-50%)`;
            if (p >= 0) apply(p);
        });

        const offFrame = onFrame(({ y, vh, dt }) => {
            if (!W) return false;
            const target = pinned
                ? span(y, trackTop, trackTop + trackH - vh)
                : span(y, stageTop - vh * 0.82, stageTop - vh * 0.18);
            const prev = p;
            p = p < 0 ? target : damp(p, target, 7, dt);
            if (prev >= 0 && Math.abs(p - prev) < 0.00015) return false;
            apply(p);
            return Math.abs(target - p) > 0.0004;
        });

        return () => {
            offFrame();
            offMeasure();
            stage.classList.remove('is-live', 'is-parallel');
        };
    }, []);

    return (
        <div className="ab-hil" ref={trackRef}>
            <div className="ab-hil__stage" ref={stageRef}>
                <div className="ab-hil__head">
                    <p className="ab-hil__eyebrow">{t('about.hil.eyebrow')}</p>
                    <p className="ab-hil__title">{t('about.hil.title')}</p>
                </div>

                <div className="ab-hil__modes" aria-hidden="true">
                    <span className="ab-hil__mode ab-hil__mode--seq" ref={seqRef}>
                        <i className="ab-hil__mode-mark" />
                        {t('about.hil.seq')}
                    </span>
                    <span className="ab-hil__mode ab-hil__mode--par" ref={parRef}>
                        <i className="ab-hil__mode-mark" />
                        {t('about.hil.par')}
                    </span>
                    <span className="ab-hil__axis">t</span>
                </div>

                <div className="ab-hil__lanes" ref={lanesRef} role="img" aria-label={t('about.hil.aria')}>
                    {HIL.cases.map((d, i) => (
                        <span
                            key={i}
                            className="ab-hil__case"
                            style={{ '--d': d } as CSSProperties}
                            ref={(el) => {
                                caseRefs.current[i] = el;
                            }}
                        />
                    ))}
                    <span className="ab-hil__hang" ref={hangRef} />
                    <span className="ab-hil__hang-label" ref={hangLabelRef}>
                        {t('about.hil.hang')} — ≤ 5.5 h
                    </span>
                    <span className="ab-hil__nums" aria-hidden="true">
                        {HIL.cases.map((_, i) => (
                            <span
                                key={i}
                                className="ab-hil__num"
                                ref={(el) => {
                                    numRefs.current[i] = el;
                                }}
                            >
                                {String(i + 1).padStart(2, '0')}
                            </span>
                        ))}
                    </span>
                </div>

                <div className="ab-hil__readout">
                    <div className="ab-hil__time">
                        <span className="ab-hil__time-k">{t('about.hil.time')}</span>
                        <span className="ab-hil__time-v" ref={timerRef}>
                            {fmt(HIL.after)}
                        </span>
                        <span className="ab-hil__faster" ref={fasterRef}>
                            ≈ {SPEEDUP}× {t('about.hil.faster')}
                        </span>
                    </div>
                    <span className="ab-hil__bar" aria-hidden="true">
                        <span className="ab-hil__bar-fill" ref={barRef} />
                    </span>
                    <div className="ab-hil__captions">
                        <p className="ab-hil__cap ab-hil__cap--before" ref={beforeRef}>
                            <span className="ab-hil__cap-k">{t('about.hil.label.before')}</span>
                            {t('about.hil.before')}
                        </p>
                        <p className="ab-hil__cap ab-hil__cap--after" ref={afterRef}>
                            <span className="ab-hil__cap-k">{t('about.hil.label.after')}</span>
                            {t('about.hil.after')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
