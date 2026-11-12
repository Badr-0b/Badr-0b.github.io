import type { Metadata } from 'next';
import ContactPage from './ContactPage';
import './contact.css';

export const metadata: Metadata = {
    title: 'Contact — Badr Obtel',
    description:
        'Start a brief: a board, a chip, firmware, software or a role. A few taps draw it as the next sheet in the set, then it opens as a draft in your own email.',
};

export default function Page() {
    return <ContactPage />;
}
