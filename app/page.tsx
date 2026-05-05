'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from './components/LanguageContext';

export default function Home() {
    const { t } = useLanguage();

    return (
        <main>
            <section className="hero-section">
                <h1>{t('hero.title')}</h1>
                <p>{t('home.hero.positioning')}</p>
                <div>
                    <Link href="/projects"><button>{t('home.hero.cta.work')}</button></Link>
                    <Link href="/contact"><button>{t('home.hero.cta.contact')}</button></Link>
                </div>
            </section>

            <section className="selected-work-section">
                <h2>{t('home.selected_work.title')}</h2>
                <div className="project-cards">
                    {/* Project 1 */}
                    <div className="card">
                        <h3>ESP32 Custom Board</h3>
                        <p>Custom development board based on ESP32.</p>
                        <small>PCB Design, IoT</small>
                        <br/>
                        <Link href="/projects/esp32-custom-board">{t('projects.view_project')}</Link>
                    </div>
                    {/* Project 2 */}
                    <div className="card">
                        <h3>Analog ASIC</h3>
                        <p>Custom analog integrated circuit design.</p>
                        <small>ASIC, Analog</small>
                        <br/>
                        <Link href="/projects/analog-asic">{t('projects.view_project')}</Link>
                    </div>
                    {/* Project 3 */}
                    <div className="card">
                        <h3>Feneris</h3>
                        <p>SaaS platform.</p>
                        <small>Full-stack, Next.js</small>
                        <br/>
                        <Link href="/projects/feneris">{t('projects.view_project')}</Link>
                    </div>
                </div>
            </section>

            <section className="capabilities-section">
                <h2>{t('home.capabilities.title')}</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <span>{t('home.capabilities.1')}</span>
                    <span>{t('home.capabilities.2')}</span>
                    <span>{t('home.capabilities.3')}</span>
                    <span>{t('home.capabilities.4')}</span>
                    <span>{t('home.capabilities.5')}</span>
                </div>
            </section>

            <section className="about-blurb-section">
                <p>{t('home.about.blurb')}</p>
                <Link href="/about">{t('home.about.more')}</Link>
            </section>

            <footer className="cta-footer">
                <p>{t('home.cta.text')}</p>
                <Link href="/contact"><button>{t('home.cta.button')}</button></Link>
            </footer>
        </main>
    );
}
