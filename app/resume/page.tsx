'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../components/LanguageContext';
import './resume.css';

const PDF = '/badr-obtel-resume.pdf';

export default function Resume() {
    const { t } = useLanguage();

    return (
        <main className="resume-page">
            <div className="resume-page__bar">
                <Link href="/" className="text-link text-link--dim" data-hover>
                    <span aria-hidden="true">←</span> {t('nav.home')}
                </Link>
                <span className="resume-page__title">{t('resume.title')}</span>
                <a className="text-link" href={PDF} download="Badr Obtel - Resume.pdf" data-hover>
                    {t('resume.download')} <span aria-hidden="true">↓</span>
                </a>
            </div>
            <div className="resume-page__doc">
                <iframe
                    src={`${PDF}#toolbar=0&navpanes=0&view=FitH`}
                    title={t('resume.title')}
                />
            </div>
        </main>
    );
}
