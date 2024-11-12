import React from 'react';
import { Map, TileLayer, CircleMarker, Popup, GeoJSON } from 'react-leaflet';
import { getViewportCoordinates } from './common/mapComponentUtils';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import useGeoJSON from './common/GeoJSONOverlay';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const BubbleMap: React.FC<any> = (props) => {
  const { viewportZoom, height, width, geoLabelField, geoBoundsUrl } = props;
  const [viewportLatitude, viewportLongitude] = getViewportCoordinates(props.formData.viewportLatitude, props.formData.viewportLongitude);

  const metric_column = props?.formData?.metric?.label ?? '';

  const colorShades = [ // @todo - should be configurable
    "#F7BC07", "#F0A520", "#EA8E39", "#E27752", "#DB606B",
    "#D44984", "#CE329D", "#B52A8E", "#9D237E", "#C60076"
  ];

  // Helper function to get color based on size
  const getColorBySize = (value: number, min: number, max: number) => {
    const range = max - min;
    const normalizedValue = range ? (value - min) / range : 0;
    const colorIndex = Math.min(
      colorShades.length - 1,
      Math.floor(normalizedValue * (colorShades.length - 1))
    );
    return colorShades[colorIndex];
  };

  // Set default marker icon
  L.Marker.prototype.options.icon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });

  // Calculate min and max for the metric column
  const metricValues = props.data.map((location: any) => location[metric_column] || 0);
  const minMetric = Math.min(...metricValues);
  const maxMetric = Math.max(...metricValues);

  // Use the custom hook to fetch geo data
  const { geoData, error } = useGeoJSON(geoBoundsUrl);

  // Legend component
  const Legend = () => (
    <div style={{
      position: 'absolute',
      bottom: '10px',
      left: '10px',
      backgroundColor: 'white',
      padding: '10px',
      borderRadius: '5px',
      boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.3)',
      zIndex: 1000
    }}>
      <h4>Legend</h4> {/* @todo - legend title should be configurable */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {colorShades.map((color, index) => {
          const valueRange = minMetric + (index * (maxMetric - minMetric) / (colorShades.length - 1));
          return (
            <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{
                width: '20px',
                height: '20px',
                backgroundColor: color,
                display: 'inline-block',
                marginRight: '8px'
              }}></span>
              <span>{valueRange.toFixed(0)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{ position: 'relative' }}>
      <Map
        center={[viewportLatitude, viewportLongitude]}
        zoom={viewportZoom}
        style={{ height, width }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.carto.com/attributions">CARTO</a>'
        />

        {geoData && (
          <GeoJSON
            data={geoData}
            style={{ color: "blue", weight: 2, fillOpacity: 0.1 }}
            onEachFeature={(feature, layer) => {
              const label = feature.properties ? feature.properties[geoLabelField] : null;
              if (label) {
                layer.bindPopup(`<strong>${label}</strong>`);
              }
            }}
          />
        )}

        {/* Bubble Map for Data Points */}
        {props.data.map((location: any, index: any) => {
          const lat = location[props.formData.latitude];
          const lng = location[props.formData.longitude];
          const metricValue = location[metric_column] || 0;
          const color = getColorBySize(metricValue, minMetric, maxMetric);

          if (lat !== undefined && lng !== undefined) {
            return (
              <CircleMarker
                key={`marker${index}`}
                center={[lat, lng]}
                radius={metricValue || 10} // Customize the radius size as needed
                color={color}
                fillOpacity={0.5} // Adjust opacity if desired
              >
                <Popup>
                  <p>{metric_column}: {metricValue}</p>
                  {props.formData.groupby?.map((colName: any, idx: any) => (
                    <div key={`label${idx}`}>
                      <strong>{colName}:</strong> {location[colName]}
                    </div>
                  ))}
                </Popup>
              </CircleMarker>
            );
          } else {
            console.warn(`Invalid LatLng for item at index ${index}:`, { lat, lng });
            return null;
          }
        })}
      </Map>

      {/* Legend for color scale */}
      <Legend />

      {/* Display error if there's an issue with fetching the GeoJSON data */}
      {error && <div>Error loading GeoJSON data: {error.message}</div>}
    </div>
  );
};

export default BubbleMap;

