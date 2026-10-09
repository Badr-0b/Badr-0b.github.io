/* ===========================================================================
   A hidden-line stage: renderer, camera, the occluding face material and the
   theme palette (cross-faded over ~300ms when the tokens change). Shared by
   every 3D view in the kit, so they all render the same way.
   =========================================================================== */

import { Object3D, PerspectiveCamera, Scene, Vector2, Vector3, WebGLRenderer } from 'three';
import { ease, reducedMotion, wake } from '../motion';
import { clonePalette, lerpPalette, makeFaceMaterial, makePiece, readPalette, type Piece } from './hlr';
import type { Model } from './models';

export type Stage = ReturnType<typeof createStage>;

/** Throws if WebGL is unavailable — callers fall back to the 2D drawings. */
export function createStage(canvas: HTMLCanvasElement) {
    const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const reduce = reducedMotion();
    const scene = new Scene();
    const camera = new PerspectiveCamera(17, 1, 20, 3000);
    const resolution = new Vector2(1, 1);
    const faceMat = makeFaceMaterial();

    let pal = readPalette();
    const shown = clonePalette(pal);
    let from = clonePalette(pal);
    let t = 1;
    faceMat.color.copy(shown.bg);
    const mo = new MutationObserver(() => {
        from = clonePalette(shown);
        pal = readPalette();
        t = reduce ? 0.999 : 0;
        wake();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return {
        renderer,
        scene,
        camera,
        resolution,
        faceMat,
        /** the palette as currently shown (mid-fade during a theme change) */
        shown,
        /** advance the palette cross-fade; true while it is still moving */
        tick(dt: number) {
            if (t >= 1) return false;
            t = Math.min(1, t + dt / 0.3);
            lerpPalette(shown, from, pal, ease(t));
            faceMat.color.copy(shown.bg);
            return true;
        },
        size(W: number, H: number) {
            renderer.setSize(W, H, false);
            resolution.set(W, H);
            camera.aspect = W / H;
        },
        /** eye = target + D·(cos el·sin az, sin el, cos el·cos az) */
        orbit(target: Vector3, D: number, az: number, el: number) {
            camera.position.set(
                target.x + D * Math.cos(el) * Math.sin(az),
                target.y + D * Math.sin(el),
                target.z + D * Math.cos(el) * Math.cos(az)
            );
            camera.lookAt(target);
        },
        /** add a model: one root per layer, so layers can separate */
        add(model: Model) {
            const group = new Object3D();
            const layers = model.layers.map((l) => {
                const piece = makePiece(l.b.build(), faceMat, resolution);
                group.add(piece.root);
                return { piece, spec: l };
            });
            scene.add(group);
            return { group, layers, pieces: layers.map((l) => l.piece) as Piece[], anchor: new Vector3(...model.anchor) };
        },
        dispose() {
            mo.disconnect();
            faceMat.dispose();
            renderer.dispose();
        },
    };
}
