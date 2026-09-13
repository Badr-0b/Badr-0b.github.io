'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from './LanguageContext';
import './Entrance.css';

type Phase = 'init' | 'void' | 'charge' | 'reveal' | 'settle' | 'done';

const KEY = 'domain.entered';
const T_VOID = 850;
const T_CHARGE = 650;
const T_REVEAL = 1100;
const T_SETTLE = 750;

interface EntranceProps {
    /** Fires once the site is being revealed (settle begins, or immediately if skipped). */
    onDone?: () => void;
}

/**
 * The "6-star pull" entrance — FELT, NOT SHOWN (AESTHETIC_DIRECTION.md §2).
 * void -> charge -> "welcome to my domain" + one specular sheen -> settle.
 * Skippable (click / key / scroll), once-only (localStorage), reduced-motion safe.
 * Calls onDone once at the settle handoff so the hero can compose in as the void dissolves.
 */
export default function Entrance({ onDone }: EntranceProps) {
    const { t } = useLanguage();
    const [phase, setPhase] = useState<Phase>('init');
    const timers = useRef<number[]>([]);
    const settledRef = useRef(false);

    // fire the reveal handoff exactly once, independent of onDone identity
    const onDoneRef = useRef(onDone);
    onDoneRef.current = onDone;
    const doneFired = useRef(false);
    const fireDone = useCallback(() => {
        if (doneFired.current) return;
        doneFired.current = true;
        onDoneRef.current?.();
    }, []);

    const clearTimers = useCallback(() => {
        timers.current.forEach((id) => window.clearTimeout(id));
        timers.current = [];
    }, []);

    const finish = useCallback(() => {
        clearTimers();
        try {
            localStorage.setItem(KEY, '1');
        } catch {
            /* private mode — fine, it just replays next time */
        }
        document.body.classList.remove('entrance-lock');
        setPhase('done');
    }, [clearTimers]);

    const skip = useCallback(() => {
        if (settledRef.current) return;
        settledRef.current = true;
        clearTimers();
        setPhase('settle');
        // unlock scroll now (not at finish) so the journey's ScrollTriggers build against a
        // scrollable page — otherwise pins mis-measure and lock at the top.
        document.body.classList.remove('entrance-lock');
        fireDone();
        timers.current.push(window.setTimeout(finish, T_SETTLE));
    }, [clearTimers, finish, fireDone]);

    // schedule the ritual
    useEffect(() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let seen = false;
        try {
            seen = localStorage.getItem(KEY) === '1';
        } catch {
            /* ignore */
        }
        if (seen || reduce) {
            setPhase('done');
            fireDone();
            return;
        }

        document.body.classList.add('entrance-lock');
        setPhase('void');
        const t1 = window.setTimeout(() => setPhase('charge'), T_VOID);
        const t2 = window.setTimeout(() => setPhase('reveal'), T_VOID + T_CHARGE);
        const t3 = window.setTimeout(() => {
            settledRef.current = true;
            setPhase('settle');
            document.body.classList.remove('entrance-lock');
            fireDone();
        }, T_VOID + T_CHARGE + T_REVEAL);
        const t4 = window.setTimeout(finish, T_VOID + T_CHARGE + T_REVEAL + T_SETTLE);
        timers.current = [t1, t2, t3, t4];

        return () => {
            clearTimers();
            document.body.classList.remove('entrance-lock');
        };
    }, [finish, clearTimers, fireDone]);

    // skip affordances
    useEffect(() => {
        if (phase === 'init' || phase === 'done') return;
        const onKey = () => skip();
        const onWheel = () => skip();
        window.addEventListener('keydown', onKey);
        window.addEventListener('wheel', onWheel, { passive: true });
        window.addEventListener('touchmove', onWheel, { passive: true });
        return () => {
            window.removeEventListener('keydown', onKey);
            window.removeEventListener('wheel', onWheel);
            window.removeEventListener('touchmove', onWheel);
        };
    }, [phase, skip]);

    if (phase === 'init' || phase === 'done') return null;

    return (
        <div className={`entrance entrance--${phase}`} onClick={skip} role="presentation">
            <div className="entrance__charge" aria-hidden="true" />
            <h1 className="entrance__line">
                {t('hero.domain')}
                <span className="entrance__sheen" aria-hidden="true" />
            </h1>
            <button type="button" className="entrance__skip" onClick={skip}>
                skip
            </button>
        </div>
    );
}
