'use client';

import React, { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import Link from 'next/link';
import { Box3, Color, Object3D, Vector3 } from 'three';
import { useLanguage } from '../../components/LanguageContext';
import type { Project } from '../../projects/projects.data';
import { clamp, damp, ease, finePointer, lerp, onFrame, onMeasure, pointer, reducedMotion, span, wake } from '../../kit/motion';
import Plate from '../../kit/Plate';
import { drawingFor } from '../../kit/draw';
import { Builder, disposePiece, inkPiece, makePiece } from '../../kit/three/hlr';
import { MODELS } from '../../kit/three/models';
import { createStage, type Stage } from '../../kit/three/stage';
import { schedule, stationAt, type Show } from '../show';
import '../../kit/kit.css';

/* ===========================================================================
   The line-up — the selected artifacts mounted on posts along a measuring rail,
   like specimens on an optical bench. In the hero the rail recedes through the
   viewport; through the pinned work section the camera travels along it and
   stops at each artifact, which turns with the scroll. Hover lights a piece,
   drag turns it, a click opens its project, a flag lifts its layer. Hidden-line,
   recoloured from the tokens, rendered only when something changes.
   =========================================================================== */

type Display = { scale: number; cx: number; ry: number; w: number; r: number };

/** display scale (not to scale — the die is enlarged), visual centre, rest pose, framing */
const DISPLAY: Record<string, Display> = {
    cleave: { scale: 1.7, cx: 0, ry: 0.42, w: 44, r: 27 },
    nerona: { scale: 1, cx: -8, ry: 0.08, w: 66, r: 36 },
    azimuth: { scale: 1, cx: 0, ry: -0.16, w: 56, r: 33 },
};
const GAP = 64;
const RAIL_Y = -9;
const TAN = 2 * Math.tan((17 / 2) * (Math.PI / 180));

type Cam = { x: number; y: number; z: number; D: number; az: number; el: number; ox: number; oy: number };
const mixCam = (a: Cam, b: Cam, t: number): Cam => ({
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t),
    D: lerp(a.D, b.D, t),
    az: lerp(a.az, b.az, t),
    el: lerp(a.el, b.el, t),
    ox: lerp(a.ox, b.ox, t),
    oy: lerp(a.oy, b.oy, t),
});

function buildRail(xs: number[], from: number, to: number) {
    const b = new Builder();
    const L = to - from;
    b.box(L, 2, 7, (from + to) / 2, RAIL_Y - 2, 0, 'edge');
    const top = RAIL_Y + 0.02;
    for (let x = Math.ceil(from / 5) * 5; x <= to; x += 5) {
        const major = x % 50 === 0;
        const mid = x % 25 === 0;
        b.seg([x, top, 3.5], [x, top, major ? -3.5 : mid ? 1.4 : 2.4], major ? 'mid' : mid ? 'fine' : 'faint');
    }
    b.seg([from, top, -1.8], [to, top, -1.8], 'faint');
    for (const x of xs) {
        b.cylinder(1.1, -RAIL_Y, x, RAIL_Y, 0, 'mid');
        b.ring(x, top, 0, 3.4, 'fine', 32);
    }
    return b.build();
}

type Props = {
    items: Project[];
    show: MutableRefObject<Show>;
    /** the camera's heading and elevation, in degrees — for the viewport readout */
    onCamera?: (az: number, el: number) => void;
    /** a hero flag was picked: go to that artifact's station */
    onPick?: (k: number) => void;
    onFail?: () => void;
};

