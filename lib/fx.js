/* A tiny pub/sub so any component can fire confetti without prop drilling. */

let handler = null;

export function registerBurst(fn) {
  handler = fn;
  return () => {
    if (handler === fn) handler = null;
  };
}

export function burst(n = 40) {
  if (handler) handler(n);
}

/* Palette per page. Index matches the page index in page.js. */
export const THEMES = [
  { g: "#fff4f6", i: "#4c2b4e", s: "#7a5a78", a: "#e4648a", b: ["#ffb3c9", "#c9b2ff", "#a9dcff", "#ffd9a0"] },
  { g: "#fff2f4", i: "#4c2b4e", s: "#7a5a78", a: "#e4648a", b: ["#ffb0c6", "#ffd59e", "#e0b8ff", "#ffc9dd"] },
  { g: "#f7f1ff", i: "#452a57", s: "#6f5880", a: "#9a62d6", b: ["#d8bcff", "#ffc2da", "#bcd4ff", "#ffe1b8"] },
  { g: "#fff3ec", i: "#56304a", s: "#7f5a6e", a: "#e87b5c", b: ["#ffc4a3", "#ffb6ce", "#ffe0a8", "#e4c3ff"] },
  { g: "#fffaf0", i: "#55401c", s: "#80663c", a: "#c98a2a", b: ["#ffe8b8", "#ffd6c2", "#f0e2c0", "#e8d0f0"] },
  { g: "#f1f3ff", i: "#363b63", s: "#5f648e", a: "#6a74d6", b: ["#b9c4ff", "#d4bcff", "#a9e0f5", "#ffd1e4"] },
  { g: "#eef5f6", i: "#2f4a52", s: "#5a757c", a: "#4e8795", b: ["#aacfd6", "#c8d9c0", "#b8c7e8", "#e8d5c2"] },
  { g: "#eefaf3", i: "#2d4f45", s: "#56786c", a: "#3f9d78", b: ["#aee5c8", "#a9dcff", "#d9f2b8", "#ffe6c0"] },
  { g: "#fff7ea", i: "#59401f", s: "#85683f", a: "#d79428", b: ["#ffdf9e", "#ffc9a3", "#ffe9c2", "#f4d3ff"] },
  { g: "#eff6ff", i: "#2f4463", s: "#5a7191", a: "#4a86c8", b: ["#a9d2ff", "#d2c2ff", "#bfeaff", "#ffd4e8"] },
  { g: "#fff0f7", i: "#4f2a4c", s: "#7d587a", a: "#e0589f", b: ["#ffb8dc", "#b8f0d8", "#ffd9a8", "#d4c0ff"] },
  { g: "#fff6f0", i: "#4d2f3c", s: "#7b5b67", a: "#d4677e", b: ["#ffd2bd", "#ffc2d8", "#f0dcb8", "#dcc8f0"] },
  { g: "#f6f2ea", i: "#4a3f2e", s: "#75684f", a: "#b08840", b: ["#ecdcc0", "#ffd8c8", "#e0dcc8", "#dcd0e8"] },
  { g: "#1d1736", i: "#f6ecff", s: "#c2b2d8", a: "#f0b45e", b: ["#50386f", "#6e4765", "#3a4780", "#7d6038"] },
  { g: "#fff4f8", i: "#4c2b4e", s: "#7a5a78", a: "#e4648a", b: ["#ffc2d8", "#d8c2ff", "#c2e8ff", "#ffe0bd"] },
];

export const DARK_PAGE = 13;

export function paint(index) {
  const t = THEMES[index] || THEMES[0];
  const dark = index === DARK_PAGE;
  const r = document.documentElement;
  r.style.setProperty("--ground", t.g);
  r.style.setProperty("--ink", t.i);
  r.style.setProperty("--ink-soft", t.s);
  r.style.setProperty("--accent", t.a);
  t.b.forEach((c, k) => r.style.setProperty("--b" + (k + 1), c));
  r.style.setProperty("--card", dark ? "rgba(255,255,255,.09)" : "rgba(255,255,255,.62)");
  r.style.setProperty("--card-line", dark ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.85)");
  /* The paper grain and the white inner rim both assume a pale surface;
     over the night sky they show up as banding, so the stylesheet turns
     them off from here. */
  r.classList.toggle("nightfall", dark);
}
