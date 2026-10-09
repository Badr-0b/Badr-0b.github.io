'use client';

import React, { useRef, useState } from 'react';
import { useLanguage } from '../../../../components/LanguageContext';
import { ease, span } from '../../../../kit/motion';
import Scrub from './Scrub';

/* CLEAVE — verification, told with its count: nine unit benches run and pass in
   turn, then the integration bench proves the whole ISA, its checks ticking off.
   Ten self-checking Icarus Verilog benches, as the project reports them. */

const UNITS = 9;
const CHECKS = ['pd.cl.check.alu', 'pd.cl.check.mem', 'pd.cl.check.branch', 'pd.cl.check.jump'];

export default function CleaveScene({ idx, name }: { idx: string; name: string }) {
    const { t } = useLanguage();
    const fillRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const cellRefs = useRef<(HTMLLIElement | null)[]>([]);
    const checkRefs = useRef<(HTMLLIElement | null)[]>([]);
    const intFillRef = useRef<HTMLSpanElement>(null);
    const intRef = useRef<HTMLDivElement>(null);
    const capRefs = useRef<(HTMLParagraphElement | null)[]>([]);
    const passedRef = useRef(-1);
    const [passed, setPassed] = useState(10);

    const apply = (q: number) => {
        let n = 0;
        for (let i = 0; i < UNITS; i++) {
            const a = 0.04 + i * 0.055;
            const v = ease(span(q, a, a + 0.12));
            const fill = fillRefs.current[i];
            if (fill) fill.style.transform = `scaleX(${v.toFixed(3)})`;
            const done = v >= 0.999;
            cellRefs.current[i]?.toggleAttribute('data-pass', done);
            if (done) n++;
        }
        const iv = ease(span(q, 0.62, 0.92));
        if (intFillRef.current) intFillRef.current.style.transform = `scaleX(${iv.toFixed(3)})`;
        // the suite's coverage, ticking off across the whole run
        CHECKS.forEach((_, k) => checkRefs.current[k]?.toggleAttribute('data-pass', q >= 0.26 + k * 0.2));
        const intDone = iv >= 0.999;
        intRef.current?.toggleAttribute('data-pass', intDone);
        if (intDone) n++;
        if (n !== passedRef.current) {
            passedRef.current = n;
            setPassed(n);
        }
        const c1 = 1 - span(q, 0.56, 0.62);
        const c2 = span(q, 0.6, 0.68);
        [c1, c2].forEach((v, k) => {
            const el = capRefs.current[k];
            if (!el) return;
            el.style.opacity = v.toFixed(3);
            el.style.transform = `translate3d(0, ${((1 - v) * 10).toFixed(1)}px, 0)`;
        });
    };

    return (
        <Scrub idx={idx} name={name} apply={apply} className="pd-story--cleave">
            <div className="pd-cl">
                <div className="pd-cl__copy">
                    <p className="pd-story__eyebrow">{t('pd.cl.eyebrow')}</p>
                    <p className="pd-story__title">{t('pd.cl.title')}</p>
                    <div className="pd-story__caps">
                        {['pd.cl.cap.1', 'pd.cl.cap.2'].map((k, n) => (
                            <p
                                key={k}
                                className="pd-story__cap"
                                ref={(el) => {
                                    capRefs.current[n] = el;
                                }}
                            >
                                {t(k)}
                            </p>
                        ))}
                    </div>
                    <p className="pd-cl__count" aria-live="off">
                        <span className="pd-cl__count-v" dir="ltr">
                            {String(passed).padStart(2, '0')}
                            <span className="pd-cl__count-of"> / 10</span>
                        </span>
                        <span className="pd-cl__count-k">{t('pd.cl.passing')}</span>
                    </p>
                </div>

                <div className="pd-cl__matrix" role="img" aria-label={t('pd.cl.aria')}>
                    <ol className="pd-cl__units">
                        {Array.from({ length: UNITS }, (_, i) => (
                            <li
                                key={i}
                                className="pd-cl__unit"
                                data-pass=""
                                ref={(el) => {
                                    cellRefs.current[i] = el;
                                }}
                            >
                                <span className="pd-cl__unit-k">
                                    {t('pd.cl.unit')} {String(i + 1).padStart(2, '0')}
                                </span>
                                <span className="pd-cl__run" aria-hidden="true">
                                    <span
                                        className="pd-cl__run-fill"
                                        ref={(el) => {
                                            fillRefs.current[i] = el;
                                        }}
                                    />
                                </span>
                                <span className="pd-cl__pass">{t('pd.cl.pass')}</span>
                            </li>
                        ))}
                    </ol>
                    <div className="pd-cl__int" ref={intRef} data-pass="">
                        <div className="pd-cl__int-head">
                            <span className="pd-cl__unit-k">{t('pd.cl.integration')}</span>
                            <span className="pd-cl__pass">{t('pd.cl.pass')}</span>
                        </div>
                        <span className="pd-cl__run" aria-hidden="true">
                            <span className="pd-cl__run-fill" ref={intFillRef} />
                        </span>
                    </div>
                    <div className="pd-cl__cover">
                        <p className="pd-cl__cover-k">{t('pd.cl.validated')}</p>
                        <ul className="pd-cl__checks">
                            {CHECKS.map((k, i) => (
                                <li
                                    key={k}
                                    className="pd-cl__check"
                                    data-pass=""
                                    ref={(el) => {
                                        checkRefs.current[i] = el;
                                    }}
                                >
                                    <span className="pd-cl__check-mark" aria-hidden="true" />
                                    {t(k)}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </Scrub>
    );
}
