/* ===========================================================================
   The drawing kit — types. A Drawing is a technical plan view of a real artifact
   (a die, a board), split into layers that belong to the build stages it was
   actually made in. <Plate> renders it and replays those stages with the scroll.
   =========================================================================== */

/** Stroke styles — every drawing uses this one vocabulary (see kit.css). */
export type Ink =
    | 'edge' // outlines: the strongest hairline
    | 'mid' // component bodies, footprints
    | 'fine' // secondary detail
    | 'faint' // texture: rows, grids, pours
    | 'trace' // copper / metal routing
    | 'hot' // the one element a stage is about (in --text)
    | 'dash' // keep-outs, courtyards, overlays
    | 'dot' // pads and balls — a round-capped zero-length stroke, sized in drawing units
    | 'via' // small rings
    | 'wide' // power runs — a wide, quiet stroke
    | 'mask'; // a filled shape in the page ground, so it occludes what lies under it

export type Layer = {
    /** build stage this layer belongs to (index into Drawing.stages) */
    stage: number;
    ink: Ink;
    /**
     * Path data. An array is drawn as bands that sweep in, in order, within the
     * stage (a placer filling rows, a router working across the die).
     */
    d: string | string[];
    /** 0..1 — where in its stage this layer starts (stagger between layers) */
    at?: number;
    /** draw on along its length instead of fading in (each entry is one subpath) */
    draw?: boolean;
    /** placed things drop in from a few units above — pick-and-place */
    drop?: boolean;
    /** hidden below this plate width (px), where it would only add noise */
    minW?: number;
};

export type Box = { x: number; y: number; w: number; h: number };

export type Part = {
    id: string;
    /** reference designator / short name, shown in the probe and beside the cursor */
    name: string;
    /** what it is — technical copy, English like all project content */
    note: string;
    stage: number;
    /** the part's outline; it lights in the accent while inspected */
    d: string;
    /** hit area, in drawing units */
    hit: Box;
    /** where a balloon's leader lands */
    anchor: [number, number];
    /** where its balloon sits, out in the drawing's margin */
    balloon: [number, number];
};

export type Label = {
    x: number;
    y: number;
    text: string;
    stage: number;
    anchor?: 'start' | 'middle' | 'end';
    /** rendered size in px — constant on screen, whatever the plate's scale */
    size?: number;
    ink?: 'mid' | 'faint' | 'hot';
    /** rotate -90° (reads bottom-to-top) */
    vertical?: boolean;
    minW?: number;
};

export type Drawing = {
    id: string;
    /** viewBox size, in drawing units */
    w: number;
    h: number;
    /** i18n keys for the build stages, in the order the artifact was made */
    stages: string[];
    layers: Layer[];
    parts: Part[];
    labels: Label[];
    /** accessible one-line summary of what is drawn */
    title: string;
};
