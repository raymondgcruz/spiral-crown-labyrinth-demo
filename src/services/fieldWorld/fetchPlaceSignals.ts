/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FieldFeedStatus } from '../../types/fieldWorld';

export interface PlaceSignal {
  id: string;
  name: string;
  type: string;
  category: "park" | "library" | "water" | "community" | "transit";
}

export interface PlaceFieldData {
  status: FieldFeedStatus;
  signals: PlaceSignal[];
}

export async function fetchPlaceSignals(lat: number, lon: number): Promise<PlaceFieldData> {
  const source = "Overpass/OSM";
  const radius = 5000; // 5km
  
  // Overpass QL query for public healing places
  const query = `
    [out:json][timeout:25];
    (
      node["leisure"="park"](around:${radius},${lat},${lon});
      way["leisure"="park"](around:${radius},${lat},${lon});
      node["amenity"="library"](around:${radius},${lat},${lon});
      node["waterway"](around:${radius},${lat},${lon});
      node["amenity"="community_centre"](around:${radius},${lat},${lon});
    );
    out body;
    >;
    out skel qt;
  `;

  try {
    const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error("Place Data Feed Unavailable");
    const data = await response.json();
    
    const signals: PlaceSignal[] = data.elements.map((e: any) => ({
      id: e.id.toString(),
      name: e.tags.name || "Unnamed Place",
      type: e.tags.leisure || e.tags.amenity || e.tags.waterway || "Public Space",
      category: e.tags.leisure === "park" ? "park" : 
                e.tags.amenity === "library" ? "library" : 
                e.tags.amenity === "community_centre" ? "community" : "water"
    })).slice(0, 15); // Limit to 15 for simplicity
    
    return {
      status: {
        source,
        timestamp: new Date().toISOString(),
        status: "active"
      },
      signals
    };
  } catch (error) {
    return {
      status: {
        source,
        timestamp: new Date().toISOString(),
        status: "unavailable",
        detail: error instanceof Error ? error.message : "Place error"
      },
      signals: []
    };
  }
}
