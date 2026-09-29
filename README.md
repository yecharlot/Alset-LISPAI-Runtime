# Alset-LISPAI-Runtime

**Studio no-code** para interfaces de próxima generación sobre el modelo Alset:

- Toolbox (básicos + compuestos + REST/IPFS/estado)
- Canvas drag-and-drop
- Propiedades y **alsetState** por componente
- Preview vivo
- Export **`.alset.json`** y **Desplegar** local (`/v1/deploy`)
- LispAI generado desde el árbol
- Servidor **Go** (sin npm)

## Arranque

```bash
cd Alset-LISPAI-Runtime
go run ./cmd/alset-studio -addr :5177 -dir web
```

http://127.0.0.1:5177/

## Formato de app

`format: alset-app/v1` — árbol de nodos + estados + metadatos.  
Es el paquete nativo del ecosistema Alset (no el `.tcz` de Tiny Core).
