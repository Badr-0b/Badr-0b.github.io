'use client';

import React, { useEffect, useRef } from 'react';
import {
    clamp,
    damp,
    ease,
    finePointer,
    lerp,
    onFrame,
    onMeasure,
    pointer,
    reducedMotion,
    span,
    wake,
} from '../../kit/motion';

type Tag = { name: string; note: string };

/* Fixed camera for the exploded view — a slightly off-isometric, photographic angle. */
const PERSPECTIVE = 1800;
const BASE_RX = 58;
const BASE_RZ = -42;
const DEG = Math.PI / 180;

/**
 * The hero mark — an exploded stack of the three layers Badr works across:
 * silicon at the base, the board above it, firmware on top. Hairline plates in
 * real CSS 3D. It assembles on load, separates as the hero scrolls away, leans
 * toward the pointer, and lifts a layer when its callout is hovered. The
 * callouts track each plate's projected corner, so the leader lines always land.
 * Decorative (aria-hidden): every fact here is also stated in the page copy.
 */
export default function Stack({ tags }: { tags: Tag[] }) {
    const rootRef = useRef<HTMLDivElement>(null);
    const floatRef = useRef<HTMLDivElement>(null);
    const rigRef = useRef<HTMLDivElement>(null);
    const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
    const tagRefs = useRef<(HTMLLIElement | null)[]>([]);
    const activeRef = useRef(-1);

    const setActive = (k: number) => {
        activeRef.current = k;
        layerRefs.current.forEach((el, i) => el?.classList.toggle('is-active', i === k));
        tagRefs.current.forEach((el, i) => el?.classList.toggle('is-active', i === k));
        rootRef.current?.classList.toggle('has-active', k >= 0);
        wake();
    };

    useEffect(() => {
        const root = rootRef.current;
        const float = floatRef.current;
        const rig = rigRef.current;
        if (!root || !float || !rig) return;
        const layers = layerRefs.current.filter(Boolean) as HTMLDivElement[];
        const tagEls = tagRefs.current.filter(Boolean) as HTMLLIElement[];
        const reduce = reducedMotion();
        const fine = finePointer() && !reduce;
        const born = performance.now();

        let S = 0;
        let heroH = 1;
        let dir = 1;
        let lead = 28;
        let gap = -1;
        let tiltX = 0;
        let tiltY = 0;
        let hidden = false;
        const lift = layers.map(() => 0);
        const dim = layers.map(() => 1);

        root.classList.add('is-live');

        const offMeasure = onMeasure(() => {
            S = layers[0]?.offsetWidth || 0;
            const hero = root.closest('.ab-hero') as HTMLElement | null;
            heroH = hero?.offsetHeight || window.innerHeight;
            dir = document.documentElement.dir === 'rtl' ? -1 : 1;
            lead = parseFloat(getComputedStyle(root).getPropertyValue('--lead')) || 28;
            hidden = false;
        });

        const offFrame = onFrame(({ y, dt, now }) => {
            if (!S) return false;
            const intro = reduce ? 1 : clamp((now - born) / 2100);
            const ei = ease(intro);
            const hp = reduce ? 0 : span(y, 0, heroH * 0.9);

            // fully scrolled past: park it and let the loop sleep
            if (hp >= 1 && intro >= 1) {
                if (!hidden) {
                    float.style.opacity = '0';
                    hidden = true;
                }
                return false;
            }
            hidden = false;

            // separation: assembles on load (0 → rest), then explodes with the scroll (linear tie)
            const rest = S * 0.16;
            const max = S * 0.36;
            const gapTarget = lerp(0, rest, ei) + (max - rest) * hp;
            gap = gap < 0 || reduce ? gapTarget : damp(gap, gapTarget, 10, dt);

            // the domain leans toward you — small, weighted
            const tyTarget = fine ? pointer.x * 7 : 0;
            const txTarget = fine ? -pointer.y * 5 : 0;
            tiltY = damp(tiltY, tyTarget, 3.2, dt);
            tiltX = damp(tiltX, txTarget, 3.2, dt);

            const rx = BASE_RX + tiltX;
            const rz = dir * (BASE_RZ + lerp(-18, 0, ei));
            rig.style.transform = `rotateY(${tiltY.toFixed(3)}deg) rotateX(${rx.toFixed(3)}deg) rotateZ(${rz.toFixed(3)}deg)`;
            float.style.transform = `translate3d(0, ${(y * 0.16).toFixed(1)}px, 0)`;
            float.style.opacity = (1 - span(hp, 0.55, 1)).toFixed(3);

            const crx = Math.cos(rx * DEG);
            const srx = Math.sin(rx * DEG);
            const crz = Math.cos(rz * DEG);
            const srz = Math.sin(rz * DEG);
            const cty = Math.cos(tiltY * DEG);
            const sty = Math.sin(tiltY * DEG);
            const h = S / 2;
            const active = activeRef.current;
            let busy = intro < 1 || Math.abs(gapTarget - gap) > 0.05;
            busy = busy || Math.abs(tyTarget - tiltY) > 0.01 || Math.abs(txTarget - tiltX) > 0.01;

            for (let k = 0; k < layers.length; k++) {
                const liftTarget = active === k ? S * 0.07 : 0;
                const dimTarget = active < 0 || active === k ? 1 : 0.3;
                lift[k] = reduce ? liftTarget : damp(lift[k], liftTarget, 9, dt);
                dim[k] = reduce ? dimTarget : damp(dim[k], dimTarget, 9, dt);
                busy = busy || Math.abs(liftTarget - lift[k]) > 0.05 || Math.abs(dimTarget - dim[k]) > 0.005;

                const z = k * gap + lift[k];
                const born_k = reduce ? 1 : ease(span(intro, k * 0.12, k * 0.12 + 0.62));
                layers[k].style.transform = `translate3d(0, 0, ${z.toFixed(2)}px)`;
                layers[k].style.opacity = (born_k * dim[k]).toFixed(3);

                // project the plate's four corners exactly as CSS does, pick the outer one
                let bx = dir > 0 ? Infinity : -Infinity;
                let by = 0;
                for (let c = 0; c < 4; c++) {
                    const cx = c & 1 ? h : -h;
                    const cy = c & 2 ? h : -h;
                    const x1 = cx * crz - cy * srz;
                    const y1 = cx * srz + cy * crz;
                    const y2 = y1 * crx - z * srx;
                    const z2 = y1 * srx + z * crx;
                    const x3 = x1 * cty + z2 * sty;
                    const z3 = -x1 * sty + z2 * cty;
                    const s = PERSPECTIVE / (PERSPECTIVE - z3);
                    const sx = x3 * s;
                    if (dir > 0 ? sx < bx : sx > bx) {
                        bx = sx;
                        by = y2 * s;
                    }
                }
                const tag = tagEls[k];
                if (tag) {
                    const tx = dir > 0 ? bx - lead : bx + lead;
                    tag.style.transform =
                        dir > 0
                            ? `translate3d(${tx.toFixed(1)}px, ${by.toFixed(1)}px, 0) translate(-100%, -50%)`
                            : `translate3d(${tx.toFixed(1)}px, ${by.toFixed(1)}px, 0) translate(0, -50%)`;
                    // dimmed callouts recede with their plates, so a lifted layer reads alone
                    tag.style.opacity = (born_k * dim[k]).toFixed(3);
                }
            }
            return busy;
        });

        return () => {
            offFrame();
            offMeasure();
            root.classList.remove('is-live');
        };
    }, []);

    return (
        <div className="ab-stack" ref={rootRef} aria-hidden="true">
            <div className="ab-stack__float" ref={floatRef}>
                <div className="ab-stack__rig" ref={rigRef}>
                    <div className="ab-layer ab-layer--silicon" ref={(el) => { layerRefs.current[0] = el; }}>
                        <SiliconFace />
                    </div>
                    <div className="ab-layer ab-layer--board" ref={(el) => { layerRefs.current[1] = el; }}>
                        <BoardFace />
                    </div>
                    <div className="ab-layer ab-layer--firmware" ref={(el) => { layerRefs.current[2] = el; }}>
                        <FirmwareFace />
                    </div>
                </div>
                <ul className="ab-stack__tags">
                    {tags.map((tag, k) => (
                        <li
                            key={k}
                            ref={(el) => {
                                tagRefs.current[k] = el;
                            }}
                            className="ab-stack__tag"
                            onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(k)}
                            onPointerLeave={(e) => e.pointerType === 'mouse' && setActive(-1)}
                            onClick={() => setActive(activeRef.current === k ? -1 : k)}
                        >
                            <span className="ab-stack__tag-k">{String(k + 1).padStart(2, '0')}</span>
                            <span className="ab-stack__tag-name">{tag.name}</span>
                            <span className="ab-stack__tag-note">{tag.note}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

/* ---------------------------------------------------------------------------
   Plate faces — 400×400 drawings in currentColor, 1px non-scaling strokes.
   --------------------------------------------------------------------------- */

/** Silicon die: seal ring, pad frame, standard-cell rows, a register-file macro. */
function SiliconFace() {
    const pads: React.ReactNode[] = [];
    for (let i = 0; i < 9; i++) {
        const c = 46 + i * 38.5;
        pads.push(
            <rect key={`t${i}`} x={c - 6} y={20} width={12} height={12} />,
            <rect key={`b${i}`} x={c - 6} y={368} width={12} height={12} />,
            <rect key={`l${i}`} x={20} y={c - 6} width={12} height={12} />,
            <rect key={`r${i}`} x={368} y={c - 6} width={12} height={12} />
        );
    }
    let rows = '';
    for (let r = 0; r < 18; r++) {
        const y = 80 + r * 12;
        rows += `M78 ${y}H${y >= 84 && y <= 180 ? 186 : 322}`;
    }
    return (
        <svg className="ab-layer__svg" viewBox="0 0 400 400" focusable="false">
            <rect className="ab-layer__edge" x="0.5" y="0.5" width="399" height="399" pathLength={1} />
            <rect className="ab-layer__fine" x="11" y="11" width="378" height="378" />
            <g className="ab-layer__mid">{pads}</g>
            <rect className="ab-layer__mid" x="62" y="62" width="276" height="276" />
            <path className="ab-layer__faint" d={rows} />
            <rect className="ab-layer__mid" x="198" y="84" width="118" height="96" />
            <path className="ab-layer__faint" d="M227.5 84V180M257 84V180M286.5 84V180M198 116H316M198 148H316" />
            <text className="ab-layer__mark" x="78" y="318">
                CLEAVE · RV32I
            </text>
        </svg>
    );
}

/** Board: outline, mounting holes, a QFN, 45°-routed traces ending in vias, silkscreen. */
function BoardFace() {
    let ticks = '';
    for (let i = 0; i < 7; i++) {
        const c = 167 + i * 11;
        ticks += `M${c} 148V156M${c} 244V252M148 ${c}H156M244 ${c}H252`;
    }
    const vias: [number, number][] = [
        [318, 74],
        [332, 318],
        [92, 328],
        [80, 96],
        [258, 80],
        [288, 286],
    ];
    return (
        <svg className="ab-layer__svg" viewBox="0 0 400 400" focusable="false">
            <rect className="ab-layer__edge" x="0.5" y="0.5" width="399" height="399" rx="18" pathLength={1} />
            <g className="ab-layer__mid">
                <circle cx="28" cy="28" r="8" />
                <circle cx="372" cy="28" r="8" />
                <circle cx="28" cy="372" r="8" />
                <circle cx="372" cy="372" r="8" />
                <rect x="156" y="156" width="88" height="88" />
                <path d={ticks} />
            </g>
            <path
                className="ab-layer__trace"
                d="M252 178H286L318 146V74M252 200H300L332 232V318M222 252V296L190 328H92M148 189H112L80 157V96M178 148V108L206 80H258M252 222H270L288 240V286"
            />
            <g className="ab-layer__mid">
                {vias.map(([x, y]) => (
                    <circle key={`${x}-${y}`} cx={x} cy={y} r={4.5} />
                ))}
            </g>
            <text className="ab-layer__mark" x="158" y="141">
                U1
            </text>
            <text className="ab-layer__mark" x="44" y="389">
                BO—01 · REV A
            </text>
        </svg>
    );
}

/** Firmware: a soft (dashed) plate carrying a code minimap; one live line. */
function FirmwareFace() {
    const code: [number, number][] = [
        [0, 96], [0, 148], [1, 188], [1, 132], [2, 212], [2, 164], [2, 104], [1, 72],
        [1, 150], [2, 190], [2, 120], [1, 58], [0, 28], [0, 0], [0, 136], [1, 176],
    ];
    let lines = '';
    let gutter = '';
    code.forEach(([indent, len], i) => {
        const y = 64 + i * 19;
        gutter += `M24 ${y}H30`;
        if (len && i !== 4) lines += `M${44 + indent * 22} ${y}H${44 + indent * 22 + len}`;
    });
    return (
        <svg className="ab-layer__svg" viewBox="0 0 400 400" focusable="false">
            <rect className="ab-layer__edge ab-layer__edge--soft" x="0.5" y="0.5" width="399" height="399" />
            <text className="ab-layer__mark" x="44" y="38">
                main.c
            </text>
            <path className="ab-layer__faint" d={gutter} />
            <path className="ab-layer__mid" d={lines} />
            <path className="ab-layer__hot" d="M88 140H300" />
        </svg>
    );
}
