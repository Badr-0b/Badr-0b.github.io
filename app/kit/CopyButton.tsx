'use client';

import React, { useEffect, useState } from 'react';
import { useMagnet } from './motion';
import './kit.css';

/** Copy text in place — no alert; the label itself turns over to confirm. */
export default function CopyButton({ text, label, done }: { text: string; label: string; done: string }) {
    const [copied, setCopied] = useState(false);
    const ref = useMagnet<HTMLButtonElement>();

    useEffect(() => {
        if (!copied) return;
        const id = window.setTimeout(() => setCopied(false), 1800);
        return () => window.clearTimeout(id);
    }, [copied]);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            // older / insecure contexts: a throwaway selection
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand('copy');
            } catch {
                /* nothing else to try — the text is still on screen */
            }
            ta.remove();
        }
        setCopied(true);
    };

    return (
        <button type="button" ref={ref} className={`k-copy ${copied ? 'is-copied' : ''}`} onClick={copy} data-hover>
            <span className="k-copy__a" aria-hidden={copied}>
                {label}
            </span>
            <span className="k-copy__b" aria-hidden={!copied}>
                {done}
            </span>
            <span className="k-sr" aria-live="polite">
                {copied ? done : ''}
            </span>
        </button>
    );
}
