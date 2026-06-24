/**
 * Best-effort automatic location, used once on a fresh install to pre-fill the user's city/country
 * for weather + styling. Uses a free, key-less IP geolocation lookup; if it fails we simply keep the
 * default (Auckland, New Zealand). No GPS permission prompt.
 */
import { useEffect } from 'react';

import { useCloset } from '@/store/closet';

interface Detected {
  city?: string;
  country?: string;
}

export async function detectLocation(): Promise<Detected | null> {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (!res.ok) return null;
    const data = (await res.json()) as { city?: string; country_name?: string };
    const city = typeof data.city === 'string' ? data.city.trim() : '';
    const country = typeof data.country_name === 'string' ? data.country_name.trim() : '';
    if (!city && !country) return null;
    return { city: city || undefined, country: country || undefined };
  } catch {
    return null;
  }
}

/** Runs the IP lookup once (guarded by settings.geoChecked) and updates the city/country if found. */
export function useAutoLocate() {
  const hydrated = useCloset((s) => s.hydrated);
  const geoChecked = useCloset((s) => s.settings.geoChecked);
  const setSettings = useCloset((s) => s.setSettings);

  useEffect(() => {
    if (!hydrated || geoChecked) return;
    let cancelled = false;
    (async () => {
      const found = await detectLocation();
      if (cancelled) return;
      setSettings({
        geoChecked: true,
        ...(found?.city ? { homeCity: found.city } : null),
        ...(found?.country ? { country: found.country } : null),
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated, geoChecked, setSettings]);
}
