/* ===========================================================================
   Hidden-line rendering — the 3D half of the kit. Objects are drawn the way a
   CAD package draws "hidden lines removed": faces filled with the page's own
   ground colour (so they occlude, but are never seen), and edges as 1px hairlines
   in the same ink levels as the 2D plates. Colours come from the CSS tokens and
   cross-fade when the theme changes, so light mode is a recolour, not a fork.
   =========================================================================== */

import {
    BoxGeometry,
    BufferGeometry,
    Color,
    CylinderGeometry,
    EdgesGeometry,
    ExtrudeGeometry,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    SRGBColorSpace,
    Shape,
    Vector2,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';

export type Ink = 'edge' | 'mid' | 'fine' | 'faint' | 'hot';
export const INKS: Ink[] = ['edge', 'mid', 'fine', 'faint', 'hot'];
/** the same ink levels the 2D plates use (kit.css) */
export const STRENGTH: Record<Ink, number> = { edge: 0.95, mid: 0.55, fine: 0.36, faint: 0.2, hot: 0.92 };

type V3 = [number, number, number];

/* ---------------------------------------------------------------------------
   Geometry: a Builder collects occluding faces and inked edges for one layer
   --------------------------------------------------------------------------- */
export class Builder {
    faces: BufferGeometry[] = [];
    lines: Record<Ink, number[]> = { edge: [], mid: [], fine: [], faint: [], hot: [] };

    private add(g: BufferGeometry, ink: Ink | null, faces: boolean, threshold = 24) {
        if (faces) this.faces.push(g);
        if (ink) {
            const e = new EdgesGeometry(g, threshold);
            const a = e.attributes.position.array as ArrayLike<number>;
            for (let i = 0; i < a.length; i++) this.lines[ink].push(a[i]);
            e.dispose();
        }
    }

    /** A box resting on y (its base at y), centred on x / z; optionally turned about y. */
    box(w: number, h: number, d: number, x: number, y: number, z: number, ink: Ink | null = 'edge', o: { faces?: boolean; ry?: number } = {}) {
        const g = new BoxGeometry(w, h, d);
        if (o.ry) g.rotateY(o.ry);
        g.translate(x, y + h / 2, z);
        this.add(g, ink, o.faces ?? true);
        return this;
    }

    /** A rounded-rectangle slab (a board), base at y. */
    slab(w: number, d: number, r: number, h: number, x: number, y: number, z: number, ink: Ink = 'edge') {
        const s = new Shape();
        const hw = w / 2;
        const hd = d / 2;
        s.moveTo(-hw + r, -hd);
        s.lineTo(hw - r, -hd);
        s.quadraticCurveTo(hw, -hd, hw, -hd + r);
        s.lineTo(hw, hd - r);
        s.quadraticCurveTo(hw, hd, hw - r, hd);
        s.lineTo(-hw + r, hd);
        s.quadraticCurveTo(-hw, hd, -hw, hd - r);
        s.lineTo(-hw, -hd + r);
        s.quadraticCurveTo(-hw, -hd, -hw + r, -hd);
        const g = new ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 6 });
        g.rotateX(-Math.PI / 2); // extrude along +y
        g.translate(x, y, z);
        this.add(g, ink, true, 30);
        return this;
    }

    /**
     * An upright cylinder (lens barrels, feed pins). Hairline rims, plus the two
     * silhouette generators for a camera looking from `viewAz` — a smooth side has
     * no edges of its own, so CAD draws its outline where the view grazes it.
     */
    cylinder(r: number, h: number, x: number, y: number, z: number, ink: Ink = 'edge', viewAz = -0.66) {
        const g = new CylinderGeometry(r, r, h, 36, 1);
        g.translate(x, y + h / 2, z);
        this.add(g, ink, true, 40);
        // camera convention: eye = target + D·(cos el·sin az, sin el, cos el·cos az)
        for (const s of [-1, 1]) {
            const px = x + s * r * Math.cos(viewAz);
            const pz = z - s * r * Math.sin(viewAz);
            this.seg([px, y, pz], [px, y + h, pz], ink);
        }
        return this;
    }

    seg(a: V3, b: V3, ink: Ink = 'fine') {
        this.lines[ink].push(a[0], a[1], a[2], b[0], b[1], b[2]);
        return this;
    }

    poly(pts: V3[], ink: Ink = 'fine', closed = false) {
        for (let i = 1; i < pts.length; i++) this.seg(pts[i - 1], pts[i], ink);
        if (closed && pts.length > 2) this.seg(pts[pts.length - 1], pts[0], ink);
        return this;
    }

    /** A circle lying flat at height y. */
    ring(cx: number, y: number, cz: number, r: number, ink: Ink = 'fine', segs = 48) {
        const pts: V3[] = [];
        for (let i = 0; i < segs; i++) {
            const a = (i / segs) * Math.PI * 2;
            pts.push([cx + Math.cos(a) * r, y, cz + Math.sin(a) * r]);
        }
        return this.poly(pts, ink, true);
    }

    /** A flat rectangle outline at height y. */
    rect(cx: number, y: number, cz: number, w: number, d: number, ink: Ink = 'fine') {
        const hw = w / 2;
        const hd = d / 2;
        return this.poly(
            [
                [cx - hw, y, cz - hd],
                [cx + hw, y, cz - hd],
                [cx + hw, y, cz + hd],
                [cx - hw, y, cz + hd],
            ],
            ink,
            true
        );
    }

    /** Merge into renderable pieces. */
    build() {
        const faces = this.faces.length
            ? mergeGeometries(
                  this.faces.map((g) => {
                      const ng = g.index ? g.toNonIndexed() : g;
                      const out = new BufferGeometry();
                      out.setAttribute('position', ng.getAttribute('position'));
                      return out;
                  })
              )
            : null;
        const lines: Partial<Record<Ink, LineSegmentsGeometry>> = {};
        for (const ink of INKS) {
            const a = this.lines[ink];
            if (!a.length) continue;
            const g = new LineSegmentsGeometry();
            g.setPositions(a);
            lines[ink] = g;
        }
        this.faces.forEach((g) => g.dispose());
        return { faces, lines };
    }
}

