'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from './components/LanguageContext';
import Entrance from './components/Entrance';
import ScrollProgress from './components/ScrollProgress';
import { useHomeJourney } from './components/useHomeJourney';
import './home.css';

const projects = [
    { slug: 'cleave', title: 'CLEAVE', tag: 'RISC-V / SILICON' },
    { slug: 'nerona', title: 'NERONA', tag: 'PCB / EDGE AI' },
    { slug: 'azimuth', title: 'AZIMUTH', tag: 'PCB / SENSOR FUSION' },
];

export default function Home() {
    const { t } = useLanguage();
    const homeRef = useRef<HTMLElement>(null);
    const tiltRef = useRef<HTMLDivElement>(null);
    const [entered, setEntered] = useState(false);

    const capabilities = [1, 2, 3, 4, 5]
        .map((n) => t(`home.capabilities.${n}`))
        .join('  ·  ');

    const blurbWords = t('home.about.blurb').split(/\s+/);

    // the whole scroll journey — built once the entrance hands off (§5/§7)
    useHomeJourney(homeRef, entered);

    // pointer-reactive hero — the domain is aware of you (§7). Subtle, weighted.
    // Lives on .hero__tilt so GSAP can own the title's transform independently.
    useEffect(() => {
        const el = tiltRef.current;
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
            <Entrance onDone={() => setEntered(true)} />
            <ScrollProgress active={entered} />
            <main className="home" ref={homeRef}>
                {/* ---- HERO: lower-left weight, metadata floats upper-right ---- */}
                <section className="hero">
                    <div className="hero__meta" data-enter aria-hidden="true">
                        <span>Hardware Engineer</span>
                        <span>Embedded / PCB</span>
                    </div>

                    <div className="hero__inner">
                        <div className="hero__tilt" ref={tiltRef}>
                            <p className="eyebrow hero__eyebrow" data-enter>Portfolio — 2026</p>
                            <h1 className="hero__title" data-enter>{t('hero.domain')}</h1>
                            <p className="hero__sub" data-enter>{t('home.hero.positioning')}</p>
                            <div className="hero__cta" data-enter>
                                <Link className="text-link" href="/projects" data-hover>
                                    {t('home.hero.cta.work')} <span aria-hidden="true">↗</span>
                                </Link>
                                <Link className="text-link text-link--dim" href="/contact" data-hover>
                                    {t('home.hero.cta.contact')}
                                </Link>
                            </div>
                        </div>
                    </div>

                    <span className="hero__index" data-enter aria-hidden="true">[ 01 ]</span>
                </section>

                {/* ---- SELECTED WORK — a pinned gallery on the descent ---- */}
                <section className="section work">
                    <div className="section__label-col">
                        <p className="label">
                            {t('home.selected_work.title')}{' '}
                            <span className="section__idx">/ 01</span>
                        </p>
                    </div>
                    <div className="section__content">
                        <div className="work__scroll">
                            <div className="work__stage">
                                {projects.map((p, i) => (
                                    <Link
                                        key={p.slug}
                                        href={`/projects/${p.slug}`}
                                        className="work__panel"
                                        data-hover
                                    >
                                        <span className="work__panel-idx">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <span className="work__panel-title">{p.title}</span>
                                        <span className="work__panel-tag">{p.tag}</span>
                                        <span className="work__panel-cue" aria-hidden="true">
                                            {t('projects.view_project')} ↗
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ---- EXPERIENCE ---- */}
                <section className="section experience">
                    <div className="section__label-col">
                        <p className="label">
                            {t('home.experience.title')} <span className="section__idx">/ 02</span>
                        </p>
                    </div>
                    <div className="section__content">
                        <div className="exp__item">
                            <h3 className="exp__org">Lear Corporation — E-Systems</h3>
                            <p className="exp__meta">Software Engineering Intern, Embedded DevOps · Summer 2026</p>
                            <p className="exp__note">Build &amp; release engineering for automotive electronic-systems validation.</p>
                            <p className="exp__highlight">Cut a hardware-in-the-loop validation pass from ~5.5 h to ~5 min by re-architecting the test runner to execute in parallel.</p>
                        </div>
                    </div>
                </section>

                {/* ---- STATEMENT (+ capabilities as a whisper) ---- */}
                <section className="section statement">
                    <div className="section__label-col">
                        <p className="label">
                            {t('nav.about')} <span className="section__idx">/ 03</span>
                        </p>
                    </div>
                    <div className="section__content">
                        <div className="statement__scroll">
                            <div className="statement__hold">
                                <p className="statement__text">
                                    {blurbWords.map((w, i) => (
                                        <React.Fragment key={i}>
                                            <span data-word>{w}</span>{' '}
                                        </React.Fragment>
                                    ))}
                                </p>
                                <div className="statement__foot">
                                    <Link className="text-link" href="/about" data-hover>
                                        {t('home.about.more')} <span aria-hidden="true">↗</span>
                                    </Link>
                                    <p className="statement__caps">{capabilities}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ---- CTA — arrival ---- */}
                <footer className="section cta">
                    <div className="section__label-col">
                        <p className="label">
                            {t('nav.connect')} <span className="section__idx">/ 04</span>
                        </p>
                    </div>
                    <div className="section__content">
                        <h2 className="cta__title">{t('home.cta.text')}</h2>
                        <a className="text-link cta__link" href="mailto:badr@obtel.org" data-hover>
                            {t('home.cta.button')} <span aria-hidden="true">↗</span>
                        </a>
                    </div>
                </footer>
            </main>
        </>
    );
}
