'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useLanguage } from '../components/LanguageContext';
import Entrance from '../components/Entrance';
import PageIndex from '../kit/PageIndex';
import { reducedMotion, requestMeasure, useReveal, wake } from '../kit/motion';
import { selected } from './home.data';
import { initialShow } from './show';
import { useShow, type Mode } from './useShow';
import Hero from './parts/Hero';
import Frame from './parts/Frame';
import Bay from './parts/Bay';
import Capabilities from './parts/Capabilities';
import Profile from './parts/Profile';
import Contact from './parts/Contact';

// WebGL — client-only, fetched after first paint so the copy is never held up
const Showcase = dynamic(() => import('./parts/Showcase'), { ssr: false });

/* ===========================================================================
   / — the landing. Built from AESTHETIC_DIRECTION.md + Bare Bones.md.
   The front door is a viewport: the selected work as hidden-line artifacts on
   a measuring rail, framed like a CAD view that knows where the pointer is.
   Scrolling opens the viewport into a pinned inspection stage and the camera
   travels the rail, artifact by artifact. Then the capabilities, the profile
   with its figures, and the way in. One motion engine, one curve.
   =========================================================================== */

const pad = (v: number, n: number) => String(v).padStart(n, '0');

export default function HomePage({ year }: { year: string }) {
    const { t, language } = useLanguage();
    const rootRef = useRef<HTMLElement>(null);
    const show = useRef(initialShow());
    const [mode, setMode] = useState<Mode>('flow');
    const [entered, setEntered] = useState(false);

    useReveal(rootRef, `${language}-${mode}`);
    const goTo = useShow(rootRef, show, selected.length, setMode);

    // a language switch re-flows every line (and may flip the page to RTL); a mode switch re-lays the stage
    useEffect(() => {
        requestMeasure();
    }, [language, mode]);

    const onEntered = useCallback(() => {
        show.current.entered = true;
        show.current.enteredAt = performance.now();
        setEntered(true);
        wake();
    }, []);

    // compose the hero in once the entrance hands off (the [data-in] stagger lives in CSS)
    useEffect(() => {
        if (!entered) return;
        const id = requestAnimationFrame(() => rootRef.current?.classList.add('is-ready'));
        return () => cancelAnimationFrame(id);
    }, [entered]);

    const onCamera = useCallback((az: number, el: number) => {
        const node = rootRef.current?.querySelector('[data-sh-cam]');
        if (node) node.textContent = `AZ ${pad(az, 3)}° · EL ${pad(el, 2)}°`;
    }, []);

    const onFail = useCallback(() => {
        show.current.noGL = true;
        // no camera, no heading to read out
        rootRef.current?.querySelector('[data-sh="readout"]')?.setAttribute('hidden', '');
        requestMeasure();
    }, []);

    const onHot = useCallback((k: number) => {
        show.current.hot = k;
        wake();
    }, []);

    const index = [
        { id: 'work', idx: '01', name: t('home.selected_work.title') },
        { id: 'capabilities', idx: '02', name: t('home.capabilities.title') },
        { id: 'profile', idx: '03', name: t('about.sec.profile') },
        { id: 'contact', idx: '04', name: t('projects.sec.contact') },
    ];

    return (
        <>
            <Entrance onDone={onEntered} />
            <main className="hm k-scope" ref={rootRef} data-mode={mode}>
                <div className="hm-show">
                    <div className="hm-show__pin">
                        <Showcase items={selected} show={show} onCamera={onCamera} onPick={goTo} onFail={onFail} />
                        <Frame />
                    </div>
                    <Hero />
                    <Bay items={selected} mode={mode} goTo={goTo} onHot={onHot} />
                </div>

                <Capabilities />
                <Profile />
                <Contact />

                <footer className="hm-colophon">
                    <span>© {year} Badr Obtel</span>
                    <span className="hm-colophon__set">{t('about.colophon.set')}</span>
                    <button
                        type="button"
                        className="hm-colophon__top"
                        data-hover
                        onClick={() => window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' })}
                    >
                        {t('about.colophon.top')} <span aria-hidden="true">↑</span>
                    </button>
                </footer>

                <PageIndex items={index} label={t('projects.index.label')} after=".hm-hero" />
            </main>
        </>
    );
}
