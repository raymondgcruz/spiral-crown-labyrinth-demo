/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GeocodeResult } from '../../types/fieldWorld';

async function geocodeZip(zip: string): Promise<GeocodeResult | null> {
  try {
    const zipRes = await fetch(`https://api.zippopotam.us/us/${encodeURIComponent(zip)}`);
    if (zipRes.ok) {
      const data = await zipRes.json();
      const place = data?.places?.[0];
      if (place?.latitude && place?.longitude) {
        const city = place['place name'];
        const state = place.state;
        return {
          lat: parseFloat(place.latitude),
          lon: parseFloat(place.longitude),
          label: `${city}, ${state} ${zip}`,
          city,
          state,
          zip,
          country: data.country,
          precision: 'zip',
        };
      }
    }
  } catch {
    // Fall through to OSM lookup.
  }

  try {
    const osmUrl = new URL('https://nominatim.openstreetmap.org/search');
    osmUrl.searchParams.set('postalcode', zip);
    osmUrl.searchParams.set('country', 'USA');
    osmUrl.searchParams.set('format', 'json');
    osmUrl.searchParams.set('addressdetails', '1');
    osmUrl.searchParams.set('limit', '1');

    const response = await fetch(osmUrl.toString(), {
      headers: { 'Accept-Language': 'en-US,en;q=0.9' },
    });
    const data = await response.json();
    if (data && data.length > 0) {
      const res = data[0];
      return {
        lat: parseFloat(res.lat),
        lon: parseFloat(res.lon),
        label: res.display_name || `ZIP Code ${zip}`,
        city: res.address?.city || res.address?.town || res.address?.village,
        state: res.address?.state,
        zip: res.address?.postcode || zip,
        country: res.address?.country,
        precision: 'zip',
      };
    }
  } catch {
    // Return null below.
  }

  return null;
}

/**
 * ROANOKE Geocoding Adapter
 * Handles ZIP, City/State, or Full Address with privacy-first rounding.
 */
export async function geocodeLocation(input: string): Promise<GeocodeResult | null> {
  const query = input.trim();
  if (!query) return null;

  const isZip = /^\d{5}(-\d{4})?$/.test(query);
  const zip = isZip ? query.split('-')[0] : null;

  if (zip) return geocodeZip(zip);

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=1`, {
      headers: { 'Accept-Language': 'en-US,en;q=0.9' },
    });
    const data = await response.json();
    if (data && data.length > 0) {
      const res = data[0];
      return {
        lat: parseFloat(res.lat),
        lon: parseFloat(res.lon),
        label: res.display_name,
        city: res.address?.city || res.address?.town || res.address?.village,
        state: res.address?.state,
        zip: res.address?.postcode,
        country: res.address?.country,
        precision: 'approximate',
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding logic error:', error);
    return null;
  }
}
