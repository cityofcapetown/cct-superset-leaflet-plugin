import {getSequentialSchemeRegistry} from "@superset-ui/core";

export function getSelectedColors(linearColorScheme: string): string[]
{
    const colorSchemeRegistry = getSequentialSchemeRegistry();
    const colorScheme = colorSchemeRegistry.get(linearColorScheme);
    return colorScheme ? colorScheme.colors : [];
}

export function getViewportCoordinates(viewportLatitude?: number, viewportLongitude?: number)
{
    const defaultLatitude = -33.9249; // Cape Town
    const defaultLongitude = 18.4241;

    return [
        viewportLatitude ?? defaultLatitude,
        viewportLongitude ?? defaultLongitude
    ];
}
