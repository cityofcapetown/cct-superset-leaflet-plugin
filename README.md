# superset-leaflet-plugin

This is the Superset Leaflet Plugin by City of Cape Town Data Science Team Superset Chart Plugin.

### Clone the repository

```bash
git clone https://ds1.capetown.gov.za/ds_gitlab/OPM/cct-superset-plugin-leaflet.git superset-leaflet-plugin
```

### Usage

To build the plugin, run the following commands:

```
npm ci
npm run build
```

Alternatively, to run the plugin in development mode (=rebuilding whenever changes are made), start the dev server with the following command:

```
npm run dev
```

To add the package to Superset, go to the `superset-frontend` subdirectory in your Superset source folder (assuming both the `superset-leaflet-plugin` plugin and `superset` repos are in the same root directory) and run
```
npm i -S ../../superset-leaflet-plugin
```

If your Superset plugin exists in the `superset-frontend` directory and you wish to resolve TypeScript errors about `@superset-ui/core` not being resolved correctly, add the following to your `tsconfig.json` file:

```
"references": [
  {
    "path": "../../packages/superset-ui-chart-controls"
  },
  {
    "path": "../../packages/superset-ui-core"
  }
]
```

You may also wish to add the following to the `include` array in `tsconfig.json` to make Superset types available to your plugin:

```
"../../types/**/*"
```

Finally, if you wish to ensure your plugin `tsconfig.json` is aligned with the root Superset project, you may add the following to your `tsconfig.json` file:

```
"extends": "../../tsconfig.json",
```

After this edit the `superset-frontend/src/visualizations/presets/MainPreset.js` and make the following changes:

```js
import { SupersetLeafletPlugin } from 'superset-leaflet-plugin';
```

to import the plugin and later add the following to the array that's passed to the `plugins` property:
```js
new SupersetLeafletPlugin().configure({ key: 'superset-leaflet-plugin' }),
```

After that the plugin should show up when you run Superset, e.g. the development server:

```
npm run dev-server
```
