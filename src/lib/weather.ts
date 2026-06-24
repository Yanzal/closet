/** Free weather via Open-Meteo (no API key). Geocode a city, then fetch a daily forecast. */

export interface GeoCity {
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
}

export interface DayWeather {
  date: string; // YYYY-MM-DD
  tMax: number;
  tMin: number;
  code: number; // WMO weather code
}

export async function geocodeCity(name: string): Promise<GeoCity | null> {
  if (!name.trim()) return null;
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    name,
  )}&count=1&language=en&format=json`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const x = json.results?.[0];
    if (!x) return null;
    return { name: x.name, country: x.country, latitude: x.latitude, longitude: x.longitude };
  } catch {
    return null;
  }
}

export async function getDailyForecast(
  lat: number,
  lon: number,
  startDate: string,
  endDate: string,
): Promise<DayWeather[]> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto` +
    `&start_date=${startDate}&end_date=${endDate}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();
    const d = json.daily;
    if (!d?.time) return [];
    return d.time.map((date: string, i: number) => ({
      date,
      tMax: Math.round(d.temperature_2m_max?.[i] ?? 0),
      tMin: Math.round(d.temperature_2m_min?.[i] ?? 0),
      code: d.weather_code?.[i] ?? 0,
    }));
  } catch {
    return [];
  }
}

/** Map a WMO weather code to an emoji + short label. */
export function weatherInfo(code: number): { emoji: string; label: string } {
  if (code === 0) return { emoji: '☀️', label: 'Clear' };
  if (code <= 2) return { emoji: '🌤️', label: 'Partly cloudy' };
  if (code === 3) return { emoji: '☁️', label: 'Cloudy' };
  if (code <= 48) return { emoji: '🌫️', label: 'Fog' };
  if (code <= 57) return { emoji: '🌦️', label: 'Drizzle' };
  if (code <= 67) return { emoji: '🌧️', label: 'Rain' };
  if (code <= 77) return { emoji: '🌨️', label: 'Snow' };
  if (code <= 82) return { emoji: '🌧️', label: 'Showers' };
  if (code <= 86) return { emoji: '🌨️', label: 'Snow showers' };
  return { emoji: '⛈️', label: 'Thunderstorm' };
}
