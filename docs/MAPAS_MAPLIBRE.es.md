# Mapas MapLibre (mismo enfoque que Alset-JS-Runtime)

En Alset-JS-Runtime el mapa es `MapNode` con **MapLibre GL** y estilo `demotiles.maplibre.org`.

En Studio / runtime de apps se replica:

## Componente `map`

| Prop | Descripción |
|------|-------------|
| `lat` / `lng` o `latState` / `lngState` | Centro |
| `zoom` | Zoom inicial |
| `height` | Alto px |
| `routeState` | State con coords `[[lat,lng],...]` o GeoJSON coordinates |
| `markersState` | State `[{lat,lng,label},...]` |
| `routeColor` / `routeWidth` | Estilo de polilínea |
| `styleUrl` | Estilo MapLibre (default demotiles) |

## `geocode`

Texto libre → Nominatim (OSM) → escribe `mapLat` / `mapLng` / `geoResult`.

## `address-picker`

Listas provincia → municipio → localidad/dirección (catálogo Oriente por defecto) → marker + centro.

## Ruta dibujada

1. `state` `routeCoords` = array de puntos  
2. `map` con `routeState: 'routeCoords'`  
3. Al cambiar el state (botón con JSON), el preview **remount** y MapLibre pinta la `LineString`.

## Drawer opaco

El panel usa `background:#141414 !important` (se corrigió un bug de template que dejaba el fondo transparente).
