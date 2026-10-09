'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Color, Raycaster, Vector2, Vector3, type Mesh } from 'three';
import { useLanguage } from '../../components/LanguageContext';
import { projects } from '../../projects/projects.data';
import { clamp, damp, ease, finePointer, matches, onFrame, onMeasure, pointer, reducedMotion, scrollToId, span, wake } from '../motion';
import Plate from '../Plate';
import { drawingFor } from '../draw';
import { disposePiece, inkPiece } from './hlr';
import { MODELS } from './models';
import { createStage, type Stage } from './stage';
import '../kit.css';

/* ===========================================================================
   The bench — the index hero's objects. The three artifacts as hidden-line
   renders, set at different depths and heights like a composed key visual.
   The camera leans toward the pointer; hovering a flag (or an object) lifts it,
   turns its edges to the accent and lets the others recede; clicking goes to its
   sheet. As the hero scrolls away the camera tilts toward plan view — the 3D
   render turning into the drawings below it. Renders on demand, never idles.
   =========================================================================== */

type Spot = { pos: [number, number, number]; ry: number; rise: number };

/** desktop: a diagonal constellation in the left two-thirds; mobile: a tighter cluster */
const DESKTOP: Record<string, Spot> = {
    cleave: { pos: [62, 12, -24], ry: 0.34, rise: 34 },
    nerona: { pos: [-25, 0, -23], ry: 0.08, rise: 14 },
    azimuth: { pos: [-21, 4, 57], ry: -0.2, rise: 22 },
};
const MOBILE: Record<string, Spot> = {
    cleave: { pos: [38, 12, -30], ry: 0.34, rise: 26 },
    nerona: { pos: [-20, 0, -18], ry: 0.08, rise: 10 },
    azimuth: { pos: [-8, 4, 46], ry: -0.2, rise: 16 },
};

const BASE_AZ = -0.62;
const BASE_EL = 0.5;

