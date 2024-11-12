import React from 'react';
import { Map, TileLayer, GeoJSON } from 'react-leaflet';
import { getViewportCoordinates } from './common/mapComponentUtils';
import "leaflet/dist/leaflet.css";
import 'react-leaflet-markercluster/dist/styles.min.css';
import useGeoJSON from './common/GeoJSONOverlay';

const ClusteringMap: React.FC<any> = (props) => {
  const { viewportZoom, height, width, geoLabelField, geoBoundsUrl } = props;
  const [viewportLatitude, viewportLongitude] = getViewportCoordinates(props.formData.viewportLatitude, props.formData.viewportLongitude);

  const { geoData, error } = useGeoJSON(geoBoundsUrl);
  const metric_column = props?.formData?.metric?.label ?? '';
  const region_column = props?.formData?.region ?? '';
  const label_columns = props.formData.groupby || [];
  const data = props.data;

  const values = data.map((item: any) => item[metric_column]);
  const min = Math.min(...values);
  const max = Math.max(...values);

  const colorShades = [
    "#F7BC07", "#F0A520", "#EA8E39", "#E27752", "#DB606B",
    "#D44984", "#CE329D", "#B52A8E", "#9D237E", "#C60076"
  ];

  const getColor = (value: number) => {
    const ratio = (value - min) / (max - min);
    const colorIndex = Math.floor(ratio * (colorShades.length - 1));
    return colorShades[colorIndex];
  };

  const style = (feature: any) => {
    const regionValue = data.find((item: any) => item[region_column] === feature.properties[geoLabelField])?.[metric_column];
    return {
      color: "black",
      weight: 1,
      fillOpacity: 0.7,
      fillColor: regionValue !== undefined ? getColor(regionValue) : '#ccc'
    };
  };

  return (
    <div style={{ position: 'relative' }}>
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
            style={style}
            onEachFeature={(feature, layer) => {
              const regionData = data.find((item: any) => item[region_column] === feature.properties[geoLabelField]);
              if (regionData) {
                const popupContent = `
                  <div>
                    <strong>${feature.properties[geoLabelField]}</strong><br/>
                    ${label_columns.map((colName: any) => `<div><strong>${colName}:</strong> ${regionData[colName]}</div>`).join("")}
                    <div><strong>Value - ${metric_column}:</strong> ${regionData[metric_column]}</div>
                  </div>
                `;

                layer.bindPopup(popupContent);
              }
            }}
          />
        )}

        {error && <div>Error loading GeoJSON data: {error.message}</div>}
      </Map>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        padding: '10px',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '5px',
        zIndex: 1000
      }}>
        <strong>Legend</strong>  {/* @todo - legend title should be configurable */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {colorShades.map((color, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: color,
                marginRight: '5px'
              }}></div>
              <span>{Math.round(min + (index / (colorShades.length - 1)) * (max - min))}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClusteringMap;
