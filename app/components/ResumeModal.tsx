'use client';

import React, { useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import './ResumeModal.css';

const PDF = '/badr-obtel-resume.pdf';

interface ResumeModalProps {
    open: boolean;
    onClose: () => void;
}

/**
 * Luxury PDF viewer — the resume rendered in place, framed in a monolith panel.
 * Closes on Escape / backdrop / ✕. Locks scroll. Matches AESTHETIC_DIRECTION.md.
 */
export default function ResumeModal({ open, onClose }: ResumeModalProps) {
    const { t } = useLanguage();

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        document.body.classList.add('modal-lock');
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.classList.remove('modal-lock');
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="rmodal"
            role="dialog"
            aria-modal="true"
            aria-label={t('resume.title')}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="rmodal__panel">
                <header className="rmodal__bar">
                    <span className="rmodal__title">{t('resume.title')}</span>
                    <div className="rmodal__actions">
                        <a
                            className="text-link rmodal__download"
                            href={PDF}
                            download="Badr Obtel - Resume.pdf"
                            data-hover
                        >
                            {t('resume.download')} <span aria-hidden="true">↓</span>
                        </a>
                        <button
                            type="button"
                            className="rmodal__close"
                            onClick={onClose}
                            data-hover
                            aria-label="Close resume"
                        >
                            ✕
                        </button>
                    </div>
                </header>
                <div className="rmodal__doc">
                    <iframe
                        className="rmodal__frame"
                        src={`${PDF}#toolbar=0&navpanes=0&view=FitH`}
                        title={t('resume.title')}
                    />
                </div>
            </div>
        </div>
    );
}
