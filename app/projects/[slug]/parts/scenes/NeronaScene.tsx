'use client';

import React, { useRef } from 'react';
import { useLanguage } from '../../../../components/LanguageContext';
import { ease, span } from '../../../../kit/motion';
import Scrub from './Scrub';

/* NERONA — where the inference happens. A frame travels from the camera over
   MIPI CSI-2 into the STM32N6 and is inferred on its NPU, on the board; the cloud
   branch stays cut. Then the second path: a quantized detection model reaching
   the NPU through STM32CubeMX. Both paths as the project describes them. */

type Node = { id: string; x: number; y: number; w: number; h: number; label: string; sub?: string; dashed?: boolean };

export default function NeronaScene({ idx, name }: { idx: string; name: string }) {
    const { t } = useLanguage();
    const frameRef = useRef<SVGGElement>(null);
    const modelRef = useRef<SVGGElement>(null);
    const topRef = useRef<SVGPathElement>(null);
    const botRef = useRef<SVGPathElement>(null);
    const npuRef = useRef<SVGGElement>(null);
    const boxesRef = useRef<SVGGElement>(null);
    const capRefs = useRef<(HTMLParagraphElement | null)[]>([]);

    const nodes: Node[] = [
        { id: 'cam', x: 30, y: 116, w: 112, h: 64, label: t('pd.ne.n.cam') },
        { id: 'csi', x: 196, y: 116, w: 112, h: 64, label: 'MIPI', sub: 'CSI-2' },
        { id: 'mcu', x: 362, y: 92, w: 196, h: 112, label: 'STM32N6' },
        { id: 'out', x: 612, y: 116, w: 158, h: 64, label: t('pd.ne.n.out') },
        { id: 'model', x: 30, y: 300, w: 112, h: 56, label: t('pd.ne.n.model') },
        { id: 'quant', x: 196, y: 300, w: 112, h: 56, label: t('pd.ne.n.quant') },
        { id: 'cube', x: 362, y: 300, w: 196, h: 56, label: 'STM32CubeMX' },
        { id: 'cloud', x: 612, y: 14, w: 158, h: 48, label: t('pd.ne.n.cloud'), dashed: true },
    ];
    const NPU = { x: 452, y: 130, w: 88, h: 56 };
    // the inference path rides y=148; the deployment path rides y=328 then climbs into the NPU
    const top = 'M142 148H196M308 148H362M558 148H612';
    const topPath = 'M86 148H691';
    const botPath = 'M86 328H496V186';

    const apply = (q: number) => {
        const a = ease(span(q, 0.04, 0.5));
        const b = ease(span(q, 0.56, 0.9));
        topRef.current?.style.setProperty('stroke-dashoffset', (1 - a).toFixed(4));
        botRef.current?.style.setProperty('stroke-dashoffset', (1 - b).toFixed(4));
        // the frame travels the top path (86 → 691), the model the bottom one
        const fx = 86 + (691 - 86) * a;
        frameRef.current?.setAttribute('transform', `translate(${fx.toFixed(1)} 148)`);
        if (frameRef.current) frameRef.current.style.opacity = a > 0.001 && a < 0.999 ? '1' : '0';
        const L1 = 496 - 86;
        const L2 = 328 - 186;
        const d = b * (L1 + L2);
        const mx = d <= L1 ? 86 + d : 496;
        const my = d <= L1 ? 328 : 328 - (d - L1);
        modelRef.current?.setAttribute('transform', `translate(${mx.toFixed(1)} ${my.toFixed(1)})`);
        if (modelRef.current) modelRef.current.style.opacity = b > 0.001 && b < 0.999 ? '1' : '0';
        npuRef.current?.toggleAttribute('data-on', (a > 0.55 && a < 0.999) || b >= 0.999);
        if (boxesRef.current) boxesRef.current.style.opacity = span(a, 0.92, 1).toFixed(3);
        const c1 = 1 - span(q, 0.5, 0.56);
        const c2 = span(q, 0.54, 0.62);
        [c1, c2].forEach((v, k) => {
            const el = capRefs.current[k];
            if (!el) return;
            el.style.opacity = v.toFixed(3);
            el.style.transform = `translate3d(0, ${((1 - v) * 10).toFixed(1)}px, 0)`;
        });
    };

    return (
        <Scrub idx={idx} name={name} apply={apply} className="pd-story--nerona">
            <div className="pd-ne">
                <div className="pd-ne__copy">
                    <p className="pd-story__eyebrow">{t('pd.ne.eyebrow')}</p>
                    <p className="pd-story__title">{t('pd.ne.title')}</p>
                    <div className="pd-story__caps">
                        {['pd.ne.cap.1', 'pd.ne.cap.2'].map((k, n) => (
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
                    <dl className="pd-az__read pd-ne__read">
                        <div>
                            <dt>{t('pd.ne.k.where')}</dt>
                            <dd>{t('pd.ne.v.where')}</dd>
                        </div>
                        <div>
                            <dt>{t('pd.ne.k.cloud')}</dt>
                            <dd>{t('pd.ne.v.cloud')}</dd>
                        </div>
                    </dl>
                </div>

                <div className="pd-ne__plot">
                    <svg viewBox="0 0 800 380" className="pd-ne__svg" role="img" aria-label={t('pd.ne.aria')}>
                        {/* static wiring between the nodes, and the cut branch to the cloud */}
                        <path className="pd-ne__wire" d={top} />
                        <path className="pd-ne__wire" d="M142 328H196M308 328H362M496 300V186" />
                        <path className="pd-ne__cut" d="M520 92V38H612" />
                        <path className="pd-ne__cutmark" d="M512 58l16 -12M512 46l16 12" />
                        <text className="pd-ne__note" x={530} y={84}>
                            {t('pd.ne.notneeded')}
                        </text>

                        {/* travelling paths and tokens run beneath the blocks: the blocks' ground
                            fill hides them inside, so a frame visibly passes through each stage */}
                        <path className="pd-ne__path" d={topPath} pathLength={1} ref={topRef} />
                        <path className="pd-ne__path" d={botPath} pathLength={1} ref={botRef} />
                        <g className="pd-ne__token" ref={frameRef} transform="translate(86 148)">
                            <rect x={-7} y={-5} width={14} height={10} />
                        </g>
                        <g className="pd-ne__token is-model" ref={modelRef} transform="translate(86 328)">
                            <path d="M0 -6L6 0L0 6L-6 0z" />
                        </g>

                        {nodes.map((nd) => (
                            <g key={nd.id} className={`pd-ne__node ${nd.dashed ? 'is-dashed' : ''}`}>
                                <rect x={nd.x} y={nd.y} width={nd.w} height={nd.h} />
                                <text className="pd-ne__label" x={nd.x + 12} y={nd.y + 22}>
                                    {nd.label}
                                </text>
                                {nd.sub && (
                                    <text className="pd-ne__sub" x={nd.x + 12} y={nd.y + 38}>
                                        {nd.sub}
                                    </text>
                                )}
                            </g>
                        ))}

                        {/* the NPU inside the MCU — lights while it works */}
                        <g className="pd-ne__npu" ref={npuRef}>
                            <rect x={NPU.x} y={NPU.y} width={NPU.w} height={NPU.h} />
                            <text className="pd-ne__label" x={NPU.x + 10} y={NPU.y + 22}>
                                NPU
                            </text>
                        </g>

                        {/* the output: a frame with its detections */}
                        <g className="pd-ne__boxes" ref={boxesRef}>
                            <rect className="pd-ne__det" x={628} y={140} width={30} height={26} />
                            <rect className="pd-ne__det" x={672} y={134} width={22} height={34} />
                            <rect className="pd-ne__det" x={712} y={144} width={40} height={20} />
                        </g>
                    </svg>
                </div>
            </div>
        </Scrub>
    );
}
