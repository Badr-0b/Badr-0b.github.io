'use client';

import React from 'react';
import { useLanguage } from '../../components/LanguageContext';
import { SHEET_NO, type Path, type StepId } from '../contact.data';

/* ===========================================================================
   The sheet's spec, as one line under the drawing. Only what has been
   answered, in the order it was asked; nothing waits there empty. Each entry
   is a way back to the question that wrote it.
   =========================================================================== */

/** `id` is the step an entry returns to; `v` names the value when it isn't the step's own. */
const ORDER: Record<Path, { id: StepId; v?: string }[]> = {
    project: [{ id: 'what' }, { id: 'stage' }, { id: 'when' }, { id: 'budget' }, { id: 'name' }],
    role: [{ id: 'what' }, { id: 'org', v: 'org' }, { id: 'org', v: 'role' }, { id: 'start' }, { id: 'term' }, { id: 'name' }],
    hello: [{ id: 'what' }, { id: 'name' }],
};

export default function Spec({
    path,
    steps,
    step,
    review,
    values,
    cite,
    onJump,
}: {
    path: Path;
    steps: StepId[];
    step: StepId;
    review: boolean;
    values: Partial<Record<string, string>>;
    /** the project the visitor came from, if an exit ramp said */
    cite?: string;
    onJump: (id: StepId) => void;
}) {
    const { t } = useLanguage();
    const filled = ORDER[path].filter((e) => values[e.v ?? e.id]);
    if (!filled.length) return null;

    return (
        <div className="ct-spec" role="group" aria-label={t('contact.tb.label')}>
            <span className="ct-spec__no">
                {t('projects.sec.sheet')} {SHEET_NO}
                {cite && (
                    <>
                        {' · '}
                        {t('contact.cell.ref')} <bdi className="ct-spec__ref">{cite}</bdi>
                    </>
                )}
            </span>
            {filled.map((e) => {
                const key = e.v ?? e.id;
                const value = values[key]!;
                const here = !review && step === e.id;
                const can = steps.includes(e.id) && !here;
                const inner = (
                    <>
                        {e.id === 'name' && <span className="ct-spec__k">{t('contact.cell.from')} </span>}
                        <bdi>{value}</bdi>
                    </>
                );
                return (
                    <span className="ct-spec__item" key={`${path}-${key}`}>
                        {can ? (
                            <button type="button" className="ct-spec__v" key={value} onClick={() => onJump(e.id)} data-hover>
                                {inner}
                            </button>
                        ) : (
                            <span className="ct-spec__v" key={value}>
                                {inner}
                            </span>
                        )}
                    </span>
                );
            })}
        </div>
    );
}
