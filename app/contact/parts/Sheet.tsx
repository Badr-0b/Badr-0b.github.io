'use client';

import React, { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import { useLanguage } from '../../components/LanguageContext';
import Plate from '../../kit/Plate';
import type { Drawing } from '../../kit/draw';
import { genericBoard, genericDie, genericSoftware } from '../../kit/draw/generic';
import { clamp, ease, onFrame, reducedMotion, requestMeasure, wake } from '../../kit/motion';
import { SHEET_NO, TERM, WHEN, sheetProgress, type Answers, type StepId, type What } from '../contact.data';
import { CAL, calendarSheet, firmwareSheet, monthX, reservedSheet } from '../sheets';

/* ===========================================================================
   The visitor's sheet. The first answer picks the drawing; the full drawing
   waits underneath as a ghost, and each answer draws more of it in. A project's
   schedule runs as a dimension across the top margin; a role's window sits on
   the calendar. Handing the draft off stamps the sheet.
   =========================================================================== */

function drawingFor(what: What | undefined, seed: string, reserved: string, now: Date): Drawing {
    const title = `SHEET ${SHEET_NO}`;
    switch (what) {
        case 'board':
            return genericBoard(seed, title);
        case 'chip':
            return genericDie(seed, title);
        case 'firmware':
            return firmwareSheet(seed, title);
        case 'software':
            return genericSoftware(seed, title);
        case 'role':
            return calendarSheet(now, title);
        default:
            return reservedSheet(reserved);
    }
}

/** The finished drawing, faint, under the one being drawn: what's left to do. */
function Ghost({ drawing }: { drawing: Drawing }) {
    return (
        <g className="ct-ghost" aria-hidden="true">
            {drawing.layers
                .filter((l) => l.ink !== 'mask')
                .map((l, i) => (
                    <g key={i} className={`k-ink k-ink--${l.ink}`}>
                        {(Array.isArray(l.d) ? l.d : [l.d]).map((d, j) => (
                            <path key={j} d={d} />
                        ))}
                    </g>
                ))}
        </g>
    );
}

/** A project's schedule: a dimension line across the top margin, as long as the wait. */
function Schedule({ when }: { when?: string }) {
    const w = WHEN.find((x) => x.id === when);
    const L = 520;
    const len = (w?.span ?? 0.5) * L;
    const label = w ? `SCHEDULE · ${w.en.toUpperCase()}` : '';
    return (
        <g className={`ct-dim ${w ? 'is-on' : ''} ${w?.id === 'open' ? 'is-open' : ''}`} aria-hidden="true">
            <path d="M60 12v16M66 16.5L60 20l6 3.5" />
            {/* drawn as one dash along the full run: crisp at any length, and it eases */}
            <path className="ct-dim__line" d="M60 20H580" pathLength={1} style={{ strokeDasharray: `${(len / L).toFixed(4)} 2` }} />
            <g className="ct-dim__end" style={{ transform: `translate(${len}px, 0px)` }}>
                <path d="M60 12v16M54 16.5L60 20l-6 3.5" />
            </g>
            <g className="ct-dim__mid" style={{ transform: `translate(${len / 2}px, 0px)` }}>
                <text className="k-label k-label--hot" x={60} y={9} textAnchor="middle" key={label}>
                    {label}
                </text>
            </g>
        </g>
    );
}

/** A hello has nothing to draw: the note itself goes on the blank sheet, as it's written. */
function Note({ text }: { text: string }) {
    const line = text.replace(/\s+/g, ' ').trim();
    const shown = line.length > 52 ? `${line.slice(0, 51).trimEnd()}…` : line;
    return (
        <g className={`ct-note ${shown ? 'is-on' : ''}`} aria-hidden="true">
            <text className="k-label k-label--hot k-label--9" x={320} y={292} textAnchor="middle">
                {shown}
            </text>
        </g>
    );
}

const SPAN = CAL.x1 - CAL.x0;

/** A role's window on the calendar: from its start, for its term (open-ended runs off the end). */
function Window({ start, term }: { start?: number | null; term?: string }) {
    const t = TERM.find((x) => x.id === term);
    const flex = start === null;
    const s = start ?? 0;
    const x0 = flex ? CAL.x0 : monthX(Math.min(s, CAL.months - 0.5));
    const months = t ? (t.months ?? CAL.months) : 0;
    const x1 = flex ? CAL.x1 : t ? monthX(Math.min(CAL.months, s + months)) : x0;
    const w = Math.max(0, x1 - x0);
    const open = flex || (t && t.months === null);
    const on = start !== undefined;
    const label = flex ? 'START · FLEXIBLE' : t ? `${t.en.toUpperCase()}` : '';
    return (
        <g className={`ct-win ${on ? 'is-on' : ''} ${open ? 'is-open' : ''} ${t || flex ? 'has-term' : ''}`} aria-hidden="true">
            <g className="ct-win__at" style={{ transform: `translate(${x0}px, 0px)` }}>
                <path className="ct-win__cap" d="M0 194V258" />
                <rect className="ct-win__fill" x={0} y={208} width={SPAN} height={36} style={{ transform: `scaleX(${(w / SPAN).toFixed(4)})` } as CSSProperties} />
                <path className="ct-win__edge" d={`M0 208H${SPAN}`} pathLength={1} style={{ strokeDasharray: `${(w / SPAN).toFixed(4)} 2` }} />
                <path className="ct-win__edge" d={`M0 244H${SPAN}`} pathLength={1} style={{ strokeDasharray: `${(w / SPAN).toFixed(4)} 2` }} />
                <g className="ct-win__end" style={{ transform: `translate(${w}px, 0px)` }}>
                    <path className="ct-win__cap" d="M0 194V258" />
                </g>
                <g className="ct-win__mid" style={{ transform: `translate(${w / 2}px, 0px)` }}>
                    <text className="k-label k-label--hot" x={0} y={186} textAnchor="middle" key={label}>
                        {label}
                    </text>
                </g>
            </g>
        </g>
    );
}

export default function Sheet({
    a,
    steps,
    index,
    review,
    seed,
    start,
    issuedOn,
}: {
    a: Answers;
    steps: StepId[];
    index: number;
    review: boolean;
    seed: string;
    /** a role's start, in months from now (null = flexible, undefined = not answered) */
    start?: number | null;
    /** the date the draft was handed off, if it has been */
    issuedOn: string | null;
}) {
    const { t } = useLanguage();
    // the blank sheet: reserved until someone writes on it
    const reserved =
        a.what === 'hello'
            ? `${t('projects.sec.sheet')} ${SHEET_NO}`
            : `${t('projects.sec.sheet')} ${SHEET_NO} · ${t('projects.index.reserved')}`;
    const now = useMemo(() => new Date(), []);
    const drawing = useMemo(() => drawingFor(a.what, seed, reserved, now), [a.what, seed, reserved, now]);
    const drawKey = `${a.what ?? 'blank'}:${drawing.id}`;
    const target = sheetProgress(a, index, steps, drawing.stages.length, review);

    // the build: eased toward each new target at the site's pace (the plate damps on top)
    const progress = useRef(0);
    const drawn = useRef<string | null>(null);
    useEffect(() => {
        if (drawn.current !== drawKey) {
            drawn.current = drawKey;
            progress.current = 0;
        }
        if (reducedMotion()) {
            progress.current = target;
            wake();
            return;
        }
        const from = progress.current;
        const dist = Math.abs(target - from);
        if (dist < 0.0005) return;
        const dur = 700 + 1500 * Math.sqrt(dist);
        let t0 = -1;
        return onFrame(({ now: ms }) => {
            if (t0 < 0) t0 = ms;
            const q = clamp((ms - t0) / dur);
            progress.current = from + (target - from) * ease(q);
            return q < 1;
        });
    }, [drawKey, target]);

    // the composition can move the sheet without the page resizing: re-measure hairlines
    useEffect(() => {
        requestMeasure();
    }, [review]);

    const kind = a.what;
    return (
        <div className="ct-plate" data-kind={kind ?? 'blank'}>
            {/* a new drawing is a new plate: it locks on and builds from nothing */}
            <Plate key={drawKey} drawing={drawing} build={progress} strip={false} probe={false} className="ct-plate__k">
                {kind && kind !== 'hello' && <Ghost drawing={drawing} />}
                {kind && kind !== 'role' && kind !== 'hello' && <Schedule when={a.when} />}
                {kind === 'role' && <Window start={start} term={a.term} />}
                {kind === 'hello' && <Note text={a.message ?? ''} />}
            </Plate>
            <p className={`ct-stamp ${issuedOn ? 'is-on' : ''}`} aria-hidden={!issuedOn}>
                <span className="ct-stamp__k">{t('contact.stamp')}</span>
                <span className="ct-stamp__v" dir="ltr">
                    REV A · {issuedOn ?? '—'}
                </span>
            </p>
        </div>
    );
}
