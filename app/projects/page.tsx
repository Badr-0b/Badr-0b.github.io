import type { Metadata } from 'next';
import ProjectsPage from './ProjectsPage';
import './projects.css';

export const metadata: Metadata = {
    title: 'Projects — Badr Obtel',
    description:
        'A RISC-V core taken from RTL to a DRC/LVS-clean sky130 GDSII, an STM32N6 vision board and an ESP32-S3 navigation board — each drawn the way it was built.',
};

export default function Page() {
    const built = new Date();
    const rev = `${String(built.getFullYear()).slice(2)}.${String(built.getMonth() + 1).padStart(2, '0')}`;
    return <ProjectsPage rev={rev} year={String(built.getFullYear())} />;
}
