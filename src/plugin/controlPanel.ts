import { t } from '@superset-ui/core';
import {columnChoices, ControlPanelConfig, ControlSetRow, sharedControls} from '@superset-ui/chart-controls';
import {mapTypes} from "../mapTypes";

const optionalFields: { [key: string]: ControlSetRow } = {
  // Label Field group
  labelField: [
    {
      name: 'leaflet_labels',
      config: {
        type: 'SelectControl',
        label: t('Leaflet Labels'),
        //  validators: [validateNonEmpty],
        validators: [], //@todo - only validate optional fields if visible
        visibility: ({ controls }) => {
          const selectedMapType = String(controls.leaflet_type?.value  || '');
          return mapTypes.find( mapType => mapType.key === selectedMapType)?.hasLabelField || false;
        },
        multi: true,
        description: t('Select the columns to display as labels on the map'),
        mapStateToProps: state => ({
          choices: columnChoices(state.datasource),
        }),
      },
    },
  ],
  // Region Field group
  regionField: [
    {
      name: 'region',
      config: {
        ...sharedControls.entity,
        label: t('Region'),
        // validators: [validateNonEmpty],
        validators: [], //@todo - only validate optional fields if visible
        visibility: ({ controls }) => {
          const selectedMapType = String(controls.leaflet_type?.value  || '');
          return mapTypes.find( mapType => mapType.key === selectedMapType)?.hasRegionField || false;
        },
        description: t('Select the region column for choropleth maps')
      },
    },
  ],
  // Metric Field group
  metricField: [
    {
      name: 'metric',
      config: {
        ...sharedControls.metric,
        label: t('Metric'),
        // validators: [validateNonEmpty], //@todo - only validate optional fields if visible
        validators: [],
        visibility: ({ controls }) => {
          const selectedMapType = String(controls.leaflet_type?.value  || '');
          return mapTypes.find( mapType => mapType.key === selectedMapType)?.hasMetricField || false;
        },
        description: t('Select the metric value') // @todo - add description for all map types
      },
    },
  ],
};

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'latitude',
            config: {
              ...sharedControls.entity,
              label: t('Latitude'),
              description: t('Select the column containing latitude data'),
              validators: [], //@todo - only validate optional fields if visible
              visibility: ({ controls }) => {
                const selectedMapType = String(controls.leaflet_type?.value  || '');
                return mapTypes.find( mapType => mapType.key === selectedMapType)?.hasLatLongFields || false;
              }
            },
          },
        ],
        [
          {
            name: 'longitude',
            config: {
              ...sharedControls.entity,
              label: t('Longitude'),
              description: t('Select the column containing longitude data'),
              validators: [], //@todo - only validate optional fields if visible
              visibility: ({ controls }) => {
                const selectedMapType = String(controls.leaflet_type?.value  || '');
                return mapTypes.find( mapType => mapType.key === selectedMapType)?.hasLatLongFields || false;
              }
            },
          },
        ],
        ['adhoc_filters'],
        [
          {
            name: 'row_limit',
            config: {
              ...sharedControls.row_limit,
              choices: [10, 1000, 10000, 50000, 100000],
              default: 10000,
            },
          },
        ],
        ['groupby']
      ],
    },
    {
      label: t('Map Options'),
      expanded: true,
      controlSetRows: [
        optionalFields.labelField,
        optionalFields.regionField,
        optionalFields.metricField,
      ],
    },
    {
      label: t('Leaflet Options'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'leaflet_type',
            config: {
              type: 'SelectControl',
              renderTrigger: true,
              label: t('Map Type'),
              default: mapTypes[0].key,
              description: t('The type of leaflet map to render'),
              choices: mapTypes.map( mapType => [mapType.key, mapType.label]),
            },
          },
        ],
        [
          {
            name: 'show_geo_bounds',
            config: {
              type: 'CheckboxControl',
              label: t('Show Geographic Bounds'),
              renderTrigger: true,
              default: false,
              description: t('Show or hide the Geographic Bounds input field'),
            },
          },
        ],
        [
          {
            name: 'geo_bounds_url',
            config: {
              type: 'TextControl',
              label: t('Geographic Bounds URL'),
              renderTrigger: true,
              description: t('Enter a URL that returns a JSON array of bounds'),
              validators: [],
              visibility: (state) => {
                return !!(state.controls && state.controls.show_geo_bounds && state.controls.show_geo_bounds.value);
              },
            },
          },
        ],
        [
          {
            name: 'geo_label_field',
            config: {
              type: 'TextControl',
              label: t('Geo Label Field Name'),
              renderTrigger: true,
              default: '',
              description: t('Enter the property name for labels on map boundaries'),
              visibility: (state) => {
                return !!(state.controls && state.controls.show_geo_bounds && state.controls.show_geo_bounds.value);
              },
            },
          },
        ],
      ],
    },
    {
      label: t('Viewport'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'viewport_longitude',
            config: {
              type: 'TextControl',
              label: t('Default longitude'),
              renderTrigger: true,
              default:  18.4241,
              isFloat: true,
              description: t('Longitude of default viewport'),
              places: 8,
              dontRefreshOnChange: true,
            },
          },
          {
            name: 'viewport_latitude',
            config: {
              type: 'TextControl',
              label: t('Default latitude'),
              renderTrigger: true,
              default:  -33.9249,
              isFloat: true,
              description: t('Latitude of default viewport'),
              places: 8,
              dontRefreshOnChange: true,
            },
          },
        ],
        [
          {
            name: 'viewport_zoom',
            config: {
              type: 'TextControl',
              label: t('Zoom'),
              renderTrigger: true,
              isFloat: true,
              default: 11,
              description: t('Zoom level of the map'),
              places: 8,
              dontRefreshOnChange: true,
            },
          },
          null,
        ],
      ],
    },
  ]
};

export default config;
