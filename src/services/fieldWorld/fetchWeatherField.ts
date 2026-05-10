/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FieldFeedStatus } from '../../types/fieldWorld';

export interface WeatherFieldData {
  status: FieldFeedStatus;
  temperature?: number;
  condition?: string;
  windSpeed?: number;
  isRainy?: boolean;
  isClear?: boolean;
  humidity?: number;
  cloudCover?: number;
  precipitation?: number;
  isDay?: boolean;
  sunrise?: string;
  sunset?: string;
  uvIndexMax?: number;
  timezone?: string;
  celestialPhase?: string;
}

function describeOpenMeteoCondition(cloudCover?: number, precipitation?: number): string {
  if ((precipitation || 0) > 0) return 'Precipitation nearby';
  if ((cloudCover || 0) >= 75) return 'Cloud-held sky';
  if ((cloudCover || 0) >= 35) return 'Partly veiled sky';
  return 'Clear sky';
}

function computeCelestialPhase(isDay?: boolean, sunrise?: string, sunset?: string): string | undefined {
  if (!sunrise || !sunset) return isDay === undefined ? undefined : isDay ? 'Daylight' : 'Night Watch';
  const now = Date.now();
  const rise = new Date(sunrise).getTime();
  const set = new Date(sunset).getTime();
  const hour = 60 * 60 * 1000;
  if (now >= rise - hour && now <= rise + hour) return 'Dawn Gate';
  if (now >= set - hour && now <= set + hour) return 'Dusk Gate';
  if (now > rise && now < set) return 'Daylight Arc';
  return 'Night Watch';
}

async function fetchOpenMeteoWeather(lat: number, lon: number): Promise<Partial<WeatherFieldData>> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', lat.toFixed(4));
  url.searchParams.set('longitude', lon.toFixed(4));
  url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,is_day,precipitation,cloud_cover,wind_speed_10m');
  url.searchParams.set('daily', 'sunrise,sunset,uv_index_max');
  url.searchParams.set('forecast_days', '1');
  url.searchParams.set('timezone', 'auto');

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error('Open-Meteo environmental feed unavailable');
  const data = await response.json();
  const current = data?.current || {};
  const daily = data?.daily || {};
  const temperature = typeof current.temperature_2m === 'number' ? Math.round(current.temperature_2m * 9 / 5 + 32) : undefined;
  const humidity = typeof current.relative_humidity_2m === 'number' ? current.relative_humidity_2m : undefined;
  const cloudCover = typeof current.cloud_cover === 'number' ? current.cloud_cover : undefined;
  const precipitation = typeof current.precipitation === 'number' ? current.precipitation : undefined;
  const windSpeed = typeof current.wind_speed_10m === 'number' ? Math.round(current.wind_speed_10m) : undefined;
  const isDay = typeof current.is_day === 'number' ? current.is_day === 1 : undefined;
  const sunrise = Array.isArray(daily.sunrise) ? daily.sunrise[0] : undefined;
  const sunset = Array.isArray(daily.sunset) ? daily.sunset[0] : undefined;
  const uvIndexMax = Array.isArray(daily.uv_index_max) && typeof daily.uv_index_max[0] === 'number' ? daily.uv_index_max[0] : undefined;

  return {
    temperature,
    condition: describeOpenMeteoCondition(cloudCover, precipitation),
    windSpeed,
    isRainy: (precipitation || 0) > 0,
    isClear: (cloudCover ?? 100) < 35 && (precipitation || 0) === 0,
    humidity,
    cloudCover,
    precipitation,
    isDay,
    sunrise,
    sunset,
    uvIndexMax,
    timezone: data?.timezone,
    celestialPhase: computeCelestialPhase(isDay, sunrise, sunset),
  };
}

export async function fetchWeatherField(lat: number, lon: number): Promise<WeatherFieldData> {
  const source = 'api.weather.gov + Open-Meteo';
  let openMeteo: Partial<WeatherFieldData> = {};
  let openMeteoError: string | undefined;

  try {
    openMeteo = await fetchOpenMeteoWeather(lat, lon);
  } catch (error) {
    openMeteoError = error instanceof Error ? error.message : 'Open-Meteo environmental error';
  }

  try {
    const pointsRes = await fetch(`https://api.weather.gov/points/${lat.toFixed(4)},${lon.toFixed(4)}`);
    if (!pointsRes.ok) throw new Error('Could not resolve grid points');
    const pointsData = await pointsRes.json();

    const forecastUrl = pointsData.properties.forecast;
    const forecastRes = await fetch(forecastUrl);
    if (!forecastRes.ok) throw new Error('Forecast feed unavailable');
    const forecastData = await forecastRes.json();
    const current = forecastData.properties.periods[0];
    const shortForecast = String(current.shortForecast || openMeteo.condition || 'Unknown');

    return {
      status: {
        source,
        timestamp: new Date().toISOString(),
        status: 'active',
        detail: openMeteoError,
      },
      ...openMeteo,
      temperature: typeof current.temperature === 'number' ? current.temperature : openMeteo.temperature,
      condition: shortForecast,
      windSpeed: parseInt(String(current.windSpeed || openMeteo.windSpeed || '0'), 10) || openMeteo.windSpeed,
      isRainy: shortForecast.toLowerCase().includes('rain') || shortForecast.toLowerCase().includes('shower') || openMeteo.isRainy,
      isClear: shortForecast.toLowerCase().includes('sunny') || shortForecast.toLowerCase().includes('clear') || openMeteo.isClear,
    };
  } catch (error) {
    if (Object.keys(openMeteo).length > 0) {
      return {
        status: {
          source,
          timestamp: new Date().toISOString(),
          status: 'partial',
          detail: error instanceof Error ? error.message : 'Weather.gov unavailable; Open-Meteo values used.',
        },
        ...openMeteo,
      };
    }

    return {
      status: {
        source,
        timestamp: new Date().toISOString(),
        status: 'unavailable',
        detail: error instanceof Error ? error.message : 'Weather error',
      },
    };
  }
}
