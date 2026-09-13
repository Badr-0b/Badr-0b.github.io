'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../components/LanguageContext';

export default function Projects() {
    const { t } = useLanguage();

    const projects = [
        {
            slug: 'cleave',
            title: 'CLEAVE',
            description: 'From-scratch RV32I RISC-V core hardened to a sky130 GDSII through a full open-source RTL-to-GDSII flow.',
            tags: ['RISC-V', 'Verilog', 'sky130'],
        },
        {
            slug: 'nerona',
            title: 'NERONA',
            description: 'Custom PCB targeting the STM32N6 NPU for on-device computer-vision inference with no cloud dependency.',
            tags: ['KiCad', 'STM32N6', 'MIPI CSI-2'],
        },
        {
            slug: 'azimuth',
            title: 'AZIMUTH',
            description: 'Multi-sensor ESP32-S3 navigation board with defined sensor roles and GNSS-dropout redundancy planning.',
            tags: ['KiCad', 'ESP32-S3', 'Sensor Fusion'],
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
