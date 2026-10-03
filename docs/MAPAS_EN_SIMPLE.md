# Mapas y viajes, explicado fácil

## ¿Qué hay detrás?

Imagina tres capas:

1. **El mapa** (MapLibre): pinta calles y una línea amarilla.
2. **La ruta** (OSRM): calcula el camino en coche entre dos puntos.
3. **Las direcciones**: las eliges de una lista (provincia → municipio) o las escribes y Nominatim las convierte en coordenadas.

## Alset Ride (ejemplo tipo Uber)

1. Eliges **origen** y **destino**.
2. Pulsas **Calcular ruta y tarifa**.
3. El sistema pide a OSRM la geometría de la ruta.
4. El mapa dibuja la polilínea.
5. Ves kilómetros, minutos y una tarifa estimada en CUP.
6. **Pedir conductor** simula que alguien acepta el viaje.
7. **Mind** puede responder dudas del viaje.

## Piezas del toolbox

| Nombre en el toolbox | Para qué sirve |
|----------------------|----------------|
| Mapa | Ver el mapa y la ruta |
| Planificar viaje | Llamar a OSRM y guardar km / min / tarifa |
| Selector dirección | Elegir provincia, municipio, localidad |
| Geocodificar | Escribir una dirección en texto libre |

## Si la ruta no sale

- Hace falta **internet** (OSRM y MapLibre son servicios externos).
- Origen y destino deben ser coordenadas válidas.
- A veces el servidor público de OSRM va lento: espera unos segundos y reintenta.
