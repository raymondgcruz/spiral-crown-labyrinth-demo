/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FieldFeedStatus } from '../../types/fieldWorld';

export interface AirQualityFieldData {
  status: FieldFeedStatus;
  aqi?: number;
  category?: string;
  pm25?: number;
  pm10?: number;
  uvIndex?: number;
}

function classifyUsAqi(aqi?: number): string {
  if (aqi === undefined || Number.isNaN(aqi)) return 'Unknown';
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Sensitive Caution';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

function firstNumber(values?: unknown): number | undefined {
  if (!Array.isArray(values)) return undefined;
  const found = values.find((value) => typeof value === 'number' && Number.isFinite(value));
  return typeof found === 'number' ? found : undefined;
}

export async function fetchAirQualityField(lat: number, lon: number): Promise<AirQualityFieldData> {
  const source = 'Open-Meteo Air Quality';
  try {
    const url = new URL('https://air-quality-api.open-meteo.com/v1/air-quality');
    url.searchParams.set('latitude', lat.toFixed(4));
    url.searchParams.set('longitude', lon.toFixed(4));
    url.searchParams.set('hourly', 'us_aqi,pm2_5,pm10,uv_index');
    url.searchParams.set('forecast_hours', '1');
    url.searchParams.set('timezone', 'auto');

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Air quality feed unavailable');
    const data = await response.json();

    const aqi = firstNumber(data?.hourly?.us_aqi);
    const pm25 = firstNumber(data?.hourly?.pm2_5);
    const pm10 = firstNumber(data?.hourly?.pm10);
    const uvIndex = firstNumber(data?.hourly?.uv_index);

    if (aqi === undefined && pm25 === undefined && pm10 === undefined && uvIndex === undefined) {
      throw new Error('Air quality feed returned no usable values');
    }

    return {
      status: {
        source,
        timestamp: new Date().toISOString(),
        status: aqi !== undefined ? 'active' : 'partial',
        detail: aqi === undefined ? 'AQI unavailable; particle/UV values may still be present.' : undefined,
      },
      aqi,
      category: classifyUsAqi(aqi),
      pm25,
      pm10,
      uvIndex,
    };
  } catch (error) {
    return {
      status: {
        source,
        timestamp: new Date().toISOString(),
        status: 'unavailable',
        detail: error instanceof Error ? error.message : 'Air quality error',
      },
    };
  }
}
