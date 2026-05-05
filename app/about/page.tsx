'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../components/LanguageContext';

export default function About() {
    const { t } = useLanguage();

    return (
        <main>
            <header>
                <h1>{t('about.title')}</h1>
            </header>

            <section className="who-you-are">
                <p>{t('about.who')}</p>
            </section>

            <section className="what-you-work-with" style={{ display: 'flex', gap: '4rem', margin: '2rem 0' }}>
                <div>
                    <h2>{t('about.stack.hardware')}</h2>
                    <ul>
                        <li>KiCad</li>
                        <li>ESP32</li>
                        <li>STM32</li>
                        <li>ASIC design tools</li>
                        <li>FPGA toolchains</li>
                    </ul>
                </div>
                <div>
                    <h2>{t('about.stack.software')}</h2>
                    <ul>
                        <li>Embedded C</li>
                        <li>VHDL/Verilog</li>
                        <li>Next.js / React</li>
                        <li>TypeScript</li>
                    </ul>
                </div>
            </section>

            <section className="currently">
                <h2>Currently</h2>
                <p>{t('about.currently')}</p>
            </section>

            <section className="feneris-mention">
                <p>
                    {t('about.feneris')} <a href="https://feneris.app" target="_blank" rel="noreferrer">Visit feneris.app</a>
                </p>
            </section>

            <section className="resume-download" style={{ marginTop: '3rem' }}>
                <a href="/dummy-resume.pdf" download>
                    <button>{t('about.resume.download')}</button>
                </a>
            </section>
        </main>
    );
}
