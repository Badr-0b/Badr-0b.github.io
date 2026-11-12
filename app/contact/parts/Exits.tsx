'use client';

import React, { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useLanguage } from '../../components/LanguageContext';
import { useMagnet } from '../../kit/motion';
import { EMAIL } from '../../about/about.data';
import { briefText, copyText, draftUrl, type Brief, type Route } from '../compose';
import type { Issued } from '../useBrief';

/* ===========================================================================
   The hand-off. The brief opens as a draft in the visitor's own inbox — Gmail
   or Outlook on the web, their mail app, or the clipboard. The page can't see
   them press send, so it says only what it knows. A mail app that never opens
   (no handler set — common on desktop) is caught and answered with the others.
   =========================================================================== */

const pad = (n: number) => String(n).padStart(2, '0');

/** Did the mail app take over? If the page still has focus after a beat, nothing opened. */
function watchHandoff(onFail: () => void) {
    let left = false;
    const mark = () => {
        left = true;
    };
    window.addEventListener('blur', mark);
    document.addEventListener('visibilitychange', mark);
    return window.setTimeout(() => {
        window.removeEventListener('blur', mark);
        document.removeEventListener('visibilitychange', mark);
        if (!left && document.hasFocus()) onFail();
    }, 1600);
}

function Row({
    k,
    v,
    act,
    on,
    i,
    href,
    external,
    onClick,
    cursor,
}: {
    k: string;
    v: string;
    act: string;
    on: boolean;
    i: number;
    href?: string;
    external?: boolean;
    onClick: () => void;
    cursor: string;
}) {
    const arrow = useMagnet<HTMLSpanElement>(0.22, 5);
    const inner = (
        <>
            <span className="ct-exit__k">{k}</span>
            <span className="ct-exit__v">{v}</span>
            <span className="ct-exit__act" ref={arrow} aria-hidden="true">
                {/* a forward arrow turns with the reading direction (the magnet owns this span's transform) */}
                {act === '→' ? <span className="ct-flip">{act}</span> : act}
            </span>
        </>
    );
    const common = {
        className: `ct-exit ${on ? 'is-on' : ''}`,
        'data-hover': true,
        'data-cursor': cursor,
        'data-magnet-zone': true,
        style: { '--i': i } as CSSProperties,
    };
    return (
        <li>
            {href ? (
                <a href={href} onClick={onClick} {...common} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                    {inner}
                </a>
            ) : (
                <button type="button" onClick={onClick} {...common}>
                    {inner}
                </button>
            )}
        </li>
    );
}

