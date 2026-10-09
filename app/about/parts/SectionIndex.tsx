'use client';

import React, { useEffect, useRef, useState } from 'react';
import { onFrame, onMeasure, scrollToId } from '../../kit/motion';

type Item = { id: string; idx: string; name: string };

/**
 * A quiet instrument in the lower corner: where you are (03 / 06 · Experience), and —
 * opened — a contents list to jump anywhere. Appears once the hero is behind you.
 */
export default function SectionIndex({ items, label }: { items: Item[]; label: string }) {
    const [current, setCurrent] = useState(-1);
    const [visible, setVisible] = useState(false);
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLElement>(null);
    const currentRef = useRef(-1);
    const visibleRef = useRef(false);
    const ids = items.map((it) => it.id).join('|');

    useEffect(() => {
        const list = ids.split('|');
        let tops: number[] = [];
        let threshold = 400;
        const offMeasure = onMeasure(() => {
            const sy = window.scrollY;
            tops = list.map((id) => {
                const el = document.getElementById(id);
                return el ? el.getBoundingClientRect().top + sy : Infinity;
            });
            const hero = document.querySelector<HTMLElement>('.ab-hero');
            threshold = hero ? hero.offsetHeight * 0.6 : 400;
        });
        const offFrame = onFrame(({ y, vh }) => {
            const probe = y + vh * 0.45;
            let c = -1;
            tops.forEach((top, i) => {
                if (probe >= top) c = i;
            });
            if (c !== currentRef.current) {
                currentRef.current = c;
                setCurrent(c);
            }
            const v = y > threshold;
            if (v !== visibleRef.current) {
                visibleRef.current = v;
                setVisible(v);
                if (!v) setOpen(false);
            }
            return false;
        });
        return () => {
            offFrame();
            offMeasure();
        };
    }, [ids]);

    useEffect(() => {
        if (!open) return;
        const onDown = (e: PointerEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('pointerdown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('pointerdown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const total = String(items.length).padStart(2, '0');
    const now = current >= 0 ? items[current] : null;

    return (
        <nav
            ref={rootRef}
            className={`ab-index ${visible ? 'is-visible' : ''} ${open ? 'is-open' : ''}`}
            aria-label={label}
        >
            <ol className="ab-index__list" id="ab-index-list">
                {items.map((it, i) => (
                    <li key={it.id} style={{ '--i': items.length - 1 - i } as React.CSSProperties}>
                        <a
                            href={`#${it.id}`}
                            className={`ab-index__item ${i === current ? 'is-current' : ''}`}
                            tabIndex={open ? 0 : -1}
                            data-hover
                            onClick={(e) => {
                                e.preventDefault();
                                setOpen(false);
                                scrollToId(it.id);
                            }}
                        >
                            <span className="ab-index__item-idx">{it.idx}</span>
                            <span className="ab-index__item-name">{it.name}</span>
                        </a>
                    </li>
                ))}
            </ol>
            <button
                type="button"
                className="ab-index__btn"
                aria-expanded={open}
                aria-controls="ab-index-list"
                tabIndex={visible ? 0 : -1}
                onClick={() => setOpen((o) => !o)}
                data-hover
            >
                <span className="ab-index__num">{now ? now.idx : '00'}</span>
                <span className="ab-index__of">/ {total}</span>
                <span className="ab-index__name" key={now?.id ?? 'none'}>
                    {now ? now.name : label}
                </span>
                <span className="ab-index__caret" aria-hidden="true">
                    {open ? '−' : '+'}
                </span>
            </button>
        </nav>
    );
}
