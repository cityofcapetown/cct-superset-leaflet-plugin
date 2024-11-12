import {QueryFormData} from "@superset-ui/core/lib/query/types/QueryFormData";

interface IMapType {
    key: string;
    label: string;
    hasRegionField: boolean;
    hasLabelField: boolean;
    hasMetricField: boolean;
    componentName: string;
    buildQuery(formData: QueryFormData): void;
}

abstract class MapType implements IMapType{
    abstract key: string;
    abstract label: string;
    abstract hasLatLongFields: boolean;
    abstract hasRegionField: boolean;
    abstract hasLabelField: boolean;
    abstract hasMetricField: boolean;
    abstract componentName: string;

    buildQuery(formData: QueryFormData): void {

      const latitudeValue = formData.latitude;
      const longitudeValue = formData.longitude;

      if (!latitudeValue || !longitudeValue)
        throw new Error(`Latitude and Longitude are required for ${this.label}`);

        // Add latitude and longitude columns
        addColumns(formData, [formData.latitude, formData.longitude]);
    }
}

class ClusteringMap extends MapType {
    key = 'clustering_map';
    label = 'Clustering Map';
    hasLatLongFields = true;
    hasRegionField = false;
    hasLabelField = true;
    hasMetricField = false;
    componentName = 'ClusteringMap';

    buildQuery(formData: QueryFormData): any {
        super.buildQuery(formData);

        // Add label column
        addColumns(formData, formData?.leaflet_labels);
    }
}

class HeatMap extends MapType{
    key = 'heat_map';
    label = 'Heat Map';
    hasLatLongFields = true;
    hasRegionField = false;
    hasLabelField = false;
    hasMetricField = true;
    componentName = 'HeatMap';

    buildQuery(formData: QueryFormData): any {
        super.buildQuery(formData);

        const metricValue = formData.metric;
        if (!metricValue)
            throw new Error('Metric is required for Heat Map');
    }
}

class ChoroplethMap extends MapType{
    key = 'choropleth_map';
    label = 'Choropleth Map';
    hasLatLongFields = false;
    hasRegionField = true;
    hasLabelField = false;
    hasMetricField = true;
    componentName = 'ChoroplethMap';

  buildQuery(formData: QueryFormData): any {

    const geoBoundUrl = formData.geo_bounds_url;
    const geoLabelField = formData.geo_label_field;
    const metric = formData.metric;
    const region = formData.region;

    if (!geoBoundUrl)
      throw new Error('Geo Bounds URL is required for Choropleth Map');

    if (!geoLabelField)
      throw new Error('Geo Label Field is required for Choropleth Map');

    if (!metric)
      throw new Error('Metric (Value) is required for Choropleth Map');

    if (!region)
      throw new Error('Region is required for Choropleth Map');

    // Add region column
    addColumns(formData, [region]);
  }
}

class BubbleMap extends MapType{
    key = 'bubble_map';
    label = 'Bubble Map';
    hasLatLongFields = true;
    hasRegionField = false;
    hasLabelField = false;
    hasMetricField = true;
    componentName = 'BubbleMap';

    buildQuery(formData: QueryFormData): any {
        super.buildQuery(formData);

        const metricValue = formData.metric;
        if (!metricValue)
            throw new Error('Metric is required for Bubble Map');
    }
}

function addColumns(formData: QueryFormData, columns: string[]) {
    if (!columns)
        return;

    formData.columns = formData.columns || [];

    columns.forEach(column => {
        if (column && !formData?.columns?.includes(column)) {
            formData?.columns?.push(column);
        }
    });
}

const mapTypes = [new ClusteringMap(), new HeatMap(), new ChoroplethMap(), new BubbleMap()];

export {MapType, mapTypes}

