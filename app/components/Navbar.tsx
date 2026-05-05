'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from './LanguageContext';
import LanguageSelector from './LanguageSelector';
import './Navbar.css';

export default function Navbar() {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const { t } = useLanguage();

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <nav className={`navbar ${isVisible ? 'navbar-visible' : 'navbar-hidden'}`}>
            <div className="navbar-container">
                <div className="navbar-logo">
                    <Link href="/">
                        Badr Obtel <span className="dev-badge">{t('nav.badge')}</span>
                    </Link>
                </div>
                <ul className="navbar-links">
                    <li><Link href="/">{t('nav.home')}</Link></li>
                    <li><Link href="/projects">{t('nav.projects')}</Link></li>
                    <li><Link href="/about">{t('nav.about')}</Link></li>
                    <li><Link href="/contact">{t('nav.contact')}</Link></li>
                    <li><Link href="/resume">{t('nav.resume')}</Link></li>
                </ul>
                <button onClick={() => document.documentElement.classList.toggle('dark-theme')}>Toggle Theme</button>
                <LanguageSelector />
            </div>
        </nav>
    );
}