/* ---------------------------------------------------------------------------
   Theme colours — read from the CSS tokens, mixed in sRGB like CSS opacity
   --------------------------------------------------------------------------- */
export type Palette = { bg: Color; ink: Color; text: Color; accent: Color };

function cssColor(name: string, fallback: string) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const c = new Color();
    c.setStyle(v || fallback, SRGBColorSpace);
    return c;
}

export function readPalette(): Palette {
    return {
        bg: cssColor('--bg', '#0a0a0b'),
        ink: cssColor('--text-dim', '#8a8f98'),
        text: cssColor('--text', '#f4f5f7'),
        accent: cssColor('--accent', '#c8d2e0'),
    };
}

const _a = { r: 0, g: 0, b: 0 };
const _b = { r: 0, g: 0, b: 0 };
/** out = mix(a, b, t), computed in sRGB the way the browser blends opacity. */
export function mixSRGB(out: Color, a: Color, b: Color, t: number) {
    a.getRGB(_a, SRGBColorSpace);
    b.getRGB(_b, SRGBColorSpace);
    return out.setRGB(_a.r + (_b.r - _a.r) * t, _a.g + (_b.g - _a.g) * t, _a.b + (_b.b - _a.b) * t, SRGBColorSpace);
}

export function lerpPalette(out: Palette, a: Palette, b: Palette, t: number) {
    mixSRGB(out.bg, a.bg, b.bg, t);
    mixSRGB(out.ink, a.ink, b.ink, t);
    mixSRGB(out.text, a.text, b.text, t);
    mixSRGB(out.accent, a.accent, b.accent, t);
}

export const clonePalette = (p: Palette): Palette => ({
    bg: p.bg.clone(),
    ink: p.ink.clone(),
    text: p.text.clone(),
    accent: p.accent.clone(),
});

/* ---------------------------------------------------------------------------
   Renderable objects: one face mesh + one hairline mesh per ink, per layer
   --------------------------------------------------------------------------- */
export type Piece = {
    root: Object3D;
    faces: Mesh | null;
    lines: Partial<Record<Ink, LineSegments2>>;
    mats: Partial<Record<Ink, LineMaterial>>;
};

export function makeFaceMaterial() {
    return new MeshBasicMaterial({
        color: 0x000000,
        polygonOffset: true, // faces sit a hair behind their own edges
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
    });
}

export function makePiece(built: ReturnType<Builder['build']>, faceMat: MeshBasicMaterial, resolution: Vector2): Piece {
    const root = new Object3D();
    const faces = built.faces ? new Mesh(built.faces, faceMat) : null;
    if (faces) root.add(faces);
    const lines: Piece['lines'] = {};
    const mats: Piece['mats'] = {};
    for (const ink of INKS) {
        const g = built.lines[ink];
        if (!g) continue;
        const m = new LineMaterial({ color: 0xffffff, linewidth: ink === 'hot' ? 1.15 : 1, worldUnits: false });
        m.resolution = resolution;
        const l = new LineSegments2(g, m);
        l.computeLineDistances();
        root.add(l);
        lines[ink] = l;
        mats[ink] = m;
    }
    return { root, faces, lines, mats };
}

/** Colour every ink of a piece: faded toward the ground by `fade`, edges toward the accent by `lit`. */
export function inkPiece(p: Piece, pal: Palette, fade: number, lit: number, tmp: Color, tmp2: Color) {
    for (const ink of INKS) {
        const m = p.mats[ink];
        if (!m) continue;
        const base = ink === 'hot' ? pal.text : pal.ink;
        if (lit > 0.001 && (ink === 'edge' || ink === 'mid' || ink === 'hot')) mixSRGB(tmp2, base, pal.accent, lit);
        else tmp2.copy(base);
        mixSRGB(tmp, pal.bg, tmp2, STRENGTH[ink] * fade);
        m.color.copy(tmp);
    }
}

export function disposePiece(p: Piece) {
    p.faces?.geometry.dispose();
    for (const ink of INKS) {
        p.lines[ink]?.geometry.dispose();
        p.mats[ink]?.dispose();
    }
}

/** Sample a cubic Bézier (bond wires, flex ribbons). */
export function bezier(a: V3, b: V3, c: V3, d: V3, n = 14): V3[] {
    const out: V3[] = [];
    for (let i = 0; i <= n; i++) {
        const t = i / n;
        const u = 1 - t;
        const k0 = u * u * u;
        const k1 = 3 * u * u * t;
        const k2 = 3 * u * t * t;
        const k3 = t * t * t;
        out.push([
            a[0] * k0 + b[0] * k1 + c[0] * k2 + d[0] * k3,
            a[1] * k0 + b[1] * k1 + c[1] * k2 + d[1] * k3,
            a[2] * k0 + b[2] * k1 + c[2] * k2 + d[2] * k3,
        ]);
    }
    return out;
}

