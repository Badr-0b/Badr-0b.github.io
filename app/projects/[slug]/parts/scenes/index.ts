import type { ComponentType } from 'react';
import AzimuthScene from './AzimuthScene';
import CleaveScene from './CleaveScene';
import NeronaScene from './NeronaScene';

/**
 * A sheet's own story, told with its real numbers — optional, keyed by slug, with
 * the i18n key of its section name. A project without one simply goes from the
 * drawing to what was delivered.
 */
export const SCENES: Record<string, { Scene: ComponentType<{ idx: string; name: string }>; name: string }> = {
    cleave: { Scene: CleaveScene, name: 'pd.cl.name' },
    nerona: { Scene: NeronaScene, name: 'pd.ne.name' },
    azimuth: { Scene: AzimuthScene, name: 'pd.az.name' },
};
