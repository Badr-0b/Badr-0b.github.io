import React from 'react';
import Link from 'next/link';

// Sample data for the bare-bones build
const projectData: Record<string, any> = {
    'esp32-custom-board': {
        title: 'ESP32 Custom Board',
        tags: ['PCB Design', 'IoT', 'Hardware'],
        problem: 'Needed a custom footprint and specialized I/O for an IoT application without the bulk of a standard dev board.',
        deliverables: ['Schematic', 'Gerbers', 'BOM', 'Basic firmware test suite'],
        decisions: [
            'Used ESP32-WROOM-32E module for integrated WiFi/BT and FCC certification.',
            'Added CP2102N for reliable USB-to-UART bridge.',
            'Included a LiPo charging circuit for battery operation.'
        ],
        github: 'https://github.com/badr'
    },
    'stm32n6-schematic': {
        title: 'STM32N6 Schematic',
        tags: ['Schematic', 'Microcontroller'],
        problem: 'Required a high-performance neural processing microcontroller schematic layout for an edge AI application.',
        deliverables: ['Full Schematic', 'Component Selection'],
        decisions: [
            'Selected STM32N6 for its integrated NPU.',
            'Designed power delivery network to handle transient loads from the NPU.'
        ],
        github: 'https://github.com/badr'
    },
    'analog-asic': {
        title: 'Analog ASIC',
        tags: ['ASIC', 'Analog'],
        problem: 'Needed a custom low-noise amplifier integrated circuit for signal processing.',
        deliverables: ['Circuit Design', 'Simulation Results', 'Layout'],
        decisions: [
            'Utilized 180nm process node for cost efficiency while meeting noise requirements.',
            'Implemented a folded-cascode architecture for high gain.'
        ],
        github: 'https://github.com/badr'
    },
    'logic-gate-asic': {
        title: 'Logic-gate ASIC',
        tags: ['ASIC', 'Digital', 'Logic'],
        problem: 'Designed a fundamental digital logic block for educational and verification purposes.',
        deliverables: ['RTL Code', 'Synthesis Scripts', 'Testbench'],
        decisions: [
            'Wrote RTL in Verilog for standard industry compatibility.',
            'Used open-source synthesis tools to verify logic gates.'
        ],
        github: 'https://github.com/badr'
    },
    'feneris': {
        title: 'Feneris',
        tags: ['Full-stack', 'Next.js', 'React', 'SaaS'],
        problem: 'Wanted to build a complete SaaS product handling authentication, database, and payments to demonstrate full-stack capabilities.',
        deliverables: ['Web Application', 'API Routes', 'Database Schema'],
        decisions: [
            'Chose Next.js for SSR and fast page loads.',
            'Implemented custom authentication flow.',
            'Integrated Stripe for subscription management.'
        ],
        github: 'https://github.com/badr'
    }
};

export async function generateStaticParams() {
    return Object.keys(projectData).map((slug) => ({
        slug: slug,
    }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const project = projectData[resolvedParams.slug];

    if (!project) {
        return <main><h1>Project Not Found</h1><Link href="/projects">Back to Projects</Link></main>;
    }

    return (
        <main>
            <header>
                <h1>{project.title}</h1>
                <div style={{ marginBottom: '2rem' }}>
                    {project.tags.map((tag: string) => (
                        <span key={tag} style={{ marginRight: '0.5rem', background: '#eee', padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>{tag}</span>
                    ))}
                </div>
            </header>

            <section>
                <h2>Problem Statement</h2>
                <p>{project.problem}</p>
            </section>

            <section>
                <h2>What I Delivered</h2>
                <ul>
                    {project.deliverables.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                    ))}
                </ul>
            </section>

            <section>
                <h2>Key Technical Decisions</h2>
                <ul>
                    {project.decisions.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                    ))}
                </ul>
            </section>

            <section>
                <h2>Links</h2>
                <a href={project.github} target="_blank" rel="noreferrer">GitHub Repository</a>
            </section>
            
            <div style={{ marginTop: '2rem' }}>
                <Link href="/projects">← Back to all projects</Link>
            </div>
        </main>
    );
}
