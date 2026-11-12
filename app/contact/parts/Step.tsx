'use client';

import React, { useEffect, useRef, type CSSProperties, type KeyboardEvent } from 'react';
import { useLanguage } from '../../components/LanguageContext';
import { LIMIT, type Answers, type Choice, type Path, type StepId } from '../contact.data';

/* ===========================================================================
   One question, set like the site's heroes. Answers are a quiet numbered list
   (no rules between them): a number key, the answer, and a note that surfaces
   on hover or focus. Picking one lights it and the next question follows; the
   free-text steps keep a continue control.
   =========================================================================== */

const pad = (n: number) => String(n).padStart(2, '0');

/** The page's place in the site, then where the visitor is in the brief. */
export function Eyebrow({ i, children }: { i: number; children: React.ReactNode }) {
    const { t } = useLanguage();
    return (
        <p className="ct-q__eyebrow" style={{ '--i': i } as CSSProperties}>
            <span className="ct-q__n">(03)</span>
            <span>
                {t('nav.contact')} — {children}
            </span>
        </p>
    );
}

function Choices({
    id,
    list,
    value,
    labelledBy,
    onPick,
}: {
    id: StepId;
    list: Choice[];
    value?: string;
    labelledBy: string;
    onPick: (id: StepId, v: string) => void;
}) {
    const { t } = useLanguage();
    // arrow keys move between answers (one radio group, one tab stop)
    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (!['ArrowDown', 'ArrowUp'].includes(e.key)) return;
        const btns = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('.ct-opt'));
        const i = btns.indexOf(document.activeElement as HTMLButtonElement);
        const n = e.key === 'ArrowDown' ? (i + 1) % btns.length : (i - 1 + btns.length) % btns.length;
        btns[n]?.focus();
        e.preventDefault();
    };
    const sel = list.findIndex((c) => c.id === value);
    return (
        <div className="ct-opts" role="radiogroup" aria-labelledby={labelledBy} onKeyDown={onKeyDown}>
            {list.map((c, i) => {
                const on = c.id === value;
                return (
                    <button
                        key={c.id}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        tabIndex={on || (sel < 0 && i === 0) ? 0 : -1}
                        className={`ct-opt ${on ? 'is-on' : ''}`}
                        style={{ '--i': i } as CSSProperties}
                        onClick={() => onPick(id, c.id)}
                        data-hover
                    >
                        <span className="ct-opt__n" aria-hidden="true">
                            {i + 1}
                        </span>
                        <span className="ct-opt__label">{c.label ?? t(c.key!)}</span>
                        {c.note && <span className="ct-opt__note">{t(c.note)}</span>}
                    </button>
                );
            })}
        </div>
    );
}

