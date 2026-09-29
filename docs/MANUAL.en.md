# Alset Studio Manual (LISPAI Runtime)

Complete guide to **create, test, and deploy** apps with the visual editor, per-device emulator, and shared runtime (preview = PWA).

**Repo:** https://github.com/yecharlot/Alset-LISPAI-Runtime  

**Core rule:** Studio preview and deployed apps use the **same engine** (`web/runtime/app-runtime.js`).

---

## 1. Start

```bash
git clone https://github.com/yecharlot/Alset-LISPAI-Runtime.git
cd Alset-LISPAI-Runtime
go run ./cmd/alset-studio -addr :5177 -dir web
```

Open **http://127.0.0.1:5177/**

After `git pull`, restart the Go process.

---

## 2. UI map

| Control | Role |
|---------|------|
| **App name** | Deploy path `/apps/<name>/` |
| **Examples** | Ready-made apps (landing, mobile shell, …) |
| **Run preview** | Remount tree in the emulator (does **not** deploy) |
| **Backend** | `GET /v1/health` |
| **Deploy PWA** | Writes app + **opens a new browser tab** |
| **Export** | Download `alset-app/v1` JSON |

**Panels:** Toolbox · Canvas · Preview (emulator) · Logic (Props / LispAI / Backend) · Console.

---

## 3. Learning path

```
Start Studio → load “Mobile first” example → Run preview
→ switch Mobile/Tablet/Desktop → drag & resize nodes
→ edit props → Deploy PWA → confirm new tab matches preview
→ build your own app from a template
```

### Run preview vs Deploy

- **Run preview** = mount current tree in the center emulator.
- **Deploy PWA** = `POST /v1/deploy`, copy `app-runtime.js`, open `/apps/<name>/` in a new tab.

---

## 4. Build an app

1. Set the **name** in the top bar.
2. Pick a **template** or **Example**, or drag components from the toolbox.
3. Select a node on the canvas → edit **Props** (content + layout for the active device).
4. In the **Preview**, drag a node to move it; use the **↘ handle** to resize. Layout is stored per device under `props.devices`.
5. Optional: **LispAI** tab → `(set-prop …)` or full `(ui …)` → **Apply LispAI**.
6. **Run preview** to validate splash, drawer, tabs, APIs.
7. **Deploy PWA** and verify the new tab.

### Mobile shell components

| Component | Notes |
|-----------|--------|
| `splash` | `title`, `duration`, `animated`, `autoHide` |
| `hamburger` | Toggles `state` (e.g. `drawerOpen`) |
| `drawer` / `side-menu` | Side panel; children = menu items |
| `tabs-shell` | `tabs: "A,B,C"`; **one child per tab** |

**Gestures in emulator:** swipe → open/close drawer · pull down → simulated refresh.

---

## 5. Backend (dev)

| Route | Use |
|-------|-----|
| `GET /v1/health` | Health |
| `GET\|POST\|DELETE /v1/data` | In-memory CRUD |
| `POST /v1/auth/login` | Demo users: `admin/admin123`, `demo/demo123`, `master/master123` |
| `POST /v1/deploy` | Publish PWA |

---

## 6. Troubleshooting

| Issue | Fix |
|-------|-----|
| Empty preview | **Run preview**; clear preview; check console |
| Empty `classList` error on mobile template | `git pull` + restart server |
| Deploy missing widgets | Redeploy so `app-runtime.js` is copied into the app folder |
| Popup blocked | Open the URL printed in the Studio console |

---

## 7. Mental model

```
Design → structure (canvas) → emulate (preview) → logic (props/LispAI/API)
→ Run preview → Deploy PWA (same paint) → Export JSON backup
```

Full Spanish guide with extended tables: [MANUAL.es.md](./MANUAL.es.md).
