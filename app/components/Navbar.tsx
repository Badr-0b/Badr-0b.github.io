'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from './LanguageContext';
import LanguageSelector from './LanguageSelector';
import ResumeModal from './ResumeModal';
import './Navbar.css';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [light, setLight] = useState(false);
    const [resumeOpen, setResumeOpen] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const toggleTheme = () => {
        const isLight = document.documentElement.classList.toggle('light');
        setLight(isLight);
    };

    return (
        <>
            <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
                <div className="nav__inner">
                    <Link href="/" className="nav__brand" data-hover>
                        Badr Obtel
                    </Link>

                    <ul className="nav__links">
                        <li>
                            <Link href="/projects" data-hover>{t('nav.projects')}</Link>
                        </li>
                        <li>
                            <Link href="/about" data-hover>{t('nav.about')}</Link>
                        </li>
                        <li>
                            <a
                                href="https://www.linkedin.com/in/badrobtel/"
                                target="_blank"
                                rel="noreferrer"
                                data-hover
                            >
                                {t('nav.connect')}
                            </a>
                        </li>
                        <li>
                            <button
                                type="button"
                                className="nav__link-btn"
                                onClick={() => setResumeOpen(true)}
                                data-hover
                            >
                                {t('nav.resume')}
                            </button>
                        </li>
                    </ul>

                    <div className="nav__tools">
                        <button
                            type="button"
                            className="nav__theme"
                            onClick={toggleTheme}
                            data-hover
                            aria-label="Toggle light / dark theme"
                        >
                            {light ? 'Dark' : 'Light'}
                        </button>
                        <LanguageSelector />
                    </div>
                </div>
            </nav>

            <ResumeModal open={resumeOpen} onClose={() => setResumeOpen(false)} />
        </>
    );
}
