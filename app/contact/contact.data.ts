// ---------------------------------------------------------------------------
// /contact — the brief. One question per step; the first answer picks the path
// (a project, a role, or just hello) and the drawing the answers build. Every
// choice carries the English it is written into the email with (Badr's working
// language — the same rule as project content); the page itself is localized.
// ---------------------------------------------------------------------------

import { projects } from '../projects/projects.data';

/** The visitor's sheet is the next one in the drawing set. */
export const SHEET_NO = String(projects.length + 1).padStart(2, '0');

export type What = 'board' | 'chip' | 'firmware' | 'software' | 'role' | 'hello';
export type Path = 'project' | 'role' | 'hello';
export type StepId = 'what' | 'stage' | 'when' | 'budget' | 'org' | 'start' | 'term' | 'message' | 'name';

export type Answers = {
    what?: What;
    stage?: string;
    when?: string;
    budget?: string;
    org?: string;
    role?: string;
    start?: string;
    term?: string;
    message?: string;
    name?: string;
};

export type Choice = {
    id: string;
    /** i18n key for the label (or a literal `label`, for computed choices) */
    key?: string;
    label?: string;
    /** i18n key for the quiet note beside it */
    note?: string;
    /** how it reads in the email */
    en: string;
};

export const pathOf = (w?: What): Path => (w === 'role' ? 'role' : w === 'hello' ? 'hello' : 'project');

export const PATHS: Record<Path, StepId[]> = {
    project: ['what', 'stage', 'when', 'budget', 'message', 'name'],
    role: ['what', 'org', 'start', 'term', 'message', 'name'],
    hello: ['what', 'message', 'name'],
};

export const WHAT: Choice[] = [
    { id: 'board', key: 'contact.what.board', note: 'contact.what.board.n', en: 'Board (PCB)' },
    { id: 'chip', key: 'contact.what.chip', note: 'contact.what.chip.n', en: 'Chip (ASIC / FPGA)' },
    { id: 'firmware', key: 'contact.what.firmware', note: 'contact.what.firmware.n', en: 'Firmware' },
    { id: 'software', key: 'contact.what.software', note: 'contact.what.software.n', en: 'Software' },
    { id: 'role', key: 'contact.what.role', note: 'contact.what.role.n', en: 'Internship / role' },
    { id: 'hello', key: 'contact.what.hello', note: 'contact.what.hello.n', en: 'Hello' },
];

/** Where the thing is now — and how much of the sheet that already accounts for. */
export const STAGE: (Choice & { built: number })[] = [
    { id: 'idea', key: 'contact.stage.idea', note: 'contact.stage.idea.n', en: 'Idea', built: 0.2 },
    { id: 'paper', key: 'contact.stage.paper', note: 'contact.stage.paper.n', en: 'On paper (spec / schematic)', built: 0.4 },
    { id: 'proto', key: 'contact.stage.proto', note: 'contact.stage.proto.n', en: 'Prototype', built: 0.6 },
    { id: 'live', key: 'contact.stage.live', note: 'contact.stage.live.n', en: 'Shipping — needs a revision', built: 0.8 },
];

/** When it's needed — `span` is how far the schedule dimension runs across the sheet. */
export const WHEN: (Choice & { span: number })[] = [
    { id: 'month', key: 'contact.when.month', en: 'Within a month', span: 0.22 },
    { id: 'quarter', key: 'contact.when.quarter', en: '1–3 months', span: 0.5 },
    { id: 'later', key: 'contact.when.later', en: '3+ months', span: 0.84 },
    { id: 'open', key: 'contact.when.open', en: 'No fixed date', span: 1 },
];

export const BUDGET: Choice[] = [
    { id: 'b1', key: 'contact.budget.b1', en: 'Under $500' },
    { id: 'b2', key: 'contact.budget.b2', en: '$500–2k' },
    { id: 'b3', key: 'contact.budget.b3', en: '$2k–5k' },
    { id: 'b4', key: 'contact.budget.b4', en: '$5k+' },
    { id: 'unsure', key: 'contact.budget.unsure', en: 'Not sure yet' },
];

