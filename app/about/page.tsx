import type { Metadata } from 'next';
import { statSync } from 'node:fs';
import path from 'node:path';
import AboutPage from './AboutPage';
import './about.css';

export const metadata: Metadata = {
    title: 'About — Badr Obtel',
    description:
        'Electrical engineering, third year at AUM, Kuwait. A RISC-V core taken from RTL to GDSII, boards laid out in KiCad, and the test tooling that validates them.',
};

/** Read at build time (static export), so the label never drifts from the real file. */
function resumeSize(): string | null {
    try {
        const bytes = statSync(path.join(process.cwd(), 'public', 'badr-obtel-resume.pdf')).size;
        return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    } catch {
        return null;
    }
}

export default function Page() {
    const built = new Date();
    const rev = `${String(built.getFullYear()).slice(2)}.${String(built.getMonth() + 1).padStart(2, '0')}`;
    return <AboutPage resumeSize={resumeSize()} rev={rev} year={String(built.getFullYear())} />;
}
