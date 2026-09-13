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
    const [menuOpen, setMenuOpen] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // mobile menu: lock scroll, close on Escape, close if resized up to desktop
    useEffect(() => {
        if (!menuOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMenuOpen(false);
        };
        const onResize = () => {
            if (window.innerWidth > 760) setMenuOpen(false);
        };
        document.addEventListener('keydown', onKey);
        window.addEventListener('resize', onResize);
        document.body.classList.add('modal-lock');
        return () => {
            document.removeEventListener('keydown', onKey);
            window.removeEventListener('resize', onResize);
            document.body.classList.remove('modal-lock');
        };
    }, [menuOpen]);

    const toggleTheme = () => {
        const isLight = document.documentElement.classList.toggle('light');
        setLight(isLight);
    };

    const closeMenu = () => setMenuOpen(false);
    const openResume = () => {
        setMenuOpen(false);
        setResumeOpen(true);
    };

    return (
        <>
            <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
                <div className="nav__inner">
                    <Link href="/" className="nav__brand" data-hover onClick={closeMenu}>
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

                    <button
                        type="button"
                        className={`nav__toggle ${menuOpen ? 'nav__toggle--open' : ''}`}
                        onClick={() => setMenuOpen((v) => !v)}
                        data-hover
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={menuOpen}
                        aria-controls="mobile-menu"
                    >
                        <span className="nav__toggle-box" aria-hidden="true">
                            <span className="nav__toggle-bar" />
                            <span className="nav__toggle-bar" />
                        </span>
                    </button>
                </div>
            </nav>

            {/* ---- MOBILE MENU ---- */}
            <div
                id="mobile-menu"
                className={`nav__overlay ${menuOpen ? 'nav__overlay--open' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-label="Menu"
            >
                <nav className="nav__menu">
                    <Link className="nav__menu-item" href="/projects" data-hover onClick={closeMenu}>
                        <span className="nav__menu-idx">01</span>
                        <span className="nav__menu-label">{t('nav.projects')}</span>
                    </Link>
                    <Link className="nav__menu-item" href="/about" data-hover onClick={closeMenu}>
                        <span className="nav__menu-idx">02</span>
                        <span className="nav__menu-label">{t('nav.about')}</span>
                    </Link>
                    <a
                        className="nav__menu-item"
                        href="https://www.linkedin.com/in/badrobtel/"
                        target="_blank"
                        rel="noreferrer"
                        data-hover
                        onClick={closeMenu}
                    >
                        <span className="nav__menu-idx">03</span>
                        <span className="nav__menu-label">{t('nav.connect')}</span>
                    </a>
                    <button type="button" className="nav__menu-item" onClick={openResume} data-hover>
                        <span className="nav__menu-idx">04</span>
                        <span className="nav__menu-label">{t('nav.resume')}</span>
                    </button>
                </nav>

                <div className="nav__menu-tools">
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

            <ResumeModal open={resumeOpen} onClose={() => setResumeOpen(false)} />
        </>
    );
}
