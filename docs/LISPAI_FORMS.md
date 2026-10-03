# LispAI forms (UI runtime)

| Form | Role |
|------|------|
| `(ui …)` | Root UI tree |
| `(column …)` `(row …)` | Layout (`(wrap true)` on row to allow wrap) |
| `(text "…" (size n) (color c) (weight bold))` | Label |
| `(button "…" (on-click …) (action …))` | Action |
| `(card …)` `(input …)` `(spacer …)` `(badge …)` | Surfaces / input |
| `(metric …)` `(list …)` `(table …)` `(nav …)` `(hero …)` | Composite |
| `(api …)` `(api-post …)` | REST |
| `(login-token …)` | Login → `/v1/auth/login` + `session` state |
| `(auth-gate (role "admin") …)` | Show children only if session role ≥ required |
| `(role-badge)` | Shows current session role |
| `(theme (primary "#…") …)` | Theme tokens |
| `(def x v)` `(set! x v)` | Bindings |
| `(recordar k v)` `(leer k)` | Memory |
| `(set-prop id key "value")` | Safe patch against studio tree |
| `(gene name body)` `(agent name)` | Registry tokens |
| `(rootcid data)` | Content id token |
| `(mind-note "…")` `(log …)` | Annotation / console |
| `(si cond a b)` `(igual a b)` `(+ …)` `(str …)` | Logic |

Special forms do not auto-authorize PrismaTec node policies.