export default function Step({
    step,
    path,
    index,
    total,
    a,
    choices,
    focus,
    restored,
    onChoose,
    onWrite,
    onNext,
    onBack,
    onReset,
}: {
    step: StepId;
    path: Path;
    index: number;
    total: number;
    a: Answers;
    choices: Choice[] | null;
    /** move focus into the question when it arrives (after the first navigation) */
    focus: boolean;
    restored: boolean;
    onChoose: (id: StepId, v: string) => void;
    onWrite: (id: keyof Answers, v: string) => void;
    onNext: () => void;
    onBack: () => void;
    onReset: () => void;
}) {
    const { t } = useLanguage();
    const rootRef = useRef<HTMLDivElement>(null);
    const titleId = `ct-q-${step}`;
    const q = step === 'message' ? `contact.q.message.${path}` : `contact.q.${step}`;
    const h = step === 'message' ? `contact.h.message.${path}` : `contact.h.${step}`;
    const last = index === total - 1;

    useEffect(() => {
        if (!focus) return;
        const root = rootRef.current;
        const field = root?.querySelector<HTMLElement>('input, textarea');
        const target = field ?? root?.querySelector<HTMLElement>('.ct-q__title');
        target?.focus({ preventScroll: true });
        if (field instanceof HTMLTextAreaElement || field instanceof HTMLInputElement) {
            const n = field.value.length;
            field.setSelectionRange(n, n);
        }
        // the question changed: only the step itself was in focus
    }, [focus, step]);

    let answered = false;
    let body: React.ReactNode = null;
    if (choices) {
        const value = a[step as keyof Answers];
        answered = !!value;
        body = <Choices id={step} list={choices} value={value} labelledBy={titleId} onPick={onChoose} />;
    } else if (step === 'message') {
        const v = a.message ?? '';
        answered = !!v.trim();
        body = (
            <div className="ct-field ct-field--area">
                <textarea
                    className="ct-input ct-input--area"
                    aria-labelledby={titleId}
                    value={v}
                    maxLength={LIMIT.message}
                    rows={4}
                    placeholder={t('contact.ph.message')}
                    onChange={(e) => onWrite('message', e.target.value)}
                    data-hover
                />
                <span className="ct-field__count" aria-hidden="true" dir="ltr">
                    {v.length} / {LIMIT.message}
                </span>
            </div>
        );
    } else if (step === 'org') {
        answered = !!(a.org?.trim() || a.role?.trim());
        body = (
            <div className="ct-fields">
                <label className="ct-field">
                    <span className="ct-field__k">{t('contact.cell.company')}</span>
                    <input
                        className="ct-input"
                        value={a.org ?? ''}
                        maxLength={LIMIT.line}
                        autoComplete="organization"
                        placeholder={t('contact.ph.org')}
                        onChange={(e) => onWrite('org', e.target.value)}
                        data-hover
                    />
                </label>
                <label className="ct-field">
                    <span className="ct-field__k">{t('contact.cell.role')}</span>
                    <input
                        className="ct-input"
                        value={a.role ?? ''}
                        maxLength={LIMIT.line}
                        autoComplete="organization-title"
                        placeholder={t('contact.ph.role')}
                        onChange={(e) => onWrite('role', e.target.value)}
                        data-hover
                    />
                </label>
            </div>
        );
    } else if (step === 'name') {
        answered = !!a.name?.trim();
        body = (
            <div className="ct-field">
                <input
                    className="ct-input ct-input--line"
                    aria-labelledby={titleId}
                    value={a.name ?? ''}
                    maxLength={LIMIT.line}
                    autoComplete="name"
                    placeholder={t('contact.ph.name')}
                    onChange={(e) => onWrite('name', e.target.value)}
                    data-hover
                />
            </div>
        );
    }

    const isText = !choices;
    const showNext = answered;
    const showSkip = !answered && index > 0;

    return (
        <div className={`ct-q ${isText ? 'ct-q--text' : ''}`} ref={rootRef} data-step={step}>
            <Eyebrow i={0}>
                {index === 0 ? (
                    'Badr Obtel'
                ) : (
                    <span className="ct-q__count" dir="ltr">
                        {pad(index + 1)} / {pad(total)}
                    </span>
                )}
            </Eyebrow>
            <h2 className="ct-q__title" id={titleId} tabIndex={-1} style={{ '--i': 1 } as CSSProperties}>
                {t(q)}
            </h2>
            <p className="ct-q__hint" style={{ '--i': 2 } as CSSProperties}>
                {t(h)}
            </p>
            {restored && (
                <p className="ct-q__restored" style={{ '--i': 2 } as CSSProperties}>
                    {t('contact.restored')}{' '}
                    <button type="button" className="ct-link" onClick={onReset} data-hover>
                        {t('contact.restart')}
                    </button>
                </p>
            )}
            <div className="ct-q__body" style={{ '--i': 3 } as CSSProperties}>
                {body}
            </div>
            <div className="ct-nav" style={{ '--i': 4 } as CSSProperties}>
                {index > 0 && (
                    <button type="button" className="ct-btn ct-btn--back" onClick={onBack} data-hover>
                        <span className="ct-flip" aria-hidden="true">
                            ←
                        </span>
                        {t('contact.nav.back')}
                    </button>
                )}
                {showNext && (
                    <button type="button" className="ct-btn ct-btn--next" onClick={onNext} data-hover>
                        {t(last ? 'contact.nav.review' : 'contact.nav.next')}
                        <span className="ct-flip" aria-hidden="true">
                            →
                        </span>
                    </button>
                )}
                {showSkip && (
                    <button type="button" className="ct-btn ct-btn--skip" onClick={onNext} data-hover>
                        {t(last ? 'contact.nav.review' : 'contact.nav.skip')}
                    </button>
                )}
            </div>
        </div>
    );
}
