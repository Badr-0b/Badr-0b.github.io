/* The drawing registry: a project's own drawing if it has one, otherwise a
   seeded fallback for its kind. */

import type { Drawing } from './types';
import { cleave } from './cleave';
import { nerona } from './nerona';
import { azimuth } from './azimuth';
import { genericBoard, genericDie, genericSoftware, type Kind } from './generic';

const bespoke: Record<string, Drawing> = { cleave, nerona, azimuth };
const cache = new Map<string, Drawing>();

export function drawingFor(slug: string, kind: Kind, title: string): Drawing {
    if (bespoke[slug]) return bespoke[slug];
    const key = `${kind}:${slug}`;
    let d = cache.get(key);
    if (!d) {
        d = kind === 'silicon' ? genericDie(slug, title) : kind === 'board' ? genericBoard(slug, title) : genericSoftware(slug, title);
        cache.set(key, d);
    }
    return d;
}

export type { Drawing, Part, Layer, Label, Ink } from './types';
export type { Kind } from './generic';
export { ROSE } from './azimuth';
export { blankSheet } from './generic';
