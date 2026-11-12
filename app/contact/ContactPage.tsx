'use client';

import React, { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { requestMeasure } from '../kit/motion';
import { useClock } from '../kit/useClock';
import {
    BUDGET,
    SHEET_NO,
    STAGE,
    TERM,
    WHAT,
    WHEN,
    startById,
    startChoices,
    type Choice,
    type StepId,
} from './contact.data';
import { composeBrief } from './compose';
import { useBrief } from './useBrief';
import Step from './parts/Step';
import Sheet from './parts/Sheet';
import TitleBlock from './parts/TitleBlock';
import Exits from './parts/Exits';
import Escape from './parts/Escape';

/* ===========================================================================
   /contact — the brief. Built from AESTHETIC_DIRECTION.md + Bare Bones.md.
   /projects ends on a reserved, blank sheet; this page is that sheet. One
   question at a time on the near side, and the visitor's answers draw their
   project onto the sheet on the far side while its title block fills in. It
   ends as a draft in their own inbox. One curve, transform/opacity only, RTL
   mirrored, every motion with a reduced-motion end state.
   =========================================================================== */

const pad = (n: number) => String(n).padStart(2, '0');
const isoDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export default function ContactPage() {
    const { t, language } = useLanguage();
    const brief = useBrief();
    const { a, path, steps, step, index, review, issued } = brief;
    const { time, diff, delta } = useClock();
    const [today, setToday] = useState<Date | null>(null);
    // compose the page in once mounted — React owns this class (an imperative one would be wiped on the next render)
    const [composed, setComposed] = useState(false);

    useEffect(() => {
        setToday(new Date());
        const id = requestAnimationFrame(() => setComposed(true));
        return () => cancelAnimationFrame(id);
    }, []);

    useEffect(() => {
        requestMeasure();
    }, [language, review]);

    const now = useMemo(() => today ?? new Date(), [today]);
    const date = today ? isoDay(today) : '—';
    const starts = useMemo(() => startChoices(now, language), [now, language]);
    const start = useMemo(() => startById(a.start, now, language), [a.start, now, language]);

    const choicesFor = (id: StepId): Choice[] | null => {
        switch (id) {
            case 'what':
                return WHAT;
            case 'stage':
                return STAGE;
            case 'when':
                return WHEN;
            case 'budget':
                return BUDGET;
            case 'start':
                return starts;
            case 'term':
                return TERM;
            default:
                return null;
        }
    };
    const choices = review ? null : choicesFor(step);

    const label = (list: Choice[], id?: string) => {
        const c = list.find((x) => x.id === id);
        return c ? (c.label ?? t(c.key!)) : undefined;
    };
    const values: Partial<Record<string, string>> = {
        what: label(WHAT, a.what),
        stage: label(STAGE, a.stage),
        when: label(WHEN, a.when),
        budget: label(BUDGET, a.budget),
        org: a.org?.trim() || undefined,
        role: a.role?.trim() || undefined,
        start: start ? (start.label ?? (start.key ? t(start.key) : undefined)) : undefined,
        term: label(TERM, a.term),
        name: a.name?.trim() || undefined,
    };

    const email = useMemo(
        () => composeBrief(a, { sheet: SHEET_NO, date, ref: brief.ref, startEn: start?.en }),
        [a, date, brief.ref, start]
    );

    // keys: numbers pick, Enter moves on, Backspace goes back (never while typing)
    const { choose, next, back } = brief;
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.defaultPrevented || e.altKey) return;
            const el = e.target instanceof HTMLElement ? e.target : document.body;
            if (document.body.classList.contains('modal-lock')) return;
            if (el.closest('input, textarea, select, [contenteditable="true"]')) {
                if (!el.closest('.ct-step')) return;
                if (e.key === 'Enter' && el.tagName === 'INPUT') {
                    e.preventDefault();
                    next();
                } else if (e.key === 'Enter' && el.tagName === 'TEXTAREA' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    next();
                }
                return;
            }
            if (e.metaKey || e.ctrlKey) return;
            if (e.key === 'Backspace') {
                e.preventDefault();
                back();
                return;
            }
            if (review) return;
            if (choices && /^[1-9]$/.test(e.key)) {
                const c = choices[Number(e.key) - 1];
                if (c) {
                    e.preventDefault();
                    choose(step, c.id);
                }
                return;
            }
            if (e.key === 'Enter' && !el.closest('button, a, summary') && a[step as keyof typeof a]) {
                e.preventDefault();
                next();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [a, back, choices, choose, next, review, step]);

    const [pre, post] = t('about.now.diff').split('{d}');
    const total = steps.length;
    const keysHint = review
        ? `⌫ ${t('contact.keys.back')}`
        : choices
          ? `1–${choices.length} ${t('contact.keys.pick')} · ↵ ${t('contact.keys.next')} · ⌫ ${t('contact.keys.back')}`
          : step === 'message'
            ? `Ctrl ↵ ${t('contact.keys.next')}`
            : `↵ ${t('contact.keys.next')}`;

    return (
        <main
            className={`ct k-scope ${composed ? 'is-ready' : ''} ${review ? 'is-review' : ''}`}
            data-phase={brief.phase}
            data-swap={brief.swap}
            data-path={path}
        >
            <header className="ct-meta" data-in style={{ '--d': '120ms' } as CSSProperties}>
                <h1 className="ct-meta__title">
                    {t('contact.meta.title')} — {t('projects.sec.sheet')} {SHEET_NO}
                </h1>
                <p className="ct-meta__step" aria-live="polite">
                    {review ? (
                        t('contact.meta.review')
                    ) : (
                        <>
                            <span className="ct-meta__n" dir="ltr">
                                {pad(index + 1)} / {pad(total)}
                            </span>
                            <span className="ct-meta__rule" aria-hidden="true">
                                <span className="ct-meta__fill" style={{ transform: `scaleX(${(index + 1) / total})` }} />
                            </span>
                        </>
                    )}
                </p>
            </header>

            <div className="ct-status" data-in style={{ '--d': '260ms' } as CSSProperties}>
                <p className="ct-status__avail">
                    <span className="ct-status__dot" aria-hidden="true" />
                    {t('about.now.available')}
                </p>
                <p className="ct-status__time">
                    <span>{t('about.now.place')}</span>
                    <span className="ct-status__clock" dir="ltr">
                        {time}
                    </span>
                    <span>
                        {diff === null ? ' ' : diff === 0 ? (
                            t('about.now.same')
                        ) : (
                            <>
                                {pre}
                                <span dir="ltr">{delta}</span>
                                {post}
                            </>
                        )}
                    </span>
                </p>
            </div>

            <section className="ct-step" aria-label={t('contact.meta.title')}>
                {review ? (
                    <Exits
                        brief={email}
                        index={total + 1}
                        issued={issued}
                        time={time}
                        focus={brief.moved}
                        onIssue={brief.issue}
                        onBack={brief.back}
                        onReset={brief.reset}
                    />
                ) : (
                    <Step
                        key={`${path}-${step}`}
                        step={step}
                        path={path}
                        index={index}
                        total={total}
                        a={a}
                        choices={choices}
                        focus={brief.moved}
                        restored={brief.restored}
                        onChoose={brief.choose}
                        onWrite={brief.write}
                        onNext={brief.next}
                        onBack={brief.back}
                        onReset={brief.reset}
                    />
                )}
            </section>

            <div className="ct-sheet">
                <Sheet
                    a={a}
                    steps={steps}
                    index={index}
                    review={review}
                    seed={brief.seed}
                    start={a.start ? (start?.offset ?? null) : undefined}
                    issuedOn={issued ? date : null}
                />
                <TitleBlock
                    path={path}
                    started={!!a.what}
                    steps={steps}
                    step={step}
                    review={review}
                    values={values}
                    notes={a.message?.trim() ?? ''}
                    date={date}
                    issued={!!issued}
                    cite={brief.ref}
                    onJump={brief.jump}
                />
            </div>

            <footer className="ct-foot" data-in style={{ '--d': '520ms' } as CSSProperties}>
                <span className="ct-foot__keys" aria-hidden="true">
                    {keysHint}
                </span>
                <Escape />
            </footer>
        </main>
    );
}
