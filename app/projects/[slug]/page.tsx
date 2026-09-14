import React from 'react';
import Link from 'next/link';
import { projects, getProject } from '../projects.data';
import ProjectDetail from './ProjectDetail';
import './project.css';

export function generateStaticParams() {
    return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const project = getProject(slug);

    if (!project) {
        return (
            <main className="pd pd--empty">
                <h1 className="pd__title">Not found</h1>
                <Link href="/projects" className="text-link" data-hover>
                    <span aria-hidden="true">←</span> Back to projects
                </Link>
            </main>
        );
    }

    return <ProjectDetail project={project} />;
}
