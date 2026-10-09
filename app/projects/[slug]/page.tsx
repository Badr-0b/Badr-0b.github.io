import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { projects, getProject } from '../projects.data';
import ProjectDetail from './ProjectDetail';
import '../projects.css';
import './project.css';

export function generateStaticParams() {
    return projects.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const p = getProject(slug);
    if (!p) return {};
    return {
        title: `${p.title} — Badr Obtel`,
        description: p.blurb,
    };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    if (!getProject(slug)) notFound();
    const built = new Date();
    const rev = `${String(built.getFullYear()).slice(2)}.${String(built.getMonth() + 1).padStart(2, '0')}`;
    return <ProjectDetail slug={slug} rev={rev} year={String(built.getFullYear())} />;
}
