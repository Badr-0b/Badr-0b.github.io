import type { Metadata } from 'next';
import HomePage from './home/HomePage';
import './home/home.css';

export const metadata: Metadata = {
    title: 'Badr Obtel — Hardware Engineer',
    description:
        'Embedded hardware, designed to the last trace: a RISC-V core taken to sky130 layout, an STM32N6 vision board and an ESP32-S3 navigation board. Electrical engineering, Kuwait.',
};

export default function Page() {
    return <HomePage year={String(new Date().getFullYear())} />;
}
