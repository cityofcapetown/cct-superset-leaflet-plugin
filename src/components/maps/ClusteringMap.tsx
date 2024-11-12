import React from 'react';
import { Map, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { getViewportCoordinates } from './common/mapComponentUtils';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import 'react-leaflet-markercluster/dist/styles.min.css';
import useGeoJSON from './common/GeoJSONOverlay';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';


const ClusteringMap: React.FC<any> = (props) => {
  const { viewportZoom, height, width, geoLabelField, geoBoundsUrl } = props;
  const [viewportLatitude, viewportLongitude] = getViewportCoordinates(props.formData.viewportLatitude, props.formData.viewportLongitude);

  // Set default marker icon
  L.Marker.prototype.options.icon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });

  // Use the custom hook to fetch geo data
  const { geoData, error } = useGeoJSON(geoBoundsUrl);

  return (
    <div>
      <Map
        center={[viewportLatitude, viewportLongitude]}
        zoom={viewportZoom}
        style={{ height, width }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
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

        {/* Marker Clustering for Data Points */}
        <MarkerClusterGroup>
          {props.data.map((location: any, index: any) => {
            const lat = location[props.formData.latitude];
            const lng = location[props.formData.longitude];

            if (lat !== undefined && lng !== undefined) {
              return (
                <Marker key={`marker${index}`} position={[lat, lng]}>
                  <Popup>
                    {props.formData.leafletLabels?.map((colName: any, idx: any) => (
                      <div key={`label${idx}`}>
                        <strong>{colName}:</strong> {location[colName]}
                      </div>
                    ))}
                  </Popup>
                </Marker>
              );
            } else {
              console.warn(`Invalid LatLng for item at index ${index}:`, { lat, lng });
              return null;
            }
          })}
        </MarkerClusterGroup>
      </Map>

      {/* Display error if there's an issue with fetching the GeoJSON data */}
      {error && <div>Error loading GeoJSON data: {error.message}</div>}
    </div>
  );
};

export default ClusteringMap;
