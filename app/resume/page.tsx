'use client';

import React from 'react';
import { useLanguage } from '../components/LanguageContext';

export default function Resume() {
    const { t } = useLanguage();

    return (
        <main style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1>{t('resume.title')}</h1>
            </header>

            <section>
                <a href="/dummy-resume.pdf" download>
                    <button style={{ padding: '1rem 2rem', fontSize: '1.2rem', cursor: 'pointer' }}>
                        {t('resume.download')}
                    </button>
                </a>
            </section>
        </main>
    );
}
