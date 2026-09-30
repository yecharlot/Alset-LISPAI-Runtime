# Alset Studio — App creation manual (0 → 100)

**Alset-LISPAI-Runtime** is a no-code/low-code studio: node tree UI, reactive state, MiniNode (Mind · Zyrion · LispAI lite · mesh), REST, pulse bus, PWA deploy. Full PrismaTec node is optional via REST.

## Start

```bash
go run ./cmd/alset-studio -addr :5177 -dir web
```

Open http://127.0.0.1:5177/ — hard refresh after pulls (Ctrl+Shift+R).

## Workflow

1. Pick a **template** or **example** (twins: Sales Hub, La Tati, ÁbacoPhy, PrismaTec; or REST·Pulse·Carousel, MiniNode lab).
2. Structure screens: **bottom-tabs**, **router**, **drawer**.
3. Data: **rest-consumer** → same `bind` on **lazy-column**; **loader** on `loadingKey`.
4. Local intelligence: **mind-panel**, **zyrion-panel** (`local: true` = in-browser).
5. Multi-app signals: **pulse-consumer** + node **`key`**; **mesh-peers**.
6. Visual: gradient, glass, shapes, carousel; props use **dropdowns** and **Browse** for local images.
7. **Deploy** → `/apps/<name>/` (bundles `app-runtime.js` + `mininode.js`).

## Core APIs

`POST /api/mind/tick`, `POST /api/zyrion`, `POST /api/lispai`, `GET|POST /api/pulse`, `POST /api/mesh/announce`, `GET /api/mesh/peers`, `GET/POST /v1/data`, `POST /v1/deploy`.

## Safe Lisp patches

`(set-prop id key "value")` — see `docs/LISPAI_FORMS.md`.

## MiniNode vs full PrismaTec

MiniNode is portable and embedded. Point REST at a full PrismaTec node when you need corpus, genes, and full `evaluar-zyrion`.

See also: `docs/MININODE.md`, `docs/AGENTS_REST_PULSE.md`.


## Multimedia & maps

- **video** / **audio**: real playback from `src`/`url` or `state` URL; controls, autoplay, loop.
- **map**: OpenStreetMap embed (`lat`, `lng`, `zoom`).
- Deployed PWAs are **full viewport** (no studio header).
- Examples: Media player, Pulse media, Map explore, Media shell.
