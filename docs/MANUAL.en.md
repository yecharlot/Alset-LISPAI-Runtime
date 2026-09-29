# Alset Studio Manual (LISPAI Runtime)

Practical guide to build, test and deploy apps with **LispAI**, **Alset-JS**, and the Go studio server.

## 1. Start

```bash
git clone https://github.com/yecharlot/Alset-LISPAI-Runtime.git
cd Alset-LISPAI-Runtime
go run ./cmd/alset-studio -addr :5177 -dir web
```

Open **http://127.0.0.1:5177/**

| Panel | Purpose |
|-------|---------|
| **Toolbox** | Drag or click components |
| **Canvas** | Visual app tree |
| **Props** | Edit selected node |
| **LispAI** | UI as data; patches or full trees |
| **Preview** | Live Mobile / Tablet / Desktop |
| **Console** | Isolated logs and errors |

## 2. App from zero

1. Set the **name** in the top bar.
2. Use a **template** or drag **Column**, **Text**, **Row**, **Button**.
3. Select a node → edit props (live preview).
4. In **LispAI**:
   - Patch: `(set-prop n1 text "Hello")`
   - Full tree: `(ui (column (text "Title") (row (button "A") (button "B"))))` then **Apply Lisp**.
5. Switch **Mobile / Tablet / Desktop** — frame + breakpoints **hot-reload**.
6. **Export** downloads `alset-app/v1` JSON.
7. **Deploy PWA** publishes to `/apps/<name>/` and **opens a browser tab**.

## 3. LispAI forms

| Form | Effect |
|------|--------|
| `(set-prop id key "value")` | Patch a node prop |
| `(ui …)` / `(column …)` / `(row …)` | Replace visual tree |
| `(login-token …)` `(auth-gate (role "admin") …)` | Role-gated UI |

See [LISPAI_FORMS.md](./LISPAI_FORMS.md).

## 4. Roles & tokens

| User | Password | Role |
|------|----------|------|
| `admin` | `admin123` | admin |
| `demo` | `demo123` | user |
| `master` | `master123` | master |

- `POST /v1/auth/login` · `GET /v1/auth/me` · `GET|POST /v1/data` · `POST /v1/deploy`

## 5. Device preview

Row layout stays **horizontal** on click. Optional `(wrap true)` enables wrapping. Breakpoints follow the **device frame width**.

## 6. Ecosystem

**Alset-JS** = primitives · **LispAI** = data-driven UI · **PrismaTec** = node/Mind/Gen · format **`alset-app/v1`**.

---

*Alset Studio — fastest path from idea to PWA without dropping LispAI power.*
