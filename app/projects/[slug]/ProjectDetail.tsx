'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../../components/LanguageContext';
import Reveal from '../../components/Reveal';
import type { Project } from '../projects.data';

export default function ProjectDetail({ project }: { project: Project }) {
    const { t } = useLanguage();

    return (
        <main className="pd">
            <Link href="/projects" className="text-link text-link--dim pd__back" data-hover>
                <span aria-hidden="true">←</span> {t('projects.detail.back')}
            </Link>

            <header className="pd__head">
                <p className="pd__cat">{project.category}</p>
                <h1 className="pd__title">{project.title}</h1>
                <ul className="pd__tags">
                    {project.tags.map((tag) => (
                        <li key={tag} className="pd__tag">
                            {tag}
                        </li>
                    ))}
                </ul>
            </header>

            <Reveal className="pd__section">
                <p className="label pd__label">{t('projects.detail.problem')}</p>
                <div className="pd__content">
                    <p className="pd__lead">{project.problem}</p>
                </div>
            </Reveal>

            <Reveal className="pd__section">
                <p className="label pd__label">{t('projects.detail.delivered')}</p>
                <ul className="pd__content pd__list">
                    {project.deliverables.map((item, i) => (
                        <li key={i} className="pd__list-item">
                            <span className="pd__list-idx">{String(i + 1).padStart(2, '0')}</span>
                            <span className="pd__list-text">{item}</span>
                        </li>
                    ))}
                </ul>
            </Reveal>

            <Reveal className="pd__section">
                <p className="label pd__label">{t('projects.detail.decisions')}</p>
                <ul className="pd__content pd__list pd__list--prose">
                    {project.decisions.map((item, i) => (
                        <li key={i} className="pd__list-item">
                            <span className="pd__list-idx">{String(i + 1).padStart(2, '0')}</span>
                            <span className="pd__list-text">{item}</span>
                        </li>
                    ))}
                </ul>
            </Reveal>

            <Reveal className="pd__section pd__section--links">
                <p className="label pd__label">{t('projects.detail.links')}</p>
                <div className="pd__content">
                    <a
                        className="text-link"
                        href={project.github}
                        target="_blank"
                        rel="noreferrer"
                        data-hover
                    >
                        {t('projects.detail.github')} <span aria-hidden="true">↗</span>
                    </a>
                </div>
            </Reveal>
        </main>
    );
}
