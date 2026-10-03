// ---------------------------------------------------------------------------
// /about — content. Facts come from the résumé (public/badr-obtel-resume.pdf);
// prose lives in the translation files (about.* keys), proper nouns live here.
// Every tool → work link below must be true: if a tool has no featured project
// behind it, leave `works` empty and the page says so honestly.
// ---------------------------------------------------------------------------

import { projects } from '../projects/projects.data';

export type WorkId = 'cleave' | 'nerona' | 'azimuth' | 'lear' | 'site';

export type Work = {
    id: WorkId;
    /** proper noun, shown as-is */
    name?: string;
    /** i18n key, for names that translate */
    nameKey?: string;
    /** mono category line */
    meta: string;
    href?: string;
};

function fromProject(slug: 'cleave' | 'nerona' | 'azimuth'): Work {
    const p = projects.find((x) => x.slug === slug);
    return {
        id: slug,
        name: p?.title ?? slug.toUpperCase(),
        meta: p?.category ?? '',
        href: `/projects/${slug}/`,
    };
}

export const works: Work[] = [
    fromProject('cleave'),
    fromProject('nerona'),
    fromProject('azimuth'),
    { id: 'lear', name: 'LEAR', meta: 'EMBEDDED DEVOPS', href: '#experience' },
    { id: 'site', nameKey: 'about.kit.site', meta: 'NEXT.JS · STATIC' },
];

export type Tool = { id: string; name: string; nameKey?: string; works: WorkId[] };
export type ToolGroup = { key: 'silicon' | 'boards' | 'sim' | 'lang' | 'platforms'; tools: Tool[] };
export type ToolSide = { key: 'hardware' | 'software'; groups: ToolGroup[] };

const tool = (name: string, works: WorkId[] = [], nameKey?: string): Tool => ({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name,
    nameKey,
    works,
});

export const toolkit: ToolSide[] = [
    {
        key: 'hardware',
        groups: [
            {
                key: 'silicon',
                tools: [
                    tool('Verilog', ['cleave']),
                    tool('Yosys', ['cleave']),
                    tool('OpenROAD / LibreLane', ['cleave']),
                    tool('Magic VLSI', ['cleave']),
                    tool('KLayout', ['cleave']),
                    tool('SKY130 PDK', ['cleave']),
                    tool('Icarus Verilog', ['cleave']),
                ],
            },
            {
                key: 'boards',
                tools: [
                    tool('KiCad', ['nerona', 'azimuth']),
                    tool('STM32', ['nerona']),
                    tool('ESP32', ['azimuth']),
                    tool('MIPI CSI-2', ['nerona']),
                    tool('GNSS / IMU', ['azimuth']),
                    tool('Power regulation', ['nerona'], 'about.tool.power'),
                    tool('Arduino'),
                ],
            },
            {
                key: 'sim',
                tools: [tool('LTspice'), tool('OrCAD'), tool('Fusion 360')],
            },
        ],
    },
    {
        key: 'software',
        groups: [
            {
                key: 'lang',
                tools: [
                    tool('C'),
                    tool('Python'),
                    tool('PowerShell', ['lear']),
                    tool('TypeScript', ['site']),
                ],
            },
            {
                key: 'platforms',
                tools: [
                    tool('Git', ['cleave', 'nerona', 'azimuth', 'lear', 'site']),
                    tool('Azure DevOps', ['lear']),
                    tool('Palantir Foundry', ['lear']),
                    tool('STM32CubeMX', ['nerona']),
                    tool('Computer vision', ['nerona'], 'about.tool.cv'),
                    tool('React / Next.js', ['site']),
                    tool('Linux'),
                    tool('Supabase'),
                ],
            },
        ],
    },
];

export const allTools: Tool[] = toolkit.flatMap((s) => s.groups.flatMap((g) => g.tools));

/** Lear — the hardware-in-the-loop runner, before and after (seconds). */
export const HIL = {
    before: 5.5 * 3600,
    after: 5 * 60,
    /** relative case durations for the diagram — illustrative, not measured */
    cases: [6, 9, 4, 7, 5, 8, 6, 7],
    /** the hang sits after this case in the sequential run */
    hangAfter: 2,
};

export type RecordEntry = {
    when?: string;
    whenKey?: string;
    titleKey: string;
    detailKey: string;
    state?: 'now' | 'future';
};

export const record: RecordEntry[] = [
    { when: '2024', titleKey: 'about.rec.1.t', detailKey: 'about.rec.1.d' },
    { when: '2025–26', titleKey: 'about.rec.2.t', detailKey: 'about.rec.2.d' },
    { when: '2026', titleKey: 'about.rec.3.t', detailKey: 'about.rec.3.d' },
    { whenKey: 'about.rec.now', titleKey: 'about.rec.4.t', detailKey: 'about.rec.4.d', state: 'now' },
    { when: '2028', titleKey: 'about.rec.5.t', detailKey: 'about.rec.5.d', state: 'future' },
];

export const GPA = 3.79;

export const spoken = [
    { code: 'EN', name: 'English', lang: 'en', levelKey: 'about.now.lang.en' },
    { code: 'AR', name: 'العربية', lang: 'ar', levelKey: 'about.now.lang.ar' },
    { code: 'FR', name: 'Français', lang: 'fr', levelKey: 'about.now.lang.fr' },
] as const;

export const PLACE = {
    timeZone: 'Asia/Kuwait',
    /** minutes east of UTC (Kuwait keeps no DST) */
    offset: 180,
    coords: '29.33° N — 48.08° E',
};

export const EMAIL = 'badr@obtel.org';
export const RESUME = { href: '/badr-obtel-resume.pdf', file: 'Badr Obtel - Resume.pdf' };
export const LINKEDIN = { href: 'https://www.linkedin.com/in/badrobtel/', handle: '/in/badrobtel' };
export const GITHUB = { href: 'https://github.com/Badr-0b', handle: '@Badr-0b' };
export const FENERIS = { href: 'https://feneris.app', label: 'feneris.app' };
