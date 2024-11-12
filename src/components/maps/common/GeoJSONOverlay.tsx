import { useState, useEffect } from 'react';
import { GeoJsonObject } from 'geojson';

interface UseGeoJSONResult {
  geoData: GeoJsonObject | null;
  error: Error | null;
}

const GeoJSONOverlay = (geoBoundsUrl: string): UseGeoJSONResult => {
  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!geoBoundsUrl) return;

    const fetchGeoData = async () => {
      try {
        const response = await fetch(geoBoundsUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: GeoJsonObject = await response.json();
        setGeoData(data);
      } catch (err) {
        console.error("Error fetching GeoJSON:", err);
        setError(err as Error);
      }
    };

    fetchGeoData();
  }, [geoBoundsUrl]);

  return { geoData, error };
};

export default GeoJSONOverlay;