export default function Showcase({ items, show, onCamera, onPick, onFail }: Props) {
    const { t } = useLanguage();
    const wrapRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const tagRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const hitRefs = useRef<(HTMLAnchorElement | null)[]>([]);
    const flagRefs = useRef<(HTMLButtonElement | null)[][]>([]);
    const activeRef = useRef(-1);
    const layerRef = useRef<[number, number]>([-1, -1]);
    const dragRef = useRef({ k: -1, x0: 0, yaw0: 0, moved: false });
    const yawRef = useRef<number[]>([]);
    const [failed, setFailed] = useState(false);

    const line = useMemo(() => items.filter((p) => MODELS[p.slug] && DISPLAY[p.slug]), [items]);
    // the flags' text only — built once, not on every render
    const layersOf = useMemo(
        () => line.map((p) => MODELS[p.slug]().layers.map((l) => ({ label: l.label, note: l.note }))),
        [line]
    );

    const setActive = (k: number) => {
        activeRef.current = k;
        tagRefs.current.forEach((el, i) => el?.classList.toggle('is-active', i === k));
        wake();
    };
    const setLayer = (k: number, l: number) => {
        layerRef.current = [k, l];
        flagRefs.current.forEach((row, i) => row?.forEach((el, j) => el?.classList.toggle('is-active', i === k && j === l)));
        wake();
    };

    useEffect(() => {
        const wrap = wrapRef.current;
        const canvas = canvasRef.current;
        if (!wrap || !canvas || !line.length) return;

        let stage: Stage;
        try {
            stage = createStage(canvas);
        } catch {
            setFailed(true);
            onFail?.();
            return;
        }
        const { camera, renderer, scene } = stage;
        const reduce = reducedMotion();
        const fine = finePointer() && !reduce;
        const tmp = new Color();
        const tmp2 = new Color();
        const v = new Vector3();
        const target = new Vector3();
        const n = line.length;
        const sc = schedule(n);

        // stations along the rail: equal gaps between the artifacts' footprints
        const xs: number[] = [];
        line.forEach((p, k) => {
            const d = DISPLAY[p.slug];
            xs.push(k === 0 ? 0 : xs[k - 1] + DISPLAY[line[k - 1].slug].w / 2 + GAP + d.w / 2);
        });
        const first = xs[0] - DISPLAY[line[0].slug].w / 2;
        const last = xs[n - 1] + DISPLAY[line[n - 1].slug].w / 2;
        const mid = (first + last) / 2;
        const span0 = last - first;

        const rail = makePiece(buildRail(xs, first - 28, last + 28), stage.faceMat, stage.resolution);
        scene.add(rail.root);

        const objs = line.map((p, k) => {
            const d = DISPLAY[p.slug];
            const added = stage.add(MODELS[p.slug]());
            scene.remove(added.group);
            const pivot = new Object3D();
            pivot.position.set(xs[k], 0, 0);
            added.group.position.set(-d.cx * d.scale, 0, 0);
            added.group.scale.setScalar(d.scale);
            pivot.add(added.group);
            scene.add(pivot);
            const box = new Box3();
            added.pieces.forEach((pc) => {
                if (!pc.faces) return;
                pc.faces.geometry.computeBoundingBox();
                if (pc.faces.geometry.boundingBox) box.union(pc.faces.geometry.boundingBox);
            });
            yawRef.current[k] = 0;
            return {
                ...added,
                pivot,
                d,
                box,
                corners: Array.from({ length: 8 }, () => new Vector3()),
                ry: d.ry,
                fade: -1,
                dim: 1,
                lit: 0,
                lift: added.layers.map(() => 0),
                born: 0,
                yaw: 0,
            };
        });

        let W = 1;
        let H = 1;
        let side = 1;
        let dirty = true;
        let parked = false;
        let cam: Cam | null = null;
        let lastAz = -999;
        let lastEl = -999;
        let railFade = -1;

        const offMeasure = onMeasure(() => {
            const r = wrap.getBoundingClientRect();
            W = Math.max(1, Math.round(r.width));
            H = Math.max(1, Math.round(r.height));
            side = document.documentElement.dir === 'rtl' ? -1 : 1;
            stage.size(W, H);
            dirty = true;
        });

        const onLost = (e: Event) => {
            e.preventDefault();
            setFailed(true);
            onFail?.();
        };
        canvas.addEventListener('webglcontextlost', onLost);

        /* ---- keyframes, from the page's measured layout ---- */
        const heroCam = (): Cam => {
            const s = show.current;
            const vw = Math.max(1, s.view.w);
            const fit = (span0 * 0.78 * H) / (TAN * vw * 0.86);
            const portrait = vw < s.view.h * 1.1;
            return {
                x: mid + (portrait ? 0 : span0 * 0.04),
                y: 2,
                z: 0,
                D: fit * (portrait ? 0.98 : 1),
                az: (portrait ? -1.05 : -0.86) * side,
                el: portrait ? 0.46 : 0.36,
                ox: 0.5 - (s.view.x + s.view.w / 2) / W,
                oy: 0.5 - (s.view.y + s.view.h * 0.52) / H,
            };
        };
        const stationCam = (k: number): Cam => {
            const s = show.current;
            const R = objs[k].d.r;
            return {
                x: xs[k],
                y: 3,
                z: 0,
                D: (R * H) / (TAN * Math.max(80, s.focus.r)),
                az: -0.8 * side,
                el: 0.6,
                ox: 0.5 - s.focus.x / W,
                oy: 0.5 - s.focus.y / H,
            };
        };
        const endCam = (): Cam => {
            const s = show.current;
            return {
                x: mid,
                y: 0,
                z: 0,
                D: (span0 * 1.25 * H) / (TAN * Math.max(1, s.stage.w) * 0.8),
                az: -0.62 * side,
                el: 1.08,
                ox: 0.5 - (s.stage.x + s.stage.w / 2) / W,
                oy: 0.5 - (s.stage.y + s.stage.h * 0.5) / H,
            };
        };

        const offFrame = onFrame(({ y, dt, now }) => {
            const s = show.current;
            if (!s.entered && !reduce) return false;
            const intro = reduce ? 1 : clamp((now - s.enteredAt) / 2600);
            const gone = s.pinned ? s.qT >= 1 && y > s.trackEnd : s.hy >= 1;
            if (gone && intro >= 1) {
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

            /* ---- where the camera wants to be ---- */
            const st = stationAt(s.qT, sc);
            let key = heroCam();
            let current = -1;
            let bay = 0;
            if (s.pinned) {
                const a = clamp(s.hpT);
                const k0 = Math.floor(st.s);
                const tt = st.s - k0;
                let b = tt > 0 && k0 < n - 1 ? mixCam(stationCam(k0), stationCam(k0 + 1), tt) : stationCam(Math.min(n - 1, k0));
                if (tt > 0 && k0 < n - 1) {
                    // pull back mid-move, so the rail reads as travel
                    const pull = Math.sin(Math.PI * tt);
                    b.D *= 1 + 0.42 * pull;
                    b.el += 0.07 * pull;
                }
                if (st.out > 0) b = mixCam(b, endCam(), ease(st.out));
                key = mixCam(key, b, a);
                bay = a;
                current = a > 0.5 && st.out < 0.5 ? st.current : -1;
            } else {
                const hp = reduce ? 0 : s.hy;
                key.el += 0.42 * ease(hp);
            }
            if (fine) {
                key.az += pointer.x * 0.06;
                key.el -= pointer.y * 0.035;
            }

            const first = cam === null;
            if (first || reduce) cam = key;
            else {
                const c = cam as Cam;
                const L = 5.5;
                const next: Cam = {
                    x: damp(c.x, key.x, L, dt),
                    y: damp(c.y, key.y, L, dt),
                    z: damp(c.z, key.z, L, dt),
                    D: damp(c.D, key.D, L, dt),
                    az: damp(c.az, key.az, L, dt),
                    el: damp(c.el, key.el, L, dt),
                    ox: damp(c.ox, key.ox, L, dt),
                    oy: damp(c.oy, key.oy, L, dt),
                };
                const moving =
                    Math.abs(next.x - key.x) > 0.01 ||
                    Math.abs(next.D - key.D) > 0.05 ||
                    Math.abs(next.az - key.az) > 1e-4 ||
                    Math.abs(next.el - key.el) > 1e-4 ||
                    Math.abs(next.ox - key.ox) > 1e-4 ||
                    Math.abs(next.oy - key.oy) > 1e-4;
                const changed =
                    Math.abs(next.x - c.x) > 1e-4 ||
                    Math.abs(next.D - c.D) > 1e-3 ||
                    Math.abs(next.az - c.az) > 1e-6 ||
                    Math.abs(next.el - c.el) > 1e-6 ||
                    Math.abs(next.ox - c.ox) > 1e-6 ||
                    Math.abs(next.oy - c.oy) > 1e-6;
                cam = next;
                if (changed) dirty = true;
                busy = busy || moving;
            }
            const C = cam as Cam;
            camera.setViewOffset(W, H, W * C.ox, H * C.oy, W, H);
            camera.updateProjectionMatrix();
            target.set(C.x, C.y, C.z);
            stage.orbit(target, C.D, C.az, C.el);
            if (first) dirty = true;

            const azDeg = Math.round((((C.az * 180) / Math.PI) % 360 + 360) % 360);
            const elDeg = Math.round((C.el * 180) / Math.PI);
            if (azDeg !== lastAz || elDeg !== lastEl) {
                lastAz = azDeg;
                lastEl = elDeg;
                onCamera?.(azDeg, elDeg);
            }

            /* ---- the rail ---- */
            const flowFade = s.pinned ? 1 : 1 - span(s.hy, 0.55, 0.95);
            // the rail steps back while an artifact is inspected, and returns for the overview
            const railBay = s.pinned ? lerp(1, 0.38, clamp(bay * 1.3) * (1 - st.out * 0.7)) : 1;
            const rf = (reduce ? 1 : ease(span(intro, 0, 0.5))) * flowFade * 0.9 * railBay;
            if (Math.abs(rf - railFade) > 1e-4 || recolor || dirty) {
                railFade = rf;
                inkPiece(rail, stage.shown, rf, 0, tmp, tmp2);
                if (rail.faces) rail.faces.visible = rf > 0.02;
                dirty = true;
            }

            /* ---- the artifacts ---- */
            const active = activeRef.current >= 0 ? activeRef.current : s.hot;
            const [lk, ll] = layerRef.current;
            objs.forEach((o, k) => {
                const born = reduce ? 1 : ease(span(intro, 0.1 + k * 0.15, 0.72 + k * 0.15));
                o.born = born;
                // turntable: a straight tie to the scroll through each artifact's dwell
                const [wa, wb] = sc.windows[k];
                const turn = s.pinned ? clamp(((wa + wb) / 2 - s.qT) / sc.dwell, -1.6, 1.6) * 0.62 * bay : 0;
                const ryT = o.d.ry + turn + yawRef.current[k];
                const nry = reduce ? ryT : damp(o.ry, ryT, 6, dt);
                if (Math.abs(nry - o.ry) > 1e-5) {
                    o.ry = nry;
                    dirty = true;
                    busy = busy || Math.abs(ryT - nry) > 1e-4;
                }

                const focusDim = s.pinned && bay > 0 ? lerp(1, current === k ? 1 : 0.06, clamp(bay * 1.4) * (1 - st.out)) : 1;
                const dimT = (active < 0 || active === k ? 1 : 0.32) * focusDim;
                const litT = active === k ? 1 : 0;
                const nd = reduce ? dimT : damp(o.dim, dimT, 8, dt);
                const nt = reduce ? litT : damp(o.lit, litT, 8, dt);
                const fade = born * flowFade;

                // layers assemble out of the dark; a flagged layer lifts clear of the rest and takes the light
                let lifted = false;
                let most = 0;
                o.layers.forEach((l, j) => {
                    const liftT = lk === k && ll === j ? 1 : 0;
                    const nl = reduce ? liftT : damp(o.lift[j], liftT, 8, dt);
                    if (Math.abs(nl - o.lift[j]) > 1e-4) {
                        busy = busy || Math.abs(liftT - nl) > 0.002;
                        o.lift[j] = nl;
                        lifted = true;
                    }
                    most = Math.max(most, o.lift[j]);
                    const sep = (1 - born) * 3.4 + o.lift[j];
                    const [ex, ey, ez] = l.spec.explode;
                    l.piece.root.position.set(ex * sep, ey * sep - (1 - born) * 5, ez * sep);
                });

                const moved = lifted || Math.abs(nd - o.dim) > 1e-4 || Math.abs(nt - o.lit) > 1e-4;
                if (moved || Math.abs(fade - o.fade) > 1e-4 || recolor || dirty) {
                    busy = busy || Math.abs(dimT - nd) > 0.002 || Math.abs(litT - nt) > 0.002;
                    o.dim = nd;
                    o.lit = nt;
                    o.fade = fade;
                    o.layers.forEach((l, j) => {
                        const recede = 1 - 0.62 * (most - o.lift[j]);
                        inkPiece(l.piece, stage.shown, fade * o.dim * recede, Math.max(o.lit, o.lift[j]), tmp, tmp2);
                        if (l.piece.faces) l.piece.faces.visible = fade > 0.03;
                    });
                    dirty = true;
                }
                o.pivot.rotation.y = o.ry;
            });

            if (dirty) {
                dirty = false;
                renderer.render(scene, camera);

                const heroShow = s.pinned ? 1 - span(s.hpT, 0.04, 0.32) : 1 - span(s.hy, 0.1, 0.45);
                objs.forEach((o, k) => {
                    o.pivot.updateMatrixWorld();
                    // hero flag rides on the artifact's anchor
                    const tag = tagRefs.current[k];
                    if (tag) {
                        v.copy(o.anchor).applyMatrix4(o.group.matrixWorld).project(camera);
                        tag.style.transform = `translate3d(${((v.x * 0.5 + 0.5) * W).toFixed(1)}px, ${((-v.y * 0.5 + 0.5) * H).toFixed(1)}px, 0)`;
                        const op = clamp(o.fade * heroShow * (o.dim * 0.7 + 0.3));
                        tag.style.opacity = op.toFixed(3);
                        tag.style.visibility = op < 0.02 ? 'hidden' : '';
                    }
                    // the hit area covers the artifact's projected footprint
                    const hit = hitRefs.current[k];
                    if (hit) {
                        const b = o.box;
                        let x0 = Infinity;
                        let y0 = Infinity;
                        let x1 = -Infinity;
                        let y1 = -Infinity;
                        for (let c = 0; c < 8; c++) {
                            v.set(c & 1 ? b.max.x : b.min.x, c & 2 ? b.max.y : b.min.y, c & 4 ? b.max.z : b.min.z)
                                .applyMatrix4(o.group.matrixWorld)
                                .project(camera);
                            const px = (v.x * 0.5 + 0.5) * W;
                            const py = (-v.y * 0.5 + 0.5) * H;
                            x0 = Math.min(x0, px);
                            y0 = Math.min(y0, py);
                            x1 = Math.max(x1, px);
                            y1 = Math.max(y1, py);
                        }
                        const live = o.fade > 0.5 && (current < 0 ? heroShow > 0.5 : current === k);
                        hit.style.transform = `translate3d(${x0.toFixed(1)}px, ${y0.toFixed(1)}px, 0)`;
                        hit.style.width = `${Math.max(0, x1 - x0).toFixed(1)}px`;
                        hit.style.height = `${Math.max(0, y1 - y0).toFixed(1)}px`;
                        hit.style.pointerEvents = live ? 'auto' : 'none';
                    }
                    // layer flags: only on the artifact being inspected
                    const row = flagRefs.current[k];
                    if (row) {
                        const near = s.pinned ? clamp(1 - Math.abs(st.s - k) * 3) * clamp((bay - 0.6) / 0.4) * (1 - span(st.out, 0, 0.25)) : 0;
                        const rest = (1 - o.born) * 3.4;
                        o.layers.forEach((l, j) => {
                            const el = row[j];
                            if (!el) return;
                            // pinned to the layer's resting place: a lifted layer rises toward its flag, never away from the pointer
                            const [ax, ay, az] = l.spec.anchor;
                            const [ex, ey, ez] = l.spec.explode;
                            v.set(ax + ex * rest, ay + ey * rest - (1 - o.born) * 5, az + ez * rest)
                                .applyMatrix4(o.group.matrixWorld)
                                .project(camera);
                            el.style.transform = `translate3d(${((v.x * 0.5 + 0.5) * W).toFixed(1)}px, ${((-v.y * 0.5 + 0.5) * H).toFixed(1)}px, 0)`;
                            const op = clamp(near * o.fade);
                            el.style.opacity = op.toFixed(3);
                            el.style.visibility = op < 0.02 ? 'hidden' : '';
                        });
                    }
                });
            }
            return busy;
        });

        // drag to turn: a horizontal drag on an artifact spins it on its post
        const onUp = (e: PointerEvent) => {
            const d = dragRef.current;
            if (d.k < 0) return;
            document.body.classList.remove('hm-dragging');
            // released off the artifact: let it go dark again
            if (!(e.target as Element | null)?.closest?.('.hm-hit')) setActive(-1);
            const k = d.k;
            d.k = -1;
            if (!d.moved) return;
            // let it settle back to the scroll's pose, slowly
            const off = onFrame(({ dt }) => {
                yawRef.current[k] = damp(yawRef.current[k], 0, 1.4, dt);
                if (Math.abs(yawRef.current[k]) < 0.002 || dragRef.current.k === k) {
                    if (dragRef.current.k !== k) yawRef.current[k] = 0;
                    off();
                    return false;
                }
                return true;
            });
        };
        const onMove = (e: PointerEvent) => {
            const d = dragRef.current;
            if (d.k < 0) return;
            const dx = (e.clientX - d.x0) * side;
            if (Math.abs(dx) > 5) d.moved = true;
            yawRef.current[d.k] = clamp(d.yaw0 + dx * 0.012, -Math.PI, Math.PI);
            wake();
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);

        return () => {
            offFrame();
            offMeasure();
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onUp);
            canvas.removeEventListener('webglcontextlost', onLost);
            objs.forEach((o) => o.pieces.forEach(disposePiece));
            disposePiece(rail);
            stage.dispose();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (failed) {
        // no WebGL: the same artifacts, as their finished plan drawings
        return (
            <div className="hm-line is-fallback" ref={wrapRef}>
                {line.map((p) => (
                    <div key={p.slug} className={`hm-line__still hm-line__still--${p.slug}`}>
                        <Plate drawing={drawingFor(p.slug, p.kind, p.title)} build="static" strip={false} probe={false} />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="hm-line" ref={wrapRef}>
            <canvas ref={canvasRef} className="hm-line__canvas" aria-hidden="true" />

            {line.map((p, k) => (
                <Link
                    key={p.slug}
                    href={`/projects/${p.slug}/`}
                    className="hm-hit"
                    ref={(el) => {
                        hitRefs.current[k] = el;
                    }}
                    tabIndex={-1}
                    aria-hidden="true"
                    draggable={false}
                    data-hover
                    data-cursor={t('projects.view_project')}
                    onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(k)}
                    onPointerLeave={(e) => e.pointerType === 'mouse' && dragRef.current.k < 0 && setActive(-1)}
                    onPointerDown={(e) => {
                        if (e.button !== 0 || reducedMotion()) return;
                        dragRef.current = { k, x0: e.clientX, yaw0: yawRef.current[k] ?? 0, moved: false };
                        document.body.classList.add('hm-dragging');
                    }}
                    onClick={(e) => {
                        if (dragRef.current.moved) {
                            e.preventDefault();
                            dragRef.current.moved = false;
                        }
                    }}
                    onDragStart={(e) => e.preventDefault()}
                />
            ))}

            <ul className="k-bench__tags hm-line__tags">
                {line.map((p, k) => (
                    <li key={p.slug}>
                        <button
                            type="button"
                            ref={(el) => {
                                tagRefs.current[k] = el;
                            }}
                            className="k-bench__tag hm-line__tag"
                            data-k={p.slug}
                            data-hover
                            data-cursor={t('home.view.go')}
                            tabIndex={-1}
                            aria-hidden="true"
                            onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(k)}
                            onPointerLeave={(e) => e.pointerType === 'mouse' && setActive(-1)}
                            onClick={() => onPick?.(k)}
                        >
                            <span className="k-bench__tag-n">{String(k + 1).padStart(2, '0')}</span>
                            <span className="k-bench__tag-name">{p.title}</span>
                            <span className="k-bench__tag-note">{p.category}</span>
                        </button>
                    </li>
                ))}
            </ul>

            <ul className="k-bench__tags hm-line__flags">
                {line.map((p, k) =>
                    layersOf[k].map((l, j) => (
                        <li key={`${p.slug}-${j}`}>
                            <button
                                type="button"
                                ref={(el) => {
                                    if (!flagRefs.current[k]) flagRefs.current[k] = [];
                                    flagRefs.current[k][j] = el;
                                }}
                                className={`k-bench__tag k-specimen__tag hm-line__flag ${j === 0 ? 'is-below' : ''}`}
                                style={{ '--lead': `${j === 0 ? 46 : 34 + j * 30}px` } as React.CSSProperties}
                                tabIndex={-1}
                                aria-hidden="true"
                                data-hover
                                data-cursor={t('home.bay.lift')}
                                onPointerEnter={(e) => e.pointerType === 'mouse' && setLayer(k, j)}
                                onPointerLeave={(e) => e.pointerType === 'mouse' && setLayer(-1, -1)}
                                onClick={() => {
                                    const [a, b] = layerRef.current;
                                    setLayer(a === k && b === j ? -1 : k, a === k && b === j ? -1 : j);
                                }}
                            >
                                <span className="k-bench__tag-n">{String(j + 1).padStart(2, '0')}</span>
                                <span className="k-bench__tag-name">{l.label}</span>
                                <span className="k-bench__tag-note">{l.note}</span>
                            </button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}
