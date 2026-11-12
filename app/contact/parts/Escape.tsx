'use client';

import React from 'react';
import { useLanguage } from '../../components/LanguageContext';
import CopyButton from '../../kit/CopyButton';
import { EMAIL, GITHUB, LINKEDIN } from '../../about/about.data';

/** Always in reach, on every step: the plain address, for people who'd rather just write. */
export default function Escape() {
    const { t } = useLanguage();
    return (
        <div className="ct-escape">
            <span className="ct-escape__k">{t('contact.escape')}</span>
            <a className="ct-escape__mail" href={`mailto:${EMAIL}`} dir="ltr" data-hover data-cursor="mailto">
                {EMAIL}
            </a>
            <CopyButton text={EMAIL} label={t('projects.contact.copy')} done={t('projects.contact.copied')} />
            <span className="ct-escape__links">
                <a href={LINKEDIN.href} target="_blank" rel="noreferrer" data-hover data-cursor={t('projects.contact.open')}>
                    LinkedIn <span aria-hidden="true">↗</span>
                </a>
                <a href={GITHUB.href} target="_blank" rel="noreferrer" data-hover data-cursor={t('projects.contact.open')}>
                    GitHub <span aria-hidden="true">↗</span>
                </a>
            </span>
        </div>
    );
}
