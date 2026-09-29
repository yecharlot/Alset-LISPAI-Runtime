# LispAI forms (UI runtime)

| Form | Role |
|------|------|
| `(ui …)` | Root UI tree |
| `(column …)` `(row …)` | Layout |
| `(text "…" (size n) (color c) (weight bold))` | Label |
| `(button "…" (on-click …))` | Action |
| `(card …)` | Surface |
| `(theme (primary "#…") …)` | Theme tokens |
| `(def x v)` `(set! x v)` | Bindings |
| `(recordar k v)` `(leer k)` | Memory |
| `(gene name body)` `(agent name)` | Registry tokens |
| `(rootcid data)` | Content id token (local abstract) |
| `(mind-note "…")` | Annotation |
| `(log …)` | Console |
| `(si cond a b)` `(igual a b)` `(+ …)` `(str …)` | Logic |

Special forms do not auto-authorize PrismaTec policies.
