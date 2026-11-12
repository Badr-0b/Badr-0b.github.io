'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { reducedMotion } from '../kit/motion';
import { KIND_PARAM, PATHS, pathOf, refFor, type Answers, type StepId, type What } from './contact.data';

/* ===========================================================================
   The brief's state: answers, where the visitor is, and the hand-off. The draft
   is kept in this browser (localStorage, best-effort) so leaving mid-way and
   coming back picks up where they were. Step changes run out → swap → in, so
   the question never just snaps.
   =========================================================================== */

export type Issued = 'gmail' | 'outlook' | 'mail' | 'copy';

type Draft = {
    v: 1;
    at: number;
    a: Answers;
    index: number;
    review: boolean;
    seed: string;
    ref?: string;
    issued?: Issued | null;
};

const KEY = 'contact-brief';
const KEEP = 14 * 24 * 3600 * 1000;
/** how long the outgoing question takes to leave (matches .ct[data-phase] in contact.css) */
const OUT_MS = 260;
/** how long a picked answer holds, lit, before the next question */
const HOLD_MS = 300;

const newSeed = () => `brief-${Math.random().toString(36).slice(2, 8)}`;

function read(): Draft | null {
    try {
        const d = JSON.parse(localStorage.getItem(KEY) || 'null') as Draft | null;
        if (!d || d.v !== 1 || Date.now() - d.at > KEEP || !d.a?.what) return null;
        return d;
    } catch {
        return null;
    }
}

export function useBrief() {
    const [a, setA] = useState<Answers>({});
    const [index, setIndex] = useState(0);
    const [review, setReview] = useState(false);
    const [seed, setSeed] = useState('brief');
    const [ref, setRef] = useState<string | undefined>();
    const [issued, setIssued] = useState<Issued | null>(null);
    const [restored, setRestored] = useState(false);
    const [ready, setReady] = useState(false);
    /** 'out' while the current question leaves; 'all' when the whole composition changes */
    const [phase, setPhase] = useState<'in' | 'out'>('in');
    const [swap, setSwap] = useState<'step' | 'all'>('step');
    /** set once the visitor has moved between questions (focus follows from then on) */
    const [moved, setMoved] = useState(false);
    const busy = useRef(false);
    /** the change waiting for the outgoing question to leave */
    const pending = useRef<(() => void) | null>(null);
    /** a picked answer, holding its beat (lit) before the brief moves on */
    const [hold, setHold] = useState<{ id: StepId; what?: What } | null>(null);

    const path = pathOf(a.what);
    const steps = PATHS[path];
    const at = Math.min(index, steps.length - 1);
    const step: StepId = steps[at];

    // mount: restore a draft, or take the first answer from the exit ramp that sent them
    useEffect(() => {
        const d = read();
        const params = new URLSearchParams(window.location.search);
        const kind = KIND_PARAM[params.get('kind') ?? ''] as What | undefined;
        const from = refFor(params.get('from'));
        if (d) {
            setA(d.a);
            setIndex(d.index);
            setReview(d.review);
            setSeed(d.seed);
            setRef(from ?? d.ref);
            setIssued(d.issued ?? null);
            setRestored(d.index > 0 || d.review);
        } else {
            setSeed(newSeed());
            if (kind) setA({ what: kind });
            if (from) setRef(from);
        }
        setReady(true);
    }, []);

    useEffect(() => {
        if (!ready) return;
        try {
            const d: Draft = { v: 1, at: Date.now(), a, index, review, seed, ref, issued };
            if (a.what) localStorage.setItem(KEY, JSON.stringify(d));
            else localStorage.removeItem(KEY);
        } catch {
            /* storage unavailable — the brief still works, it just won't be remembered */
        }
    }, [ready, a, index, review, seed, ref, issued]);

    /** Leave, change, arrive. `all` also fades the sheet (the composition changes). */
    const go = useCallback((change: () => void, mode: 'step' | 'all' = 'step') => {
        if (busy.current) return;
        setMoved(true);
        setRestored(false);
        if (reducedMotion()) {
            change();
            return;
        }
        busy.current = true;
        pending.current = change;
        setSwap(mode);
        setPhase('out');
    }, []);

    // The swap and the hold are timed by effects keyed on their state, not by loose
    // timers: anything that tears effects down mid-way (a hot reload) re-arms them
    // instead of stranding the page half-faded.
    useEffect(() => {
        if (phase !== 'out') return;
        const id = window.setTimeout(() => {
            const change = pending.current;
            pending.current = null;
            change?.();
            busy.current = false;
            setPhase('in');
        }, OUT_MS);
        return () => window.clearTimeout(id);
    }, [phase]);

    /** On from a step just answered — along the path that answer leads to. */
    const advance = useCallback(
        (id: StepId, what?: What) => {
            const list = PATHS[pathOf(what)];
            const i = list.indexOf(id);
            if (i < list.length - 1) go(() => setIndex(i + 1));
            else go(() => setReview(true), 'all');
        },
        [go]
    );

    useEffect(() => {
        if (!hold) return;
        const id = window.setTimeout(() => {
            setHold(null);
            advance(hold.id, hold.what);
        }, HOLD_MS);
        return () => window.clearTimeout(id);
    }, [hold, advance]);

    const next = useCallback(() => {
        if (hold) return;
        if (index < steps.length - 1) go(() => setIndex(index + 1));
        else go(() => setReview(true), 'all');
    }, [go, hold, index, steps.length]);

    const back = useCallback(() => {
        if (review) go(() => setReview(false), 'all');
        else if (index > 0) go(() => setIndex(index - 1));
    }, [go, index, review]);

    /** Pick an answer: it lights, holds a beat, then the next question comes in. */
    const choose = useCallback(
        (id: StepId, value: string) => {
            if (busy.current || hold) return;
            const what = id === 'what' ? (value as What) : a.what;
            setA((prev) => ({ ...prev, [id]: value }));
            setIssued(null);
            if (reducedMotion()) advance(id, what);
            else setHold({ id, what });
        },
        [a.what, advance, hold]
    );

    const write = useCallback((id: keyof Answers, value: string) => {
        setA((prev) => ({ ...prev, [id]: value }));
        setIssued(null);
    }, []);

    /** From the title block: go straight to the step that fills that cell. */
    const jump = useCallback(
        (id: StepId) => {
            const i = steps.indexOf(id);
            if (i < 0 || (!review && i === at)) return;
            go(() => {
                setIndex(i);
                setReview(false);
            }, review ? 'all' : 'step');
        },
        [at, go, review, steps]
    );

    const reset = useCallback(() => {
        go(() => {
            setA({});
            setIndex(0);
            setReview(false);
            setIssued(null);
            setRestored(false);
            setSeed(newSeed());
        }, 'all');
    }, [go]);

    return {
        a,
        path,
        steps,
        step,
        index: at,
        review,
        seed,
        ref,
        issued,
        restored,
        ready,
        moved,
        phase,
        swap,
        next,
        back,
        choose,
        write,
        jump,
        reset,
        issue: setIssued,
    };
}
