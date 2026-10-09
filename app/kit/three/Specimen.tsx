'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Color, Vector3 } from 'three';
import { clamp, damp, ease, finePointer, matches, onFrame, onMeasure, pointer, reducedMotion, span, wake } from '../motion';
import Plate from '../Plate';
import { drawingFor, type Kind } from '../draw';
import { disposePiece, inkPiece } from './hlr';
import { MODELS } from './models';
import { createStage, type Stage } from './stage';
import '../kit.css';

/* ===========================================================================
   A specimen — one artifact, on its own, separating into its layers as the
   page scrolls (an exploded assembly). Each layer carries a flag; hovering one
   lifts that layer into the accent and lets the rest recede. The camera leans
   toward the pointer. Without a model (or WebGL) it shows the finished plan.
   =========================================================================== */

export default function Specimen({ slug, kind, title }: { slug: string; kind: Kind; title: string }) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const tagRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const activeRef = useRef(-1);
    const [failed, setFailed] = useState(!MODELS[slug]);
    const layers = MODELS[slug]?.().layers ?? [];

    const setActive = (k: number) => {
        activeRef.current = k;
        tagRefs.current.forEach((el, i) => el?.classList.toggle('is-active', i === k));
        wake();
    };

    useEffect(() => {
        const wrap = wrapRef.current;
        const canvas = canvasRef.current;
        if (!wrap || !canvas || !MODELS[slug]) return;

        let stage: Stage;
        try {
            stage = createStage(canvas);
        } catch {
            setFailed(true);
            return;
        }
        const { camera, renderer, scene } = stage;
        const reduce = reducedMotion();
        const fine = finePointer() && !reduce;
        const model = MODELS[slug]();
        const obj = stage.add(model);
        const tmp = new Color();
        const tmp2 = new Color();
        const v = new Vector3();
        const target = new Vector3(0, 4, 0);
        const hero = (wrap.closest('.pd-hero') as HTMLElement | null) ?? wrap;
        const state = obj.layers.map(() => ({ dim: 1, lit: 0 }));

        let W = 1;
        let H = 1;
        let mobile = false;
        let heroH = 1;
        let track = 0;
        let side = 1;
        let shift = -0.17;
        let dirty = true;
        let az = -0.62;
        let el = 0.42;
        let ex = 0;
        let fade = reduce ? 1 : 0;
        let parked = false;
        const born = performance.now();
        const D = model.radius * 12.5;

        const offMeasure = onMeasure(() => {
            const r = wrap.getBoundingClientRect();
            W = Math.max(1, Math.round(r.width));
            H = Math.max(1, Math.round(r.height));
            mobile = matches('(max-width: 760px)');
            heroH = hero.offsetHeight || window.innerHeight;
            track = heroH - window.innerHeight > 40 ? heroH - window.innerHeight : 0;
            side = document.documentElement.dir === 'rtl' ? -1 : 1;
            stage.size(W, H);
            dirty = true;
        });
        const onLost = (e: Event) => {
            e.preventDefault();
            setFailed(true);
        };
        canvas.addEventListener('webglcontextlost', onLost);

        const offFrame = onFrame(({ y, dt, now }) => {
            const intro = reduce ? 1 : clamp((now - born) / 2000);
            // pinned: progress through the sticky track; in flow: through the hero itself
            const hp = reduce ? 0.6 : track ? span(y, 0, track + window.innerHeight * 0.3) : span(y, 0, heroH * 0.9);
            if (hp >= 1 && intro >= 1 && !reduce) {
                if (!parked) {
                    canvas.style.visibility = 'hidden';
                    wrap.classList.add('is-parked');
                    parked = true;
                }
                return false;
            }
            if (parked) {
                canvas.style.visibility = '';
                wrap.classList.remove('is-parked');
                parked = false;
                dirty = true;
            }
            let busy = intro < 1;
            const recolor = stage.tick(dt);
            if (recolor) busy = dirty = true;

            // separation: a touch apart at rest, fully exploded as the hero leaves
            const exT = reduce ? 0.6 : 0.14 + ease(span(hp, 0.02, 0.7)) * 0.86;
            const nex = reduce ? exT : damp(ex, exT, 6, dt);
            const azT = -0.62 + (fine ? pointer.x * 0.08 : 0);
            const elT = 0.42 + ex * 0.16 + (fine ? -pointer.y * 0.05 : 0);
            const naz = reduce ? azT : damp(az, azT, 3, dt);
            const nel = reduce ? elT : damp(el, elT, 3, dt);
            const nf = (reduce ? 1 : ease(span(intro, 0.1, 0.8))) * (1 - span(hp, track ? 0.82 : 0.62, 0.98));
            // as the copy steps aside, the specimen drifts from the lower right toward centre stage
            const shiftT = mobile ? 0 : -0.17 + ease(span(hp, 0.08, 0.6)) * 0.13;
            const nshift = reduce ? shiftT : damp(shift, shiftT, 6, dt);
            if (Math.abs(nshift - shift) > 1e-5 || dirty) {
                shift = nshift;
                if (mobile) camera.clearViewOffset();
                else camera.setViewOffset(W, H, W * shift * side, -H * 0.06 * (1 - ease(span(hp, 0.08, 0.6))), W, H);
                camera.updateProjectionMatrix();
                dirty = true;
                busy = busy || Math.abs(shiftT - nshift) > 1e-4;
            }
            if (Math.abs(nex - ex) > 1e-5 || Math.abs(naz - az) > 1e-5 || Math.abs(nel - el) > 1e-5 || Math.abs(nf - fade) > 1e-4) {
                busy = busy || Math.abs(exT - nex) > 1e-4 || Math.abs(azT - naz) > 1e-4 || Math.abs(elT - nel) > 1e-4;
                ex = nex;
                az = naz;
                el = nel;
                fade = nf;
                dirty = true;
            }
            // once the copy has gone, the camera closes in a little on the separated layers
            const dolly = 1 - 0.14 * ease(span(hp, 0.1, 0.7));
            const fit = mobile ? 0.92 : Math.max(1, 1.6 / (W / H));
            stage.orbit(target, D * fit * dolly, az, el);

            const active = activeRef.current;
            obj.layers.forEach((l, k) => {
                const s = state[k];
                const dimT = active < 0 || active === k ? 1 : 0.3;
                const litT = active === k ? 1 : 0;
                const nd = reduce ? dimT : damp(s.dim, dimT, 8, dt);
                const nt = reduce ? litT : damp(s.lit, litT, 8, dt);
                if (Math.abs(nd - s.dim) > 1e-4 || Math.abs(nt - s.lit) > 1e-4 || dirty || recolor) {
                    busy = busy || Math.abs(dimT - nd) > 0.002 || Math.abs(litT - nt) > 0.002;
                    s.dim = nd;
                    s.lit = nt;
                    inkPiece(l.piece, stage.shown, fade * s.dim, s.lit, tmp, tmp2);
                    if (l.piece.faces) l.piece.faces.visible = fade > 0.03;
                    dirty = true;
                }
                const [x, yy, z] = l.spec.explode;
                const k2 = ex * 3;
                l.piece.root.position.set(x * k2, yy * k2 - (1 - fade) * 3, z * k2);
            });

            if (dirty) {
                dirty = false;
                renderer.render(scene, camera);
                obj.layers.forEach((l, k) => {
                    const tag = tagRefs.current[k];
                    if (!tag) return;
                    l.piece.root.updateMatrixWorld();
                    v.set(...l.spec.anchor).applyMatrix4(l.piece.root.matrixWorld).project(camera);
                    tag.style.transform = `translate3d(${((v.x * 0.5 + 0.5) * W).toFixed(1)}px, ${((-v.y * 0.5 + 0.5) * H).toFixed(1)}px, 0)`;
                    // flags arrive once the layers have room to be told apart
                    tag.style.opacity = clamp(fade * span(ex, 0.3, 0.6) * (state[k].dim * 0.7 + 0.3)).toFixed(3);
                });
            }
            return busy;
        });

        return () => {
            offFrame();
            offMeasure();
            canvas.removeEventListener('webglcontextlost', onLost);
            obj.pieces.forEach(disposePiece);
            stage.dispose();
        };
    }, [slug]);

    if (failed) {
        return (
            <div className="k-specimen is-fallback" ref={wrapRef}>
                <div className="k-specimen__still">
                    <Plate drawing={drawingFor(slug, kind, title)} build="time" strip={false} probe={false} />
                </div>
            </div>
        );
    }

    return (
        <div className="k-specimen" ref={wrapRef}>
            <canvas ref={canvasRef} className="k-bench__canvas" aria-hidden="true" />
            <ul className="k-bench__tags">
                {layers.map((l, k) => (
                    <li key={l.name}>
                        <button
                            type="button"
                            ref={(node) => {
                                tagRefs.current[k] = node;
                            }}
                            className="k-bench__tag k-specimen__tag"
                            tabIndex={-1}
                            onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(k)}
                            onPointerLeave={(e) => e.pointerType === 'mouse' && setActive(-1)}
                            onClick={() => setActive(activeRef.current === k ? -1 : k)}
                            aria-hidden="true"
                        >
                            <span className="k-bench__tag-n">{String(k + 1).padStart(2, '0')}</span>
                            <span className="k-bench__tag-name">{l.label}</span>
                            <span className="k-bench__tag-note">{l.note}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
