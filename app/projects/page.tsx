'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../components/LanguageContext';

export default function Projects() {
    const { t } = useLanguage();

    const projects = [
        {
            slug: 'esp32-custom-board',
            title: 'ESP32 Custom Board',
            description: 'Custom development board based on ESP32.',
            tags: ['PCB Design', 'IoT', 'Hardware'],
        },
        {
            slug: 'stm32n6-schematic',
            title: 'STM32N6 Schematic',
            description: 'Schematic design for STM32N6-based system.',
            tags: ['Schematic', 'Microcontroller'],
        },
        {
            slug: 'analog-asic',
            title: 'Analog ASIC',
            description: 'Custom analog integrated circuit design.',
            tags: ['ASIC', 'Analog'],
        },
        {
            slug: 'logic-gate-asic',
            title: 'Logic-gate ASIC',
            description: 'Digital logic-gate ASIC design.',
            tags: ['ASIC', 'Digital', 'Logic'],
        },
        {
            slug: 'feneris',
            title: 'Feneris',
            description: 'SaaS platform.',
            tags: ['Full-stack', 'Next.js', 'React'],
        }
    ];

    return (
        <main>
            <header>
                <h1>{t('projects.title')}</h1>
                <p>{t('projects.description')}</p>
            </header>

            <section className="project-grid">
                {projects.map(project => (
                    <div key={project.slug} className="project-card" style={{ border: '1px solid #ccc', margin: '1rem 0', padding: '1rem' }}>
                        <h2>{project.title}</h2>
                        <p>{project.description}</p>
                        <div>
                            {project.tags.map(tag => (
                                <span key={tag} style={{ marginRight: '0.5rem', background: '#eee', padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>{tag}</span>
                            ))}
                        </div>
                        <br/>
                        <Link href={`/projects/${project.slug}`}>{t('projects.view_project')}</Link>
                    </div>
                ))}
            </section>
        </main>
    );
}