/** How long a role runs; null = open-ended. */
export const TERM: (Choice & { months: number | null })[] = [
    { id: 'summer', key: 'contact.term.summer', note: 'contact.term.summer.n', en: 'About 3 months', months: 3 },
    { id: 'half', key: 'contact.term.half', en: '3–6 months', months: 6 },
    { id: 'year', key: 'contact.term.year', en: '6–12 months', months: 12 },
    { id: 'open', key: 'contact.term.open', en: 'Not fixed yet', months: null },
];

/**
 * When a role would start: as soon as possible, the next three quarters (computed
 * from today, in the visitor's language), or flexible. `offset` = months from now.
 */
export function startChoices(now: Date, lang: string): (Choice & { offset: number | null })[] {
    const m0 = now.getMonth();
    const y0 = now.getFullYear();
    // the first quarter that starts after this month
    const q = Math.ceil((m0 + 1) / 3) * 3;
    const out: (Choice & { offset: number | null })[] = [
        { id: 'asap', key: 'contact.start.asap', en: 'As soon as possible', offset: 0.5 },
    ];
    for (let i = 0; i < 3; i++) {
        const a = new Date(y0, q + i * 3, 1);
        const b = new Date(y0, q + i * 3 + 2, 1);
        out.push({
            id: `q${a.getFullYear()}-${String(a.getMonth() + 1).padStart(2, '0')}`,
            label: monthRange(a, b, lang),
            en: monthRange(a, b, 'en-GB'),
            offset: q + i * 3 - m0,
        });
    }
    out.push({ id: 'flex', key: 'contact.start.flex', en: 'Flexible', offset: null });
    return out;
}

/** A saved start answer, even one whose quarter has since scrolled out of the list. */
export function startById(id: string | undefined, now: Date, lang: string) {
    if (!id) return undefined;
    const listed = startChoices(now, lang).find((c) => c.id === id);
    if (listed) return listed;
    const m = /^q(\d{4})-(\d{2})$/.exec(id);
    if (!m) return undefined;
    const a = new Date(Number(m[1]), Number(m[2]) - 1, 1);
    const b = new Date(a.getFullYear(), a.getMonth() + 2, 1);
    const offset = (a.getFullYear() - now.getFullYear()) * 12 + a.getMonth() - now.getMonth();
    return { id, label: monthRange(a, b, lang), en: monthRange(a, b, 'en-GB'), offset: Math.max(0, offset) };
}

function monthRange(a: Date, b: Date, lang: string) {
    try {
        const f = new Intl.DateTimeFormat(lang, { month: 'short', year: 'numeric' });
        if (typeof f.formatRange === 'function') return f.formatRange(a, b);
        return `${f.format(a)} – ${f.format(b)}`;
    } catch {
        return `${a.getMonth() + 1}/${a.getFullYear()} – ${b.getMonth() + 1}/${b.getFullYear()}`;
    }
}

/** Free-text limits: short enough that every draft URL stays openable. */
export const LIMIT = { message: 1000, line: 80 };

/** ?kind= from an exit ramp (a project's own kind) → the first answer. */
export const KIND_PARAM: Record<string, What> = {
    board: 'board',
    silicon: 'chip',
    chip: 'chip',
    firmware: 'firmware',
    software: 'software',
    role: 'role',
};

/** A project slug passed as ?from= → the reference written on the sheet. */
export function refFor(slug: string | null): string | undefined {
    if (!slug) return undefined;
    return projects.find((p) => p.slug === slug)?.title;
}

/**
 * How much of the sheet is drawn: the first answer lays down the first stage, a
 * project's own stage pre-draws what already exists, and each step after that
 * draws on — the review shows it whole.
 */
export function sheetProgress(a: Answers, index: number, steps: StepId[], stages: number, review: boolean): number {
    if (review || !a.what) return 1;
    if (a.what === 'hello') return 1;
    const first = 1 / stages;
    const built = STAGE.find((s) => s.id === a.stage)?.built ?? 0;
    return Math.min(1, Math.max(first, built, index / steps.length));
}
