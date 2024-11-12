/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, { useEffect, createRef } from 'react';
import { styled } from '@superset-ui/core';
import { SupersetLeafletPluginProps, SupersetLeafletPluginStylesProps } from './types';
import mapsComponentRegistry from './components/maps/common/mapsComponentRegistry';
import {mapTypes} from "./mapTypes";

// The following Styles component is a <div> element, which has been styled using Emotion
// For docs, visit https://emotion.sh/docs/styled

// Theming variables are provided for your use via a ThemeProvider
// imported from @superset-ui/core. For variables available, please visit
// https://github.com/apache-superset/superset-ui/blob/master/packages/superset-ui-core/src/style/index.ts

const Styles = styled.div<SupersetLeafletPluginStylesProps>`
  overflow: hidden !important;
 /* background-color: ${({ theme }) => theme.colors.secondary.light2}*/;
  padding: ${({ theme }) => theme.gridUnit * 4}px;
  /*border-radius: ${({ theme }) => theme.gridUnit * 2}px;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;*/

  h3 {
    /* You can use your props to control CSS! */
    margin-top: 0;
    margin-bottom: ${({ theme }) => theme.gridUnit * 3}px;
    font-size: ${({ theme, headerFontSize }) =>
      theme.typography.sizes[headerFontSize]}px;
    font-weight: ${({ theme, boldText }) =>
      theme.typography.weights[boldText ? 'bold' : 'normal']};
  }

  pre {
    height: ${({ theme, headerFontSize, height }) =>
      height - theme.gridUnit * 12 - theme.typography.sizes[headerFontSize]}px;
  }
`;

/**
 * ******************* WHAT YOU CAN BUILD HERE *******************
 *  In essence, a chart is given a few key ingredients to work with:
 *  * Data: provided via `props.data`
 *  * A DOM element
 *  * FormData (your controls!) provided as props by transformProps.ts
 */

export default function SupersetLeafletPlugin(props: SupersetLeafletPluginProps) {
  const { data, height, width } = props;
  const { leafletType,viewportLatitude, viewportLongitude,  viewportZoom, showGeoBounds, geoLabelField, geoBoundsUrl, leafletLabels, linearColorScheme} = props.formData;

  const rootElem = createRef<HTMLDivElement>();

  useEffect(() => {
    const root = rootElem.current as HTMLElement;
    console.log('Plugin element', root);
  });


  // Find the map type
  const mapType = mapTypes.find(type => type.key === leafletType);
  if (!mapType) {
    return <div>Unknown map type</div>;
  }

    // Find the component for the map type
  const MapComponent = mapsComponentRegistry[mapType.componentName as keyof typeof mapsComponentRegistry];
  if (!MapComponent) {
    return <div>Component not found for {mapType.componentName}</div>;
  }

  return (
    <Styles
      ref={rootElem}
      boldText={props.boldText}
      headerFontSize={props.headerFontSize}
      height={height}
      width={width}
    >
      <MapComponent
          data={data}
          height={height}
          width={width}
          linearColorScheme={linearColorScheme}
          formData={props.formData}
          viewportLatitude={viewportLatitude}
          viewportLongitude={viewportLongitude}
          viewportZoom={viewportZoom}
          showGeoBounds={showGeoBounds}
          geoLabelField={geoLabelField}
          geoBoundsUrl={geoBoundsUrl}
          leafletLabels={leafletLabels}
      />
    </Styles>
  );
}
