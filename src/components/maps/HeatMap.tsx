import React, { useRef, useEffect } from 'react';
import { getViewportCoordinates } from "./common/mapComponentUtils";
import { Map, TileLayer, GeoJSON } from 'react-leaflet';
import useGeoJSON from "./common/GeoJSONOverlay";
import 'leaflet.heat';
import L from 'leaflet';

const HeatMap: React.FC<any> = (props) => {
  const { viewportZoom, height, width, geoLabelField, geoBoundsUrl } = props;
  const [viewportLatitude, viewportLongitude] = getViewportCoordinates(props.formData.viewportLatitude, props.formData.viewportLongitude);

  const metric_column = props?.formData?.metric?.label ?? '';
  const latitude_column = props?.formData?.latitude ?? '';
  const longitude_column = props?.formData?.longitude ?? '';
  const groupby_columns = props.formData.groupby || [];
  const data = props.data;

  // Use the custom hook to fetch geo data
  const { geoData, error } = useGeoJSON(geoBoundsUrl);

  const mapRef = useRef(null);

  // Prepare heatmap data: [lat, lng, intensity, originalData]
  const heatmapData = data
    .filter((item: any) =>
      item[latitude_column] != null &&
      item[longitude_column] != null &&
      !isNaN(item[latitude_column]) &&
      !isNaN(item[longitude_column])
    )
    .map((item: any) => [
      item[latitude_column],
      item[longitude_column],
      item[metric_column] || 0,
      item  // store the original data object for reference
    ]);

  // Calculate the maximum intensity from the data
// Calculate the average intensity and add 25%
  const totalIntensity = heatmapData.reduce((sum: any, point: any) => sum + point[2], 0);
  const averageIntensity = heatmapData.length > 0 ? totalIntensity / heatmapData.length : 0;
  const maxIntensity = averageIntensity * 1.25; // just a stupid calculation to make the heatmap look better

  // Add heatmap and click listener
  // @ts-ignore
  useEffect(() => {
    if (mapRef.current && heatmapData.length) {
      // @ts-ignore
      const map = mapRef.current.leafletElement;
      const heatLayer = L.heatLayer(
        heatmapData.map( (point: any) => [point[0], point[1], point[2]]),
        { radius: 10, blur: 5, maxZoom: 17,  max: maxIntensity }  // @todo - make radius and blur user configurable
      );
      heatLayer.addTo(map);

      // Handle click event to display a label popup at the nearest data point
      const handleClick = (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;

        // Find the closest data point to the clicked location
        let closestPoint: any = null;
        let minDistance = Infinity;

        for (const point of heatmapData) {
          const [pointLat, pointLng, intensity, originalData] = point;
          const distance = Math.sqrt(Math.pow(lat - pointLat, 2) + Math.pow(lng - pointLng, 2));
          if (distance < minDistance) {
            minDistance = distance;
            closestPoint = { lat: pointLat, lng: pointLng, intensity, originalData };
          }
        }

        // If a close point was found, show a popup
        if (closestPoint && minDistance < 0.01) { // Threshold distance to avoid irrelevant points
          const content = `
            <div>
              <strong>Intensity - ${metric_column}:</strong> ${closestPoint.intensity}
              ${groupby_columns.map((colName: string) => {
            return `<div><strong>${colName}:</strong> ${closestPoint.originalData[colName] || ''}</div>`;
          }).join('')}
            </div>
          `;

          L.popup()
            .setLatLng([closestPoint.lat, closestPoint.lng])
            .setContent(content)
            .openOn(map);
        }
      };

      map.on('click', handleClick);

      // Cleanup event listener and heat layer on component unmount
      return () => {
        map.off('click', handleClick);
        map.removeLayer(heatLayer);
      };
    }
  }, [heatmapData, maxIntensity]);

  return (
    <div>
      <Map
        ref={mapRef}
        center={[viewportLatitude, viewportLongitude]}
        zoom={viewportZoom}
        style={{height, width}}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {geoData && (
          <GeoJSON
            data={geoData}
            style={{color: "blue", weight: 2, fillOpacity: 0.1}}
            onEachFeature={(feature, layer) => {
              const label = feature.properties ? feature.properties[geoLabelField] : null;
              if (label) {
                layer.bindPopup(`<strong>${label}</strong>`);
              }
            }}
          />
        )}
      </Map>

      {/* Display error if there's an issue with fetching the GeoJSON data */}
      {error && <div>Error loading GeoJSON data: {error.message}</div>}
    </div>
  );
};

export default HeatMap;
