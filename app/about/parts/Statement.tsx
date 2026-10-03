'use client';

import React, { useEffect, useRef, useState, type CSSProperties } from 'react';
import { matches, onMeasure } from '../motion';

/* Statement markup: plain text with annotated phrases written as {n:phrase}. */
type Piece = { text: string; n?: number; end?: boolean };
type Word = { pieces: Piece[] };
type Token = Word | { space: string };

function parse(src: string): Piece[] {
    const out: Piece[] = [];
    const re = /\{(\d+):([^}]+)\}/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src))) {
        if (m.index > last) out.push({ text: src.slice(last, m.index) });
        out.push({ text: m[2], n: Number(m[1]) });
        last = m.index + m[0].length;
    }
    if (last < src.length) out.push({ text: src.slice(last) });
    return out;
}

/** Words are runs of non-space characters, even across an annotation boundary — so
 *  punctuation after a phrase never wraps onto a line of its own. `end` marks the
 *  final word of each source piece (where an annotation's marker goes). */
function tokenize(pieces: Piece[]): Token[] {
    const tokens: Token[] = [];
    let word: Word | null = null;
    for (const piece of pieces) {
        const parts = piece.text.split(/(\s+)/).filter(Boolean);
        let lastWord = -1;
        parts.forEach((part, i) => {
            if (!/^\s+$/.test(part)) lastWord = i;
        });
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (/^\s+$/.test(part)) {
                word = null;
                tokens.push({ space: part });
                continue;
            }
            if (!word) {
                word = { pieces: [] };
                tokens.push(word);
            }
            word.pieces.push({ text: part, n: piece.n, end: i === lastWord });
        }
    }
    return tokens;
}

interface StatementProps {
    text: string;
    notes: string[];
    noteLabel: string;
    /** split into rising words (Latin scripts); CJK and Arabic reveal as one block */
    split: boolean;
}

/**
 * The profile statement — dim prose, bright evidence. Each annotated phrase carries a
 * superscript that points to a margin note (Tufte-style sidenotes, aligned to their
 * line on wide screens). Hover or focus either side and both light up.
 */
export default function Statement({ text, notes, noteLabel, split }: StatementProps) {
    const [active, setActive] = useState(0);
    const bodyRef = useRef<HTMLDivElement>(null);
    const notesRef = useRef<HTMLOListElement>(null);

    // Align each sidenote with its marker's line (wide screens), pushing down on collision.
    useEffect(() => {
        const body = bodyRef.current;
        const list = notesRef.current;
        if (!body || !list) return;
        return onMeasure(() => {
            const items = Array.from(list.children) as HTMLElement[];
            if (!matches('(min-width: 1100px)')) {
                items.forEach((li) => (li.style.transform = ''));
                list.style.height = '';
                return;
            }
            const para = body.querySelector<HTMLElement>('.ab-profile__statement');
            if (!para) return;
            // Measure against the outer word box (never transformed) relative to the
            // paragraph (which shares any reveal offset), then add the paragraph's
            // untransformed offset — so this is the settled line, mid-reveal or not.
            const paraTop = para.getBoundingClientRect().top;
            let floor = 0;
            items.forEach((li, i) => {
                const marker = body.querySelector<HTMLElement>(`[data-mark="${i + 1}"]`);
                if (!marker) return;
                const anchor = (marker.closest('.ab-w') as HTMLElement | null) ?? marker;
                const top = anchor.getBoundingClientRect().top - paraTop + para.offsetTop;
                const y = Math.max(top - 1, floor);
                li.style.transform = `translateY(${y}px)`;
                floor = y + li.offsetHeight + 18;
            });
            list.style.height = `${Math.max(0, floor - 18)}px`;
        });
    }, [text, notes]);

    const mark = (n: number) => (
        <button
            type="button"
            className={`ab-mark ${active === n ? 'is-active' : ''}`}
            data-mark={n}
            aria-label={`${noteLabel} ${n}`}
            aria-describedby={`ab-note-${n}`}
            onFocus={() => setActive(n)}
            onBlur={() => setActive(0)}
            onClick={() => setActive(active === n ? 0 : n)}
        >
            {n}
        </button>
    );

    const anno = (piece: Piece, key: React.Key) => (
        <React.Fragment key={key}>
            <span
                className={`ab-anno ${piece.end ? '' : 'is-mid'} ${active === piece.n ? 'is-active' : ''}`}
                onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(piece.n!)}
                onPointerLeave={(e) => e.pointerType === 'mouse' && setActive(0)}
            >
                {piece.text}
            </span>
            {piece.end && mark(piece.n!)}
        </React.Fragment>
    );

    const pieces = parse(text);
    let content: React.ReactNode;

    if (split) {
        let wordIndex = 0;
        content = tokenize(pieces).map((tk, ti) => {
            if ('space' in tk) return tk.space;
            const i = wordIndex++;
            const tail = tk.pieces[tk.pieces.length - 1];
            return (
                <span className={`ab-w ${tail.n && !tail.end ? 'has-mid' : ''}`} key={ti}>
                    <span className="ab-w__i" style={{ '--i': i } as CSSProperties}>
                        {tk.pieces.map((p, pi) =>
                            p.n ? anno(p, pi) : <React.Fragment key={pi}>{p.text}</React.Fragment>
                        )}
                    </span>
                </span>
            );
        });
    } else {
        content = pieces.map((p, i) =>
            p.n ? anno({ ...p, end: true }, i) : <React.Fragment key={i}>{p.text}</React.Fragment>
        );
    }

    return (
        <div className={`ab-profile ${split ? 'is-split' : ''}`} ref={bodyRef}>
            {/* className stays static: the reveal adds .is-in imperatively */}
            <p className="ab-profile__statement" data-reveal={split ? 'words' : ''}>
                {content}
            </p>
            <ol className="ab-notes" ref={notesRef}>
                {notes.map((note, i) => (
                    <li
                        key={i}
                        id={`ab-note-${i + 1}`}
                        className={`ab-note ${active === i + 1 ? 'is-active' : ''}`}
                        onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(i + 1)}
                        onPointerLeave={(e) => e.pointerType === 'mouse' && setActive(0)}
                    >
                        <span className="ab-note__n">{i + 1}</span>
                        <span className="ab-note__text">{note}</span>
                    </li>
                ))}
            </ol>
        </div>
    );
}
