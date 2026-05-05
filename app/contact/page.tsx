'use client';

import React from 'react';
import { useLanguage } from '../components/LanguageContext';

export default function Contact() {
    const { t } = useLanguage();

    return (
        <main>
            <header>
                <h1>{t('contact.title')}</h1>
                <p>{t('contact.description')}</p>
            </header>

            <section className="contact-form-section" style={{ margin: '2rem 0' }}>
                <form action="#" method="POST" style={{ display: 'flex', flexDirection: 'column', maxWidth: '400px', gap: '1rem' }}>
                    <label>
                        {t('contact.form.name')}
                        <br/>
                        <input type="text" name="name" required style={{ width: '100%', padding: '0.5rem' }} />
                    </label>
                    <label>
                        {t('contact.form.email')}
                        <br/>
                        <input type="email" name="email" required style={{ width: '100%', padding: '0.5rem' }} />
                    </label>
                    <label>
                        {t('contact.form.message')}
                        <br/>
                        <textarea name="message" rows={5} required style={{ width: '100%', padding: '0.5rem' }}></textarea>
                    </label>
                    <button type="submit" style={{ padding: '0.5rem', cursor: 'pointer' }}>{t('contact.form.submit')}</button>
                </form>
            </section>

            <section className="direct-email" style={{ margin: '2rem 0' }}>
                <p>{t('contact.email.text')} <a href="mailto:hello@example.com">hello@example.com</a></p>
            </section>

            <section className="links">
                <h2>{t('contact.links.title')}</h2>
                <ul style={{ display: 'flex', gap: '1rem', listStyle: 'none', padding: 0 }}>
                    <li><a href="https://github.com/badr" target="_blank" rel="noreferrer">GitHub</a></li>
                    <li><a href="https://upwork.com" target="_blank" rel="noreferrer">Upwork</a></li>
                    <li><a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a></li>
                    <li><a href="https://feneris.app" target="_blank" rel="noreferrer">Feneris</a></li>
                </ul>
            </section>
        </main>
    );
}
