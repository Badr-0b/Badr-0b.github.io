/* ===========================================================================
   The brief, written out — subject, plain-text body, and the three ways to open
   it as a draft in the visitor's own inbox. Field labels are English (Badr's
   working language); the visitor's words go in verbatim.
   =========================================================================== */

import { EMAIL } from '../about/about.data';
import { BUDGET, STAGE, TERM, WHAT, WHEN, pathOf, type Answers, type Choice } from './contact.data';

export type Brief = { subject: string; body: string };

const en = (list: Choice[], id?: string) => (id ? list.find((c) => c.id === id)?.en : undefined);

export function composeBrief(
    a: Answers,
    ctx: { sheet: string; date: string; ref?: string; startEn?: string }
): Brief {
    const path = pathOf(a.what);
    const name = a.name?.trim();
    const message = a.message?.trim();
    const rows: [string, string | undefined][] = [];
    let subject: string;

    if (path === 'project') {
        const what = en(WHAT, a.what);
        const stage = en(STAGE, a.stage);
        rows.push(['Project', what], ['Stage', stage], ['Schedule', en(WHEN, a.when)], ['Budget', en(BUDGET, a.budget)]);
        subject = ['Brief', [what, stage].filter(Boolean).join(' · ')].filter(Boolean).join(' — ');
    } else if (path === 'role') {
        const org = a.org?.trim();
        const role = a.role?.trim();
        rows.push(['Company', org], ['Role', role], ['Start', ctx.startEn], ['Term', en(TERM, a.term)]);
        subject = ['Internship / role', [org, role].filter(Boolean).join(' · ')].filter(Boolean).join(' — ');
    } else {
        subject = 'Hello';
    }
    if (name) subject += ` — ${name}`;
    rows.push(['Ref', ctx.ref]);

    const fields = rows.filter(([, v]) => v).map(([k, v]) => `${`${k}:`.padEnd(10)}${v}`);
    const head = path === 'hello' ? `NOTE · SHEET ${ctx.sheet}` : `BRIEF · SHEET ${ctx.sheet}`;
    const body = [
        head,
        ...(fields.length ? ['', ...fields] : []),
        '',
        message || '(no notes)',
        ...(name ? ['', `— ${name}`] : []),
        '',
        `Drafted at badr-0b.github.io/contact · ${ctx.date}`,
    ].join('\n');

    return { subject, body };
}

const q = (o: Record<string, string>) =>
    Object.entries(o)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('&');

/** The longest URL each route takes reliably (mailto goes through the OS: keep it short). */
const MAX = { mailto: 1900, web: 7000 };

export type Route = 'gmail' | 'outlook' | 'mail';

/**
 * A draft URL for a route. If the full brief would make the URL too long for it, the
 * draft opens with a one-line body and `overflow` is set: the caller copies the full
 * brief to the clipboard first, so it can be pasted in.
 */
export function draftUrl(route: Route, b: Brief): { href: string; overflow: boolean } {
    const build = (body: string) => {
        if (route === 'gmail') return `https://mail.google.com/mail/?view=cm&fs=1&${q({ to: EMAIL, su: b.subject, body })}`;
        if (route === 'outlook') return `https://outlook.office.com/mail/deeplink/compose?${q({ to: EMAIL, subject: b.subject, body })}`;
        return `mailto:${EMAIL}?${q({ subject: b.subject, body: body.replace(/\n/g, '\r\n') })}`;
    };
    const full = build(b.body);
    const max = route === 'mail' ? MAX.mailto : MAX.web;
    if (full.length <= max) return { href: full, overflow: false };
    return { href: build('(The brief is on your clipboard — paste it here.)'), overflow: true };
}

/** Everything, for the clipboard: address, subject, body. */
export const briefText = (b: Brief) => `To: ${EMAIL}\nSubject: ${b.subject}\n\n${b.body}`;

/** The old way: a throwaway selection. Works inside the click on browsers without the API. */
function legacyCopy(text: string) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
        ok = document.execCommand('copy');
    } catch {
        ok = false;
    }
    ta.remove();
    return ok;
}

/**
 * Copy text; resolves false if nothing could be copied. The clipboard API can stall
 * (an unanswered permission prompt), so it gets a moment, then the old way takes over.
 */
export async function copyText(text: string): Promise<boolean> {
    if (!navigator.clipboard?.writeText) return legacyCopy(text);
    try {
        const done = await Promise.race([
            navigator.clipboard.writeText(text).then(() => true),
            new Promise<false>((r) => setTimeout(() => r(false), 700)),
        ]);
        return done || legacyCopy(text);
    } catch {
        return legacyCopy(text);
    }
}
