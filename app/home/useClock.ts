'use client';

import { useEffect, useState } from 'react';
import { PLACE } from '../about/about.data';

/**
 * Local time in Salmiya, and how far it is from the visitor's own clock — live
 * data, updated on the minute. Null until mounted (the static export has no clock).
 */
export function useClock() {
    const [now, setNow] = useState<Date | null>(null);

    useEffect(() => {
        setNow(new Date());
        let id = 0;
        const schedule = () => {
            id = window.setTimeout(() => {
                setNow(new Date());
                schedule();
            }, 60_000 - (Date.now() % 60_000) + 40);
        };
        schedule();
        return () => window.clearTimeout(id);
    }, []);

    const time = now
        ? new Intl.DateTimeFormat('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
              hourCycle: 'h23',
              timeZone: PLACE.timeZone,
          }).format(now)
        : '--:--';

    // minutes Kuwait is ahead of the visitor (getTimezoneOffset is minutes *behind* UTC)
    const diff = now ? PLACE.offset + now.getTimezoneOffset() : null;
    const h = diff === null ? 0 : Math.floor(Math.abs(diff) / 60);
    const m = diff === null ? 0 : Math.abs(diff) % 60;
    const delta = diff === null ? '' : `${diff >= 0 ? '+' : '−'}${h}h${m ? ` ${String(m).padStart(2, '0')}m` : ''}`;

    return { time, diff, delta };
}
