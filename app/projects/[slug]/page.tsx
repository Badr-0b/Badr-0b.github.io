import React from 'react';
import Link from 'next/link';

// Project data — drawn from the résumé
const projectData: Record<string, any> = {
    'cleave': {
        title: 'CLEAVE',
        tags: ['RISC-V', 'Verilog', 'Yosys', 'OpenROAD/LibreLane', 'Magic', 'sky130'],
        problem: 'A from-scratch RISC-V core hardened through a full open-source RTL-to-GDSII flow.',
        deliverables: [
            'RV32I single-cycle core (Verilog)',
            'DRC/LVS-clean sky130 GDSII',
            'TinyTapeout 1x1 tile',
            '10 self-checking Icarus Verilog benches'
        ],
        decisions: [
            'Implemented the full RV32I base integer ISA across a modular datapath: PC, 32x32 register file, ALU, immediate generator, branch comparator, control unit, and byte-addressable data memory.',
            'Hardened the RTL to a DRC/LVS-clean sky130 GDSII through a full open-source flow — Yosys synthesis, OpenROAD/LibreLane place-and-route and CTS, Magic/KLayout/netgen sign-off — at a 25 MHz target, packaged as a TinyTapeout 1x1 tile.',
            'Verified every module and the integrated core with 10 self-checking Icarus Verilog benches (9 unit + a full-ISA integration proof), validating ALU ops, store/load round-trips, all branch conditions, and JAL/JALR against hand-computed values through a debug port.'
        ],
        github: 'https://github.com/Badr-0b'
    },
    'nerona': {
        title: 'NERONA',
        tags: ['KiCad', 'STM32N6', 'MIPI CSI-2', 'STM32CubeMX'],
        problem: 'A custom PCB targeting the STM32N6 NPU for on-device computer-vision inference with no cloud dependency.',
        deliverables: ['Schematic', 'PCB layout', 'NPU model-deployment path'],
        decisions: [
            'Designed PCB power delivery, a MIPI CSI-2 camera interface, and the memory subsystem around the STM32N6 NPU for accelerated on-device CV inference.',
            'Completed schematic and layout in KiCad under signal-integrity and EMC rules.',
            'Built the deployment path for quantized object-detection models onto the NPU via STM32CubeMX.'
        ],
        github: 'https://github.com/Badr-0b'
    },
    'azimuth': {
        title: 'AZIMUTH',
        tags: ['KiCad', 'ESP32-S3', 'GNSS', 'IMU', 'Sensor Fusion'],
        problem: 'A custom multi-sensor navigation board with defined sensor roles and redundancy planning.',
        deliverables: ['Navigation board schematic + layout', 'Sensor-role fusion plan', 'GNSS-dropout fallback plan'],
        decisions: [
            'Assigned each sensor a defined role: GNSS for position, magnetometer for heading, IMU accelerometer for tilt correction, and gyroscope for smoothing.',
            'Planned IMU dead-reckoning as a fallback for continuous heading and motion estimation during GNSS dropout, so navigation degrades gracefully rather than failing on single-sensor loss.'
        ],
        github: 'https://github.com/Badr-0b'
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
