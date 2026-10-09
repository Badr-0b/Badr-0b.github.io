'use client';

import React, { useMemo, useRef, useState, type CSSProperties } from 'react';
import { useLanguage } from '../../../../components/LanguageContext';
import { ease, span } from '../../../../kit/motion';
import Scrub from './Scrub';

/* AZIMUTH — the GNSS-dropout fallback, played out. A route across a map: with a
   fix, the estimate rides the route; when the fix drops, the IMU dead-reckons and
   the uncertainty grows; when it returns, the estimate is corrected. Illustrative
   geometry — the behaviour is the plan the project delivered, not a field log. */

const W = 800;
const H = 440;
const N = 160;
const DROP: [number, number] = [0.36, 0.66];
const SETTLE = 0.78;

type P = [number, number];

function bez(a: P, b: P, c: P, d: P, t: number): P {
    const u = 1 - t;
    return [
        u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
        u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
    ];
}

function geometry() {
    const A: P = [52, 364];
    const B: P = [300, 420];
    const C: P = [430, 96];
    const D: P = [748, 118];
    const route: P[] = [];
    const est: P[] = [];
    const drift: number[] = [];
    const radius: number[] = [];
    for (let i = 0; i <= N; i++) {
        const t = i / N;
        const p = bez(A, B, C, D, t);
        const q = bez(A, B, C, D, Math.min(1, t + 0.002));
        const len = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
        const nx = -(q[1] - p[1]) / len;
        const ny = (q[0] - p[0]) / len;
        let d = 0;
        let r = 5;
        if (t >= DROP[0] && t < DROP[1]) {
            const k = (t - DROP[0]) / (DROP[1] - DROP[0]);
            d = 28 * k * k;
            r = 5 + 30 * k;
        } else if (t >= DROP[1] && t < SETTLE) {
            const k = ease((t - DROP[1]) / (SETTLE - DROP[1]));
            d = 28 * (1 - k);
            r = 35 - 30 * Math.min(1, k * 1.6);
        }
        route.push(p);
        est.push([p[0] + nx * d, p[1] + ny * d]);
        drift.push(d);
        radius.push(Math.max(5, r));
    }
    // GNSS fixes: every sixth sample outside the dropout, with a little receiver noise
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5) * 6;
    const fixes: { p: P; t: number }[] = [];
    for (let i = 3; i <= N; i += 6) {
        const t = i / N;
        if (t >= DROP[0] && t < DROP[1]) continue;
        fixes.push({ p: [route[i][0] + rnd(), route[i][1] + rnd()], t });
    }
    // cumulative arc length along the estimate, so the line is drawn exactly up to its head
    const cum: number[] = [0];
    for (let i = 1; i <= N; i++) cum.push(cum[i - 1] + Math.hypot(est[i][0] - est[i - 1][0], est[i][1] - est[i - 1][1]));
    const f = (pts: P[]) => 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L');
    return { route, est, radius, fixes, cum, routeD: f(route), estD: f(est) };
}