export default function Bench() {
    const { t } = useLanguage();
    const wrapRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const tagRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const activeRef = useRef(-1);
    const [failed, setFailed] = useState(false);

    const items = projects.map((p, i) => ({ p, i })).filter(({ p }) => !!MODELS[p.slug] && !!DESKTOP[p.slug]);

    const setActive = (k: number) => {
        activeRef.current = k;
        tagRefs.current.forEach((el, i) => el?.classList.toggle('is-active', i === k));
        wrapRef.current?.classList.toggle('has-active', k >= 0);
        wake();
    };

    useEffect(() => {
        const wrap = wrapRef.current;
        const canvas = canvasRef.current;
        if (!wrap || !canvas || !items.length) return;

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
        const raycaster = new Raycaster();
        const ndc = new Vector2(-9, -9);
        const tmp = new Color();
        const tmp2 = new Color();
        const v = new Vector3();
        const target = new Vector3(4, 6, 2);

        const objs = items.map(({ p }) => ({
            slug: p.slug,
            ...stage.add(MODELS[p.slug]()),
            spot: DESKTOP[p.slug],
            fade: reduce ? 1 : 0,
            lift: 0,
            dim: 1,
            lit: 0,
        }));
        objs.forEach((o, k) => o.pieces.forEach((pc) => pc.faces && (pc.faces.userData.k = k)));
        const meshes = objs.flatMap((o) => o.pieces.map((pc) => pc.faces)).filter(Boolean) as Mesh[];

        let W = 1;
        let H = 1;
        let mobile = false;
        let heroH = 1;
        let dirty = true;
        let parked = false;
        let az = BASE_AZ;
        let el = BASE_EL;
        let pointerMoved = false;
        let hovered = -1;
        const born = performance.now();
        const hero = (wrap.closest('.pj-hero') as HTMLElement | null) ?? wrap;

        const offMeasure = onMeasure(() => {
            const r = wrap.getBoundingClientRect();
            W = Math.max(1, Math.round(r.width));
            H = Math.max(1, Math.round(r.height));
            mobile = matches('(max-width: 760px)');
            heroH = hero.offsetHeight || window.innerHeight;
            stage.size(W, H);
            // frame the cluster on the left two-thirds, leaving the title block its void
            const side = document.documentElement.dir === 'rtl' ? -1 : 1;
            if (mobile) camera.clearViewOffset();
            // narrower screens give the title block more of the width: push the cluster further out
            else camera.setViewOffset(W, H, W * (0.135 + 0.05 * span(W, 1440, 900)) * side, H * 0.02, W, H);
            camera.updateProjectionMatrix();
            objs.forEach((o) => (o.spot = (mobile ? MOBILE : DESKTOP)[o.slug]));
            dirty = true;
        });

        const onMove = (e: PointerEvent) => {
            if (e.pointerType !== 'mouse') return;
            const r = canvas.getBoundingClientRect();
            ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
            pointerMoved = true;
            wake();
        };
        const onLeave = () => {
            ndc.set(-9, -9);
            pointerMoved = true;
            wake();
        };
        const onClick = () => {
            if (hovered >= 0) scrollToId(`sheet-${objs[hovered].slug}`);
        };
        if (fine) {
            hero.addEventListener('pointermove', onMove);
            hero.addEventListener('pointerleave', onLeave);
            canvas.addEventListener('click', onClick);
        }
        const onLost = (e: Event) => {
            e.preventDefault();
            setFailed(true);
        };
        canvas.addEventListener('webglcontextlost', onLost);

        const offFrame = onFrame(({ y, dt, now }) => {
            const intro = reduce ? 1 : clamp((now - born) / 2400);
            const hp = reduce ? 0 : span(y, 0, heroH * 0.85);
            if (hp >= 1 && intro >= 1) {
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

            // camera: leans toward the pointer; tilts toward plan view as the hero leaves
            const azT = BASE_AZ + (fine ? pointer.x * 0.07 : 0);
            const elT = BASE_EL + ease(hp) * 0.5 + (fine ? -pointer.y * 0.04 : 0);
            const naz = reduce ? azT : damp(az, azT, 3.2, dt);
            const nel = reduce ? elT : damp(el, elT, 3.2, dt);
            if (Math.abs(naz - az) > 1e-5 || Math.abs(nel - el) > 1e-5) {
                az = naz;
                el = nel;
                dirty = true;
                busy = busy || Math.abs(azT - az) > 1e-4 || Math.abs(elT - el) > 1e-4;
            }
            // keep the cluster's share of the width constant: narrower screens pull the camera back
            const fit = Math.max(1, 1.6 / (W / H)) * (1 + 0.2 * span(W, 1440, 900));
            stage.orbit(target, mobile ? 560 : 480 * fit, az, el);

            // hover by raycast, only when the pointer actually moved
            if (pointerMoved && fine) {
                pointerMoved = false;
                camera.updateMatrixWorld();
                raycaster.setFromCamera(ndc, camera);
                const hit = raycaster.intersectObjects(meshes, false)[0];
                const h = hit ? (hit.object.userData.k as number) : -1;
                if (h !== hovered) {
                    hovered = h;
                    canvas.style.cursor = h >= 0 ? 'pointer' : '';
                    if (!tagRefs.current.some((tg) => tg?.matches(':hover'))) setActive(h);
                }
            }

            const active = activeRef.current;
            const globalFade = 1 - span(hp, 0.5, 0.95);
            objs.forEach((o, k) => {
                const bornK = reduce ? 1 : ease(span(intro, 0.12 + k * 0.16, 0.67 + k * 0.16));
                const liftT = active === k ? 5 : 0;
                const dimT = active < 0 || active === k ? 1 : 0.32;
                const litT = active === k ? 1 : 0;
                const nl = reduce ? liftT : damp(o.lift, liftT, 8, dt);
                const nd = reduce ? dimT : damp(o.dim, dimT, 8, dt);
                const nt = reduce ? litT : damp(o.lit, litT, 8, dt);
                const fade = bornK * globalFade;
                const moved = Math.abs(nl - o.lift) > 1e-4 || Math.abs(nd - o.dim) > 1e-4 || Math.abs(nt - o.lit) > 1e-4;
                if (moved || Math.abs(fade - o.fade) > 1e-4 || recolor || dirty) {
                    o.lift = nl;
                    o.dim = nd;
                    o.lit = nt;
                    o.fade = fade;
                    busy = busy || Math.abs(liftT - nl) > 0.01 || Math.abs(dimT - nd) > 0.002 || Math.abs(litT - nt) > 0.002;
                    o.pieces.forEach((pc) => {
                        inkPiece(pc, stage.shown, fade * o.dim, o.lit, tmp, tmp2);
                        if (pc.faces) pc.faces.visible = fade > 0.03;
                    });
                    dirty = true;
                }
                const [px, py, pz] = o.spot.pos;
                o.group.position.set(px, py + o.lift + hp * o.spot.rise - (1 - bornK) * 4, pz);
                o.group.rotation.y = o.spot.ry;
            });

            if (dirty) {
                dirty = false;
                renderer.render(scene, camera);
                // flags ride on each object's anchor
                objs.forEach((o, k) => {
                    const tag = tagRefs.current[k];
                    if (!tag) return;
                    o.group.updateMatrixWorld();
                    v.copy(o.anchor).applyMatrix4(o.group.matrixWorld).project(camera);
                    tag.style.transform = `translate3d(${((v.x * 0.5 + 0.5) * W).toFixed(1)}px, ${((-v.y * 0.5 + 0.5) * H).toFixed(1)}px, 0)`;
                    tag.style.opacity = clamp(o.fade * (o.dim * 0.7 + 0.3)).toFixed(3);
                });
            }
            return busy;
        });

        return () => {
            offFrame();
            offMeasure();
            hero.removeEventListener('pointermove', onMove);
            hero.removeEventListener('pointerleave', onLeave);
            canvas.removeEventListener('click', onClick);
            canvas.removeEventListener('webglcontextlost', onLost);
            objs.forEach((o) => o.pieces.forEach(disposePiece));
            stage.dispose();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (failed) {
        // no WebGL: the same three objects, as their finished plan drawings
        return (
            <div className="k-bench is-fallback" ref={wrapRef}>
                {items.map(({ p }) => (
                    <div key={p.slug} className={`k-bench__still k-bench__still--${p.slug}`}>
                        <Plate drawing={drawingFor(p.slug, p.kind, p.title)} build="static" strip={false} probe={false} />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="k-bench" ref={wrapRef}>
            <canvas ref={canvasRef} className="k-bench__canvas" aria-hidden="true" />
            <ul className="k-bench__tags">
                {items.map(({ p, i }, k) => (
                    <li key={p.slug}>
                        <button
                            type="button"
                            ref={(node) => {
                                tagRefs.current[k] = node;
                            }}
                            className="k-bench__tag"
                            data-k={p.slug}
                            data-hover
                            data-cursor={t('projects.sec.sheet')}
                            onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(k)}
                            onPointerLeave={(e) => e.pointerType === 'mouse' && setActive(-1)}
                            onFocus={() => setActive(k)}
                            onBlur={() => setActive(-1)}
                            onClick={() => scrollToId(`sheet-${p.slug}`)}
                        >
                            <span className="k-bench__tag-n">{String(i + 1).padStart(2, '0')}</span>
                            <span className="k-bench__tag-name">{p.title}</span>
                            <span className="k-bench__tag-note">{p.category}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
