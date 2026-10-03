/** Apps de ejemplo listas para App() — nativas Alset-JS + adaptadas del repo Alset-JS-Runtime */
export const EXAMPLE_APPS = [
  {
    id: 'counter',
    name: 'Contador',
    tags: ['state', 'button'],
    blurb: 'alsetState + botones',
    code: `const count = alsetState(0);
function App() {
  return Column(mod().padding(16).gap(12).fillMaxSize(), () => {
    Text("Contador", mod().sizeText(22).weight("800").color(Theme.current.primary));
    Text(String(count.get()), mod().sizeText(40).weight("800"));
    Row(mod().gap(8), () => {
      Button("+1", () => count.set(count.get() + 1));
      Button("Reset", () => count.set(0), mod().background("#333").color("#fff"));
    });
  });
}
`,
  },
  {
    id: 'drawer-tabs',
    name: 'Drawer + Tabs + Stack',
    tags: ['nav', 'drawer', 'tabs'],
    blurb: 'Navegación nativa Router + menú lateral + bottom tabs',
    code: `const route = currentRoute;
const drawerOpen = alsetState(false);
const tab = alsetState("home");

function App() {
  return Column(mod().fillMaxSize().position("relative"), () => {
    // Top bar
    Row(mod().padding(12).gap(10).align("center").background("#141414"), () => {
      Button("☰", () => drawerOpen.set(!drawerOpen.get()), mod().background("transparent").color("#f4b400"));
      Text("Mi App", mod().weight("800").color(Theme.current.primary));
      Spacer(8);
      Text(tab.get(), mod().sizeText(12).color("#999"));
    });

    // Content by tab
    Column(mod().padding(16).gap(12).fillMaxSize(), () => {
      if (tab.get() === "home") {
        Text("Inicio", mod().sizeText(20).weight("800"));
        Text("Stack de tarjetas", mod().sizeText(13).color("#999"));
        Card(mod().padding(14), () => Text("Card 1 · toca una pestaña abajo", mod().weight("600")));
        Card(mod().padding(14), () => Text("Card 2 · drawer con ☰", mod().weight("600")));
      } else if (tab.get() === "map") {
        Text("Mapa", mod().sizeText(18).weight("800"));
        MapNode(mod().height(240).radius(12), { center: [-82.36, 23.11], zoom: 11 });
      } else {
        Text("Perfil", mod().sizeText(18).weight("800"));
        Icon("user", mod().size(32).color(Theme.current.primary));
        Text("Sesión local · Alset-JS", mod().sizeText(13).color("#999"));
      }
    });

    // Bottom tabs
    Row(mod().padding(8).gap(6).background("#0c0c0c"), () => {
      Button("Home", () => tab.set("home"), mod().background(tab.get()==="home"?"#f4b400":"#222").color(tab.get()==="home"?"#111":"#eee"));
      Button("Mapa", () => tab.set("map"), mod().background(tab.get()==="map"?"#f4b400":"#222").color(tab.get()==="map"?"#111":"#eee"));
      Button("Perfil", () => tab.set("profile"), mod().background(tab.get()==="profile"?"#f4b400":"#222").color(tab.get()==="profile"?"#111":"#eee"));
    });

    // Drawer overlay
    if (drawerOpen.get()) {
      Column(mod().position("absolute").addStyle("inset","0").background("rgba(0,0,0,0.45)"), () => {
        Column(mod().width(260).fillMaxSize().background("#141414").padding(16).gap(12), () => {
          Text("Menú", mod().weight("800").color(Theme.current.primary));
          Button("Inicio", () => { tab.set("home"); drawerOpen.set(false); });
          Button("Mapa", () => { tab.set("map"); drawerOpen.set(false); });
          Button("Cerrar", () => drawerOpen.set(false), mod().background("#333").color("#fff"));
        });
      });
    }
  });
}
`,
  },
  {
    id: 'shop-media',
    name: 'Tienda + Media',
    tags: ['commerce', 'video', 'audio'],
    blurb: 'Catálogo, carrito, video y audio',
    code: `const cart = alsetState(0);
const items = alsetState([
  { name: "Pulse Sneaker", price: "45 USD" },
  { name: "Chronos Watch", price: "89 USD" },
]);
function App() {
  return Column(mod().padding(14).gap(12).fillMaxSize(), () => {
    Text("PULSE STORE", mod().sizeText(22).weight("800").color(Theme.current.primary));
    Text("Carrito: " + cart.get(), mod().sizeText(14));
    items.get().forEach((it) => {
      Card(mod().padding(12), () => {
        Text(it.name, mod().weight("700"));
        Text(it.price, mod().sizeText(13).color("#999"));
        Button("Agregar al carrito", () => cart.set(cart.get() + 1));
      });
    });
    Text("Demo video", mod().weight("700"));
    VideoNode(mod().height(160).radius(10).addStyle("src", "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"));
    Text("Demo audio", mod().weight("700"));
    AudioNode(mod().addStyle("src", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"));
  });
}
`,
  },
  {
    id: 'os-launcher',
    name: 'AlsetOS Launcher',
    tags: ['alsetos', 'ans'],
    blurb: 'Apps direccionables .app.ans',
    code: `const toast = alsetState("");
function App() {
  return Column(mod().padding(16).gap(12).fillMaxSize(), () => {
    Text("AlsetOS", mod().sizeText(26).weight("800").color(Theme.current.primary));
    Text("Espacios direccionables", mod().sizeText(13).color("#999"));
    Row(mod().gap(10), () => {
      Card(mod().padding(12), () => {
        Icon("pulse", mod().size(28).color(Theme.current.primary));
        Text("Ride", mod().weight("700"));
        Button("ride-share.app.ans", () => toast.set("ride-share.app.ans"));
      });
      Card(mod().padding(12), () => {
        Icon("star", mod().size(28).color(Theme.current.primary));
        Text("Shop", mod().weight("700"));
        Button("shop.app.ans", () => toast.set("shop.app.ans"));
      });
    });
    if (toast.get()) Text("→ " + toast.get(), mod().sizeText(12).color(Theme.current.primary));
  });
}
`,
  },
  {
    id: 'mind-zyrion',
    name: 'Mind + Zyrion en app',
    tags: ['mind', 'zyrion', 'agent'],
    blurb: 'Latido y evaluación ternaria embebidos',
    code: `const voice = alsetState("Escribe y pulsa Mind…");
const zOut = alsetState("—");
const input = alsetState("hola");
async function tickMind() {
  try {
    const r = await fetch("/api/mind/tick", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input.get() }),
    });
    const j = await r.json();
    voice.set(j.voice || j.error || JSON.stringify(j));
  } catch (e) {
    voice.set("Mind no disponible en este host: " + e.message);
  }
}
async function evalZ() {
  try {
    const r = await fetch("/api/zyrion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entradas: { a: 0.2, b: 0.8 }, topologia: "min" }),
    });
    const j = await r.json();
    zOut.set(JSON.stringify(j, null, 2));
  } catch (e) {
    zOut.set("Zyrion local: usar panel del editor si el API no responde");
  }
}
function App() {
  return Column(mod().padding(14).gap(10).fillMaxSize(), () => {
    Text("Agente en la app", mod().sizeText(20).weight("800").color(Theme.current.primary));
    Input(input, mod().fillMaxWidth(), { placeholder: "Mensaje a Mind" });
    Row(mod().gap(8), () => {
      Button("Latido Mind", () => tickMind());
      Button("Zyrion", () => evalZ());
    });
    Card(mod().padding(12), () => Text(voice.get(), mod().sizeText(13)));
    Text(zOut.get(), mod().sizeText(11).color("#999"));
  });
}
`,
  },
  {
    id: 'syllogism',
    name: 'Silogismos / Self-model',
    tags: ['inference', 'self'],
    blurb: 'Hechos ternarios + puede_ejecutar (cliente)',
    code: `// Demo local de hechos SPO + Conf 0/1/2 (espejo de mind_reason)
const facts = alsetState([
  { s: "organismo", r: "tiene_capacidad", o: "backup", c: 2 },
  { s: "backup", r: "requiere", o: "storage", c: 2 },
  { s: "storage", r: "disponible", o: "true", c: 2 },
  { s: "backup", r: "permite_policy", o: "true", c: 2 },
]);
const answer = alsetState("");
function confOf(s, r, o) {
  const f = facts.get().find((x) => x.s === s && x.r === r && (!o || x.o === o));
  return f ? f.c : 1;
}
function askCanBackup() {
  const has = confOf("organismo", "tiene_capacidad", "backup");
  const req = confOf("backup", "requiere", "storage");
  const avail = confOf("storage", "disponible", "true");
  const pol = confOf("backup", "permite_policy", "true");
  let c = 2;
  if ([has, req, avail, pol].some((x) => x === 0)) c = 0;
  else if ([has, req, avail, pol].some((x) => x === 1)) c = 1;
  answer.set("puede_ejecutar(backup) = " + c + " (premisas has=" + has + " req=" + req + " avail=" + avail + " pol=" + pol + ")");
}
function setAvail(c) {
  const next = facts.get().map((f) =>
    f.s === "storage" && f.r === "disponible" ? { ...f, c } : f
  );
  facts.set(next);
  askCanBackup();
}
function App() {
  return Column(mod().padding(14).gap(10).fillMaxSize(), () => {
    Text("Self-model · silogismo", mod().sizeText(20).weight("800").color(Theme.current.primary));
    Text("Cambia disponibilidad de storage y re-infiere", mod().sizeText(12).color("#999"));
    Row(mod().gap(6), () => {
      Button("storage=2", () => setAvail(2));
      Button("storage=0", () => setAvail(0));
      Button("storage=1", () => setAvail(1));
    });
    Button("Inferir puede_ejecutar", () => askCanBackup());
    Card(mod().padding(12), () => Text(answer.get() || "—", mod().sizeText(13)));
  });
}
`,
  },
  {
    id: 'basic-runtime',
    name: 'Basic (repo Alset-JS-Runtime)',
    tags: ['upstream'],
    blurb: 'Adaptación del example basic del repo',
    sourceUrl: '/alset-editor/examples/basic.js',
    code: `const n = alsetState(0);
function App() {
  return Column(mod().padding(20).gap(12).fillMaxSize(), () => {
    Text("Alset-JS-Runtime · basic", mod().sizeText(20).weight("800").color(Theme.current.primary));
    Text("Clicks: " + n.get(), mod().sizeText(16));
    Button("Incrementar", () => n.set(n.get() + 1));
  });
}
`,
  },
  {
    id: 'prismatec-lite',
    name: 'Prism@.TEC (landing lite)',
    tags: ['upstream', 'prismatec'],
    blurb: 'Inspirada en examples/prismatec del repo Alset-JS-Runtime',
    sourceUrl: '/alset-editor/examples/prismatec.js',
    code: `function App() {
  return Column(mod().padding(0).gap(0).fillMaxSize().background("#121316"), () => {
    Row(mod().padding(16).gap(12).background("#1b1c21"), () => {
      Text("Prism@.TEC", mod().sizeText(18).weight("800").color("#F4B400"));
      Spacer(8);
      Button("Contacto", () => window.open("https://wa.me/5351069717", "_blank"));
    });
    Column(mod().padding(24).gap(14), () => {
      Text("SOBERANÍA TECNOLÓGICA", mod().sizeText(12).color("#F4B400").addStyle("letterSpacing", "0.12em"));
      Text("Infraestructura de decisión distribuida", mod().sizeText(22).weight("800").color("#F5F3EE"));
      Text("Alset · Zyrion · LispAI · organismos digitales con memoria CID.", mod().sizeText(14).color("#ABA9A3"));
      Row(mod().gap(10), () => {
        Button("Ver ecosistema", () => {}, mod().background("#F4B400").color("#121316"));
        Button("WhatsApp", () => window.open("https://wa.me/5351069717", "_blank"), mod().background("#333").color("#fff"));
      });
      Card(mod().padding(16).background("#1b1c21"), () => {
        Text("Nodo · Mind · Gen", mod().weight("700").color("#F4B400"));
        Text("Misma familia tecnológica que PrismaTec en producción.", mod().sizeText(13).color("#ABA9A3"));
      });
    });
  });
}
`,
  },
  {
    id: 'connectors',
    name: 'Conectores REST + Pulse',
    tags: ['rest', 'pulse'],
    blurb: 'Fetch a /v1/data y muestra ítems',
    code: `const data = alsetState([]);
const err = alsetState("");
async function load() {
  try {
    const r = await fetch("/v1/data");
    const j = await r.json();
    data.set(j.items || []);
    err.set("");
  } catch (e) {
    err.set(String(e.message || e));
  }
}
function App() {
  return Column(mod().padding(14).gap(10).fillMaxSize(), () => {
    Text("REST Consumer", mod().sizeText(20).weight("800").color(Theme.current.primary));
    Button("GET /v1/data", () => load());
    if (err.get()) Text(err.get(), mod().color("#f88"));
    data.get().forEach((it, i) => {
      Card(mod().padding(10), () => Text(JSON.stringify(it), mod().sizeText(12)));
    });
    if (!data.get().length && !err.get()) Text("Sin datos aún", mod().sizeText(13).color("#999"));
  });
}
`,
  },
];
