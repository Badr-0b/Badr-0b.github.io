'use client';

import React from 'react';
import { useLanguage } from '../../components/LanguageContext';
import { SHEET_NO, type Path, type StepId } from '../contact.data';

/* ===========================================================================
   The title block — the box in a drawing's corner that says what the sheet is.
   It fills cell by cell as the brief is answered; a filled cell is a way back
   to the question that filled it.
   =========================================================================== */

/** `id` is the step a cell returns to; `v` names the value when it isn't the step's own. */
const CELLS: Record<Path, { id: StepId; k: string; v?: string }[]> = {
    project: [
        { id: 'what', k: 'contact.cell.project' },
        { id: 'stage', k: 'contact.cell.stage' },
        { id: 'when', k: 'contact.cell.schedule' },
        { id: 'budget', k: 'contact.cell.budget' },
        { id: 'name', k: 'contact.cell.from' },
    ],
    role: [
        { id: 'org', k: 'contact.cell.company', v: 'org' },
        { id: 'org', k: 'contact.cell.role', v: 'role' },
        { id: 'start', k: 'contact.cell.start' },
        { id: 'term', k: 'contact.cell.term' },
        { id: 'name', k: 'contact.cell.from' },
    ],
    hello: [
        { id: 'what', k: 'contact.cell.subject' },
        { id: 'name', k: 'contact.cell.from' },
    ],
};

function Cell({
    k,
    value,
    animKey,
    active,
    onJump,
    wide,
}: {
    k: string;
    value?: string;
    animKey: string;
    active: boolean;
    onJump?: () => void;
    wide?: boolean;
}) {
    const cls = `ct-tb__cell ${active ? 'is-active' : ''} ${value ? 'is-filled' : ''} ${wide ? 'ct-tb__cell--wide' : ''}`;
    const inner = (
        <>
            <span className="ct-tb__k">{k}</span>
            <span className="ct-tb__v" key={animKey}>
                {value ? <bdi>{value}</bdi> : <span className="ct-tb__empty">—</span>}
            </span>
        </>
    );
    return onJump ? (
        <button type="button" className={cls} onClick={onJump} data-hover aria-current={active ? 'step' : undefined}>
            {inner}
        </button>
    ) : (
        <div className={cls}>{inner}</div>
    );
}

export default function TitleBlock({
    path,
    started,
    steps,
    step,
    review,
    values,
    notes,
    date,
    issued,
    cite,
    onJump,
}: {
    path: Path;
    started: boolean;
    steps: StepId[];
    step: StepId;
    review: boolean;
    values: Partial<Record<string, string>>;
    notes: string;
    date: string;
    issued: boolean;
    /** the project the visitor came from, if an exit ramp said */
    cite?: string;
    onJump: (id: StepId) => void;
}) {
    const { t } = useLanguage();
    const jump = (id: StepId) => (started && steps.includes(id) ? () => onJump(id) : undefined);
    const live = (id: StepId) => !review && step === id;

    return (
        <div className="ct-tb" role="group" aria-label={t('contact.tb.label')} data-path={path}>
            <div className="ct-tb__sheet">
                <span className="ct-tb__k">{t('contact.cell.sheet')}</span>
                <span className="ct-tb__no">{SHEET_NO}</span>
                {cite && (
                    <span className="ct-tb__ref">
                        {t('contact.cell.ref')} <bdi>{cite}</bdi>
                    </span>
                )}
            </div>
            {CELLS[path].map((c) => (
                <Cell
                    key={`${path}-${c.v ?? c.id}`}
                    k={t(c.k)}
                    value={values[c.v ?? c.id]}
                    animKey={`${c.v ?? c.id}:${values[c.v ?? c.id] ?? ''}`}
                    active={live(c.id)}
                    onJump={jump(c.id)}
                />
            ))}
            <Cell
                k={`${t('contact.cell.date')} · ${t('contact.cell.rev')}`}
                value={`${date} · ${issued ? 'A' : '—'}`}
                animKey={`rev:${issued ? 'a' : '-'}`}
                active={false}
            />
            <Cell
                k={t('contact.cell.notes')}
                value={notes || undefined}
                animKey={`notes:${notes ? 'f' : 'e'}`}
                active={live('message')}
                onJump={jump('message')}
                wide
            />
        </div>
    );
}