export default function Exits({
    brief,
    index,
    issued,
    time,
    focus,
    onIssue,
    onBack,
    onReset,
}: {
    brief: Brief;
    index: number;
    issued: Issued | null;
    time: string;
    focus: boolean;
    onIssue: (r: Issued) => void;
    onBack: () => void;
    onReset: () => void;
}) {
    const { t } = useLanguage();
    const rootRef = useRef<HTMLDivElement>(null);
    const [touch, setTouch] = useState(false);
    const [guard, setGuard] = useState(false);
    const [overflow, setOverflow] = useState(false);
    /** nothing could copy: the email is opened for selecting by hand */
    const [manual, setManual] = useState(false);
    const watch = useRef(0);

    useEffect(() => {
        setTouch(window.matchMedia('(pointer: coarse)').matches);
        return () => window.clearTimeout(watch.current);
    }, []);

    useEffect(() => {
        if (focus) rootRef.current?.querySelector<HTMLElement>('.ct-q__title')?.focus({ preventScroll: true });
    }, [focus]);

    // a changed brief is a new hand-off
    useEffect(() => {
        setGuard(false);
        setOverflow(false);
        setManual(false);
    }, [brief]);

    const urls = useMemo(
        () => ({ gmail: draftUrl('gmail', brief), outlook: draftUrl('outlook', brief), mail: draftUrl('mail', brief) }),
        [brief]
    );

    // phones hand mail to the mail app reliably; desktops often have none set
    const routes: Route[] = touch ? ['mail', 'gmail', 'outlook'] : ['gmail', 'outlook', 'mail'];
    const names: Record<Route, string> = { gmail: 'Gmail', outlook: 'Outlook', mail: t('contact.exit.mail.k') };

    const open = (r: Route) => () => {
        const u = urls[r];
        setGuard(false);
        setOverflow(u.overflow);
        if (u.overflow) void copyText(briefText(brief));
        onIssue(r);
        window.clearTimeout(watch.current);
        if (r === 'mail') watch.current = watchHandoff(() => setGuard(true));
    };

    const copy = async () => {
        setGuard(false);
        setOverflow(false);
        const ok = await copyText(briefText(brief));
        setManual(!ok);
        if (ok) onIssue('copy');
    };

    const [pre, post] = t('contact.issued.next').split('{t}');
    const [toPre, toPost] = t('contact.issued.to').split('{e}');

    return (
        <div className="ct-q ct-q--review" ref={rootRef}>
            <p className="ct-q__eyebrow" style={{ '--i': 0 } as CSSProperties}>
                <span className="ct-q__n">({pad(index)})</span>
                {t('contact.review.eyebrow')}
            </p>
            <h2 className="ct-q__title" tabIndex={-1} style={{ '--i': 1 } as CSSProperties} key={issued ?? 'draft'}>
                {issued ? t(`contact.issued.${issued}`) : t('contact.review.title')}
            </h2>
            <p className="ct-q__hint" style={{ '--i': 2 } as CSSProperties} aria-live="polite">
                {issued ? (
                    <>
                        {issued === 'copy' ? (
                            <>
                                {toPre}
                                <bdi className="ct-q__addr" dir="ltr">
                                    {EMAIL}
                                </bdi>
                                {toPost}{' '}
                            </>
                        ) : (
                            <>{t('contact.issued.send')} </>
                        )}
                        {pre}
                        <span dir="ltr" className="ct-q__clock">
                            {time}
                        </span>
                        {post}
                    </>
                ) : (
                    t('contact.review.hint')
                )}
            </p>
            {overflow && <p className="ct-q__note">{t('contact.issued.overflow')}</p>}
            {guard && <p className="ct-q__note ct-q__note--guard">{t('contact.exit.guard')}</p>}
            {manual && <p className="ct-q__note ct-q__note--guard">{t('contact.exit.manual')}</p>}

            <ul className="ct-exits" style={{ '--i': 3 } as CSSProperties}>
                {routes.map((r, i) => (
                    <Row
                        key={r}
                        k={names[r]}
                        v={t(`contact.exit.${r}`)}
                        act={r === 'mail' ? '→' : '↗'}
                        on={issued === r}
                        i={i}
                        href={urls[r].href}
                        external={r !== 'mail'}
                        onClick={open(r)}
                        cursor={t('projects.contact.open')}
                    />
                ))}
                <Row
                    k={t('contact.exit.copy.k')}
                    v={issued === 'copy' ? t('projects.contact.copied') : t('contact.exit.copy')}
                    act="+"
                    on={issued === 'copy'}
                    i={3}
                    onClick={copy}
                    cursor={t('projects.contact.copy')}
                />
            </ul>

            <details className="ct-read" style={{ '--i': 4 } as CSSProperties} open={manual || undefined}>
                <summary className="ct-read__sum" data-hover>
                    {t('contact.review.read')}
                </summary>
                <pre className="ct-read__body" dir="auto">
                    {`To: ${EMAIL}\nSubject: ${brief.subject}\n\n${brief.body}`}
                </pre>
            </details>

            <div className="ct-nav" style={{ '--i': 5 } as CSSProperties}>
                <button type="button" className="ct-btn ct-btn--back" onClick={onBack} data-hover>
                    <span className="ct-flip" aria-hidden="true">
                        ←
                    </span>
                    {t('contact.review.edit')}
                </button>
                {issued && (
                    <button type="button" className="ct-btn ct-btn--skip" onClick={onReset} data-hover>
                        {t('contact.new')}
                    </button>
                )}
            </div>
        </div>
    );
}
