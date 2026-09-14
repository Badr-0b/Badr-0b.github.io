'use client';

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from './LanguageContext';
import LanguageSelector from './LanguageSelector';
import ResumeModal from './ResumeModal';
import './Navbar.css';

// layout effect that no-ops during SSR (avoids the useLayoutEffect server warning)
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [light, setLight] = useState(false);
    const [resumeOpen, setResumeOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [railIn, setRailIn] = useState(false);
    const { t } = useLanguage();

    const pathname = usePathname();
    // The projects page turns the top bar into a left rail (desktop).
    const isRail = pathname === '/projects' || pathname === '/projects/';

    const navRef = useRef<HTMLElement>(null);
    // whether this component mounted directly on /projects (cold) vs navigated there (warm)
    const initialRail = useRef<boolean | null>(null);
    if (initialRail.current === null) initialRail.current = isRail;
    const mountedOnProjects = initialRail.current === true;

    // COLD load (direct visit to /projects): CSS entrance — items settle from the top.
    useEffect(() => {
        if (!(isRail && mountedOnProjects)) return;
        const id = requestAnimationFrame(() => setRailIn(true));
        return () => cancelAnimationFrame(id);
    }, [isRail, mountedOnProjects]);

    // WARM navigation (landing → projects): FLIP the nav items from the top bar into the
    // side rail so the change reads as continuous movement, not a teleport. Same easing (§5).
    const prevRects = useRef<Map<HTMLElement, DOMRect> | null>(null);
    const prevRail = useRef(isRail);
    useIsoLayoutEffect(() => {
        const nav = navRef.current;
        if (!nav) return;
        const items = Array.from(
            nav.querySelectorAll<HTMLElement>('.nav__brand, .nav__links li, .nav__tools')
        );
        const measure = () =>
            new Map(items.map((el) => [el, el.getBoundingClientRect()] as const));
        const changed = prevRail.current !== isRail;
        const canFlip = window.matchMedia(
            '(min-width: 761px) and (prefers-reduced-motion: no-preference)'
        ).matches;

        if (changed && canFlip && prevRects.current) {
            const first = prevRects.current;
            const last = measure();
            items.forEach((el) => {
                const f = first.get(el);
                const l = last.get(el);
                if (!f || !l) return;
                const dx = f.left - l.left;
                const dy = f.top - l.top;
                if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
                el.style.transition = 'none';
                el.style.transform = `translate(${dx}px, ${dy}px)`;
            });
            void nav.getBoundingClientRect(); // flush the inverted state
            requestAnimationFrame(() => {
                items.forEach((el, i) => {
                    el.style.transition = `transform 0.75s var(--ease-luxury) ${i * 0.03}s`;
                    el.style.transform = '';
                });
                window.setTimeout(() => {
                    items.forEach((el) => {
                        el.style.transition = '';
                        el.style.transform = '';
                    });
                }, 1100);
            });
            prevRects.current = last;
        } else {
            prevRects.current = measure();
        }
        prevRail.current = isRail;
    });

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

    // reflect the theme the head script already applied (from a saved preference)
    useEffect(() => {
        setLight(document.documentElement.classList.contains('light'));
    }, []);

    const toggleTheme = () => {
        const isLight = document.documentElement.classList.toggle('light');
        setLight(isLight);
        try {
            localStorage.setItem('portfolio-theme', isLight ? 'light' : 'dark');
        } catch {
            /* storage unavailable (private mode, blocked) — theme still applies this session */
        }
    };

    const closeMenu = () => setMenuOpen(false);
    const openResume = () => {
        setMenuOpen(false);
        setResumeOpen(true);
    };

    return (
        <>
            <nav
                ref={navRef}
                className={`nav ${isRail ? 'nav--rail' : scrolled ? 'nav--scrolled' : ''} ${
                    isRail && mountedOnProjects ? 'nav--rail-cold' : ''
                } ${isRail && mountedOnProjects && railIn ? 'nav--rail-in' : ''}`}
            >
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