export default function AzimuthScene({ idx, name }: { idx: string; name: string }) {
    const { t } = useLanguage();
    const g = useMemo(geometry, []);
    const estRef = useRef<SVGPathElement>(null);
    const headRef = useRef<SVGGElement>(null);
    const ringRef = useRef<SVGCircleElement>(null);
    const arrowRef = useRef<SVGPathElement>(null);
    const fixRefs = useRef<(SVGPathElement | null)[]>([]);
    const capRefs = useRef<(HTMLParagraphElement | null)[]>([]);
    const rootRef = useRef<HTMLDivElement>(null);
    const uncRef = useRef<HTMLSpanElement>(null);
    const phaseRef = useRef<'fix' | 'drop' | 'back'>('fix');
    const [phase, setPhase] = useState<'fix' | 'drop' | 'back'>('fix');

    const x0 = g.route[Math.round(DROP[0] * N)][0];
    const x1 = g.route[Math.round(DROP[1] * N)][0];

    const apply = (q: number) => {
        const tt = Math.min(1, q * 1.08);
        const i = Math.min(N, Math.round(tt * N));
        const [hx, hy] = g.est[i];
        const j = Math.min(N, i + 1);
        const ang = (Math.atan2(g.est[j][1] - g.est[Math.max(0, j - 2)][1], g.est[j][0] - g.est[Math.max(0, j - 2)][0]) * 180) / Math.PI;
        estRef.current?.style.setProperty('stroke-dashoffset', (1 - g.cum[i] / g.cum[N]).toFixed(4));
        headRef.current?.setAttribute('transform', `translate(${hx.toFixed(1)} ${hy.toFixed(1)})`);
        arrowRef.current?.setAttribute('transform', `rotate(${ang.toFixed(1)})`);
        ringRef.current?.setAttribute('r', g.radius[i].toFixed(1));
        g.fixes.forEach((fx, k) => {
            const el = fixRefs.current[k];
            if (el) el.style.opacity = fx.t <= tt ? '1' : '0';
        });
        const next = tt < DROP[0] ? 'fix' : tt < DROP[1] ? 'drop' : 'back';
        if (next !== phaseRef.current) {
            phaseRef.current = next;
            setPhase(next);
        }
        if (uncRef.current) uncRef.current.style.transform = `scaleX(${((g.radius[i] - 5) / 30).toFixed(3)})`;
        // captions cross-fade with the phases
        const caps = [1 - span(tt, DROP[0] - 0.06, DROP[0]), span(tt, DROP[0] - 0.02, DROP[0] + 0.04) * (1 - span(tt, DROP[1] - 0.04, DROP[1] + 0.02)), span(tt, DROP[1], DROP[1] + 0.06)];
        caps.forEach((v, k) => {
            const el = capRefs.current[k];
            if (!el) return;
            el.style.opacity = v.toFixed(3);
            el.style.transform = `translate3d(0, ${((1 - v) * 10).toFixed(1)}px, 0)`;
        });
    };

    const grid: string[] = [];
    for (let x = 40; x < W; x += 40) grid.push(`M${x} 20V${H - 20}`);
    for (let y = 20; y < H; y += 40) grid.push(`M20 ${y}H${W - 20}`);

    const sensors: { k: string; role: string; cls: string }[] = [
        { k: 'GNSS', role: t('pd.az.role.gnss'), cls: 'is-gnss' },
        { k: t('pd.az.s.mag'), role: t('pd.az.role.mag'), cls: 'is-mag' },
        { k: t('pd.az.s.acc'), role: t('pd.az.role.acc'), cls: 'is-imu' },
        { k: t('pd.az.s.gyro'), role: t('pd.az.role.gyro'), cls: 'is-imu' },
    ];

    return (
        <Scrub idx={idx} name={name} apply={apply} className="pd-story--azimuth">
            <div className="pd-az" ref={rootRef} data-phase={phase}>
                <div className="pd-az__copy">
                    <p className="pd-story__eyebrow">{t('pd.az.eyebrow')}</p>
                    <p className="pd-story__title">{t('pd.az.title')}</p>
                    <div className="pd-story__caps">
                        {['pd.az.cap.1', 'pd.az.cap.2', 'pd.az.cap.3'].map((k, n) => (
                            <p
                                key={k}
                                className="pd-story__cap"
                                ref={(el) => {
                                    capRefs.current[n] = el;
                                }}
                            >
                                {t(k)}
                            </p>
                        ))}
                    </div>
                    <dl className="pd-az__read">
                        <div>
                            <dt>{t('pd.az.k.src')}</dt>
                            <dd>
                                <span key={phase === 'drop' ? 'imu' : 'gnss'} className="pd-az__val">
                                    {t(phase === 'drop' ? 'pd.az.src.imu' : 'pd.az.src.gnss')}
                                </span>
                            </dd>
                        </div>
                        <div>
                            <dt>{t('pd.az.k.pos')}</dt>
                            <dd>
                                <span key={phase === 'drop' ? 'est' : 'fix'} className="pd-az__val">
                                    {t(phase === 'drop' ? 'pd.az.pos.est' : 'pd.az.pos.fix')}
                                </span>
                            </dd>
                        </div>
                        <div>
                            <dt>{t('pd.az.k.unc')}</dt>
                            <dd>
                                <span className="pd-az__bar" aria-hidden="true">
                                    <span className="pd-az__bar-fill" ref={uncRef} />
                                </span>
                            </dd>
                        </div>
                    </dl>
                </div>

                <div className="pd-az__plot">
                    <svg viewBox={`0 0 ${W} ${H}`} className="pd-az__svg" role="img" aria-label={t('pd.az.aria')}>
                        <path className="pd-az__grid" d={grid.join('')} />
                        <rect className="pd-az__band" x={x0} y={20} width={x1 - x0} height={H - 40} />
                        <path className="pd-az__hatch" d={hatchD(x0, 20, x1 - x0, H - 40, 14)} />
                        <text className="pd-az__label" x={x0 + 8} y={38}>
                            {t('pd.az.dropout')}
                        </text>
                        <path className="pd-az__route" d={g.routeD} />
                        {g.fixes.map((fx, k) => (
                            <path
                                key={k}
                                className="pd-az__fix"
                                d={`M${fx.p[0].toFixed(1)} ${fx.p[1].toFixed(1)}h0`}
                                ref={(el) => {
                                    fixRefs.current[k] = el;
                                }}
                            />
                        ))}
                        <path className="pd-az__est" d={g.estD} pathLength={1} ref={estRef} />
                        <g ref={headRef} transform={`translate(${g.est[0][0]} ${g.est[0][1]})`}>
                            <circle className="pd-az__ring" r={5} ref={ringRef} />
                            <path className="pd-az__arrow" d="M-5 -4L6 0L-5 4z" ref={arrowRef} />
                        </g>
                        <text className="pd-az__label pd-az__label--end" x={W - 24} y={H - 30}>
                            {t('pd.az.illustrative')}
                        </text>
                    </svg>
                    <ul className="pd-az__sensors">
                        {sensors.map((s, k) => (
                            <li key={k} className={`pd-az__sensor ${s.cls}`} style={{ '--i': k } as CSSProperties}>
                                <span className="pd-az__sensor-k">{s.k}</span>
                                <span className="pd-az__sensor-role">{s.role}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </Scrub>
    );
}

function hatchD(x: number, y: number, w: number, h: number, step: number) {
    let d = '';
    for (let s = -h; s < w; s += step) {
        const xa = Math.max(x, x + s);
        const ya = y + (xa - (x + s));
        const xb = Math.min(x + w, x + s + h);
        const yb = y + (xb - (x + s));
        if (xb - xa > 0.5) d += `M${xa.toFixed(1)} ${ya.toFixed(1)}L${xb.toFixed(1)} ${yb.toFixed(1)}`;
    }
    return d;
}
