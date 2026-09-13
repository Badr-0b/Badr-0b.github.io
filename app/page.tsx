'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from './components/LanguageContext';
import Reveal from './components/Reveal';
import Entrance from './components/Entrance';
import './home.css';

const projects = [
    { slug: 'cleave', title: 'CLEAVE', tag: 'RISC-V / SILICON' },
    { slug: 'nerona', title: 'NERONA', tag: 'PCB / EDGE AI' },
    { slug: 'azimuth', title: 'AZIMUTH', tag: 'PCB / SENSOR FUSION' },
];

export default function Home() {
    const { t } = useLanguage();
    const heroRef = useRef<HTMLDivElement>(null);

    const capabilities = [1, 2, 3, 4, 5]
        .map((n) => t(`home.capabilities.${n}`))
        .join('  ·  ');

    // pointer-reactive hero — the domain is aware of you (§7). Subtle, weighted.
    useEffect(() => {
        const el = heroRef.current;
        if (!el) return;
        const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
        const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (!mq.matches || rm.matches) return;

        let raf = 0;
        let x = 0;
        let y = 0;
        let tx = 0;
        let ty = 0;

        const onMove = (e: MouseEvent) => {
            tx = (e.clientX / window.innerWidth - 0.5) * 14;
            ty = (e.clientY / window.innerHeight - 0.5) * 9;
        };
        const loop = () => {
            x += (tx - x) * 0.06;
            y += (ty - y) * 0.06;
            el.style.setProperty('--px', `${x.toFixed(2)}px`);
            el.style.setProperty('--py', `${y.toFixed(2)}px`);
            raf = requestAnimationFrame(loop);
        };
        window.addEventListener('mousemove', onMove);
        loop();
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('mousemove', onMove);
        };
    }, []);

    return (
        <>
            <Entrance />
            <main className="home">
                {/* ---- HERO: lower-left weight, metadata floats upper-right ---- */}
                <section className="hero">
                    <div className="hero__meta" aria-hidden="true">
                        <span>Hardware Engineer</span>
                        <span>Embedded / PCB</span>
                    </div>

                    <div className="hero__inner" ref={heroRef}>
                        <p className="eyebrow hero__eyebrow">Portfolio — 2026</p>
                        <h1 className="hero__title">{t('hero.domain')}</h1>
                        <p className="hero__sub">{t('home.hero.positioning')}</p>
                        <div className="hero__cta">
                            <Link className="text-link" href="/projects" data-hover>
                                {t('home.hero.cta.work')} <span aria-hidden="true">↗</span>
                            </Link>
                            <Link className="text-link text-link--dim" href="/contact" data-hover>
                                {t('home.hero.cta.contact')}
                            </Link>
                        </div>
                    </div>

                    <span className="hero__index" aria-hidden="true">[ 01 ]</span>
                </section>

                {/* ---- SELECTED WORK ---- */}
                <section className="section work">
                    <div className="section__label-col">
                        <Reveal>
                            <p className="label">
                                {t('home.selected_work.title')}{' '}
                                <span className="section__idx">/ 01</span>
                            </p>
                        </Reveal>
                    </div>
                    <div className="section__content">
                        <ul className="work__list">
                            {projects.map((p, i) => (
                                <Reveal key={p.slug} delay={i * 90}>
                                    <Link href={`/projects/${p.slug}`} className="work__item" data-hover>
                                        <span className="work__title">{p.title}</span>
                                        <span className="work__meta">{p.tag}</span>
                                        <span className="work__arrow" aria-hidden="true">↗</span>
                                    </Link>
                                </Reveal>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* ---- EXPERIENCE ---- */}
                <section className="section experience">
                    <div className="section__label-col">
                        <Reveal>
                            <p className="label">
                                {t('home.experience.title')} <span className="section__idx">/ 02</span>
                            </p>
                        </Reveal>
                    </div>
                    <div className="section__content">
                        <Reveal>
                            <div className="exp__item">
                                <h3 className="exp__org">Lear Corporation — E-Systems</h3>
                                <p className="exp__meta">Software Engineering Intern, Embedded DevOps · Summer 2026</p>
                                <p className="exp__note">Build &amp; release engineering for automotive electronic-systems validation.</p>
                                <p className="exp__highlight">Cut a hardware-in-the-loop validation pass from ~5.5 h to ~5 min by re-architecting the test runner to execute in parallel.</p>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ---- STATEMENT (+ capabilities as a whisper) ---- */}
                <section className="section statement">
                    <div className="section__label-col">
                        <Reveal>
                            <p className="label">
                                {t('nav.about')} <span className="section__idx">/ 03</span>
                            </p>
                        </Reveal>
                    </div>
                    <div className="section__content">
                        <Reveal>
                            <p className="statement__text">{t('home.about.blurb')}</p>
                        </Reveal>
                        <Reveal delay={120}>
                            <div className="statement__foot">
                                <Link className="text-link" href="/about" data-hover>
                                    {t('home.about.more')} <span aria-hidden="true">↗</span>
                                </Link>
                                <p className="statement__caps">{capabilities}</p>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ---- CTA ---- */}
                <footer className="section cta">
                    <div className="section__label-col">
                        <Reveal>
                            <p className="label">
                                {t('nav.connect')} <span className="section__idx">/ 04</span>
                            </p>
                        </Reveal>
                    </div>
                    <div className="section__content">
                        <Reveal>
                            <h2 className="cta__title">{t('home.cta.text')}</h2>
                        </Reveal>
                        <Reveal delay={120}>
                            <a className="text-link cta__link" href="mailto:badr@obtel.org" data-hover>
                                {t('home.cta.button')} <span aria-hidden="true">↗</span>
                            </a>
                        </Reveal>
                    </div>
                </footer>
            </main>
        </>
    );
}
