# Alset Studio Manual (EN)

Zero-to-ship guide for **Alset-LISPAI-Runtime**.

## 1. Start

```bash
cd Alset-LISPAI-Runtime
go run ./cmd/alset-studio -addr :5177 -dir web
```

Open **http://127.0.0.1:5177/** — no npm required.

## 2. Workbench map

| Area | Role |
|------|------|
| **Toolbox** | Templates, components, colors |
| **Canvas** | UI tree; drag and drop |
| **Preview** | Live Alset-JS + native `alsetState` |
| **Props / LispAI** | Edit node or full Lisp program |
| **Logic · Backend** | Exercise GET/POST against the lite API |
| **Console / JSON** | Debug and inspect the model |

Panes are resizable and closable; layout is stored in `localStorage`.

## 3. Build an app in 5 steps

1. **Examples** → pick *Landing* / *SaaS* / *CRM* → **Load** or **Run**.
2. Or drag **Column**, **Text**, **Button**, **Input** onto the canvas.
3. Select a node → edit props (`text`, `state`, API URL).
4. Check **Preview** (Mobile / Tablet / Desktop).
5. **Deploy PWA** → a new tab opens `/apps/<name>/`.

## 4. State (`alsetState`)

- Use the same `state` name on a **Button** and a **Metric**.
- Clicks update state; only dependent nodes recompose.
- **Persist** component writes to `localStorage`.

## 5. LispAI panel

### Full tree

1. **Sync tree** from canvas.  
2. Edit structure or strings.  
3. **Apply** rebuilds the canvas.

```lisp
(ui
  (column (pad 12) (gap 10)
    (text "Hello Studio" (size 20) (weight bold) (color primary))
    (button "Add" (state "count") (anim "fade"))
    (metric (title "Total") (state "count") (value "0"))
  )
)
```

### Patches

```lisp
(set-prop n1 text "New title")
(set-state count 3)
```

### Hot-reload

When parentheses balance, changes apply ~500 ms after typing. Errors are sandboxed (pattern + fix), not allowed to freeze the host.

## 6. Multi-device preview

Mobile / Tablet / Desktop change frame width **and** Alset breakpoint (`sm` / `md` / `lg`) so you can validate responsiveness before ship.

## 7. Lite backend

| Method | Path | Purpose |
|--------|------|---------|
| GET/POST | `/v1/data` | List / create JSON rows |
| GET | `/v1/health` | Studio health |
| POST | `/v1/deploy` | Publish PWA + RootCID |

**Logic · Backend**: map form states → POST body, test GET.

## 8. Deploy

Deploy opens a real runnable UI tab (manifest + service worker + `rootcid`), not a JSON dump.

## 9. Format `alset-app/v1`

Tree + states + optional `rootcid` / `agent` / `theme` / `pwa`. Native Alset package shape — not Tiny Core TCZ.

## 10. Practice

Start from **Examples**, one state name per concern, read sandbox **Pattern** + **Fix** on errors, **Clear preview** if the frame looks stale.

## 11. Roadmap link

Studio UI today → Alset Desktop shell later → PrismaTec / AlsetOS organisms, Mind, genes, policy for production agents.
