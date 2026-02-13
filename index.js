import { jsxs as c, Fragment as ee, jsx as r } from "react/jsx-runtime";
import { useState as h, useMemo as J, useCallback as x, useEffect as oe, useRef as V } from "react";
import { useSettings as te, useSettingsActions as re, useViewport as ne, useSystemActions as le } from "@mywallpaper/sdk-react";
const Y = [
  { value: "spotify", label: "Spotify", emoji: "🎵", protocol: "spotify://", iconUrl: "https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg" },
  { value: "discord", label: "Discord", emoji: "💬", protocol: "discord://", iconUrl: "https://assets-global.website-files.com/6257adef93867e50d84d30e2/6257d23c5fb25be7e0b6e220_Open%20Source%20Projects%20702702b9ac54dd3a999140.svg" },
  { value: "vscode", label: "VS Code", emoji: "💻", protocol: "vscode://", iconUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Visual_Studio_Code_1.35_icon.svg" },
  { value: "slack", label: "Slack", emoji: "📢", protocol: "slack://", iconUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg" },
  { value: "telegram", label: "Telegram", emoji: "✈️", protocol: "tg://", iconUrl: "https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" },
  { value: "steam", label: "Steam", emoji: "🎮", protocol: "steam://", iconUrl: "https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg" },
  { value: "chrome", label: "Chrome", emoji: "🌐", protocol: "googlechrome://", iconUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg" },
  { value: "firefox", label: "Firefox", emoji: "🦊", protocol: "firefox://" },
  { value: "figma", label: "Figma", emoji: "🎨", protocol: "figma://", iconUrl: "https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg" },
  { value: "notion", label: "Notion", emoji: "📝", protocol: "notion://", iconUrl: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" },
  { value: "obs", label: "OBS Studio", emoji: "🎥", protocol: "obsproject://" },
  { value: "terminal", label: "Terminal", emoji: "⬛", protocol: "x-terminal-emulator://" }
];
function X() {
  return Math.random().toString(36).slice(2, 10);
}
function ae(e, d) {
  const y = parseInt(e.slice(1, 3), 16), a = parseInt(e.slice(3, 5), 16), p = parseInt(e.slice(5, 7), 16);
  return `rgba(${y}, ${a}, ${p}, ${d})`;
}
function q(e, d) {
  const y = new Set(e.map((a) => `${a.col},${a.row}`));
  for (let a = 0; a < 100; a++)
    for (let p = 0; p < d; p++)
      if (!y.has(`${p},${a}`)) return { col: p, row: a };
  return { col: 0, row: e.length };
}
function ie({ editIcon: e, onSave: d, onClose: y }) {
  const [a, p] = h(e ? "custom" : "preset"), [j, l] = h((e == null ? void 0 : e.label) ?? ""), [v, g] = h((e == null ? void 0 : e.execPath) ?? ""), [D, E] = h((e == null ? void 0 : e.actionType) ?? "auto"), [M, U] = h((e == null ? void 0 : e.iconEmoji) ?? "🚀"), [_, T] = h((e == null ? void 0 : e.iconUrl) ?? ""), [w, z] = h(""), S = (t) => {
    const P = Y.find((L) => L.value === t);
    P && (z(t), l(P.label), g(P.protocol), E("protocol"), U(P.emoji), T(P.iconUrl ?? ""));
  }, k = () => {
    !j.trim() && !v.trim() || d({
      id: e == null ? void 0 : e.id,
      label: j.trim() || "Shortcut",
      execPath: v.trim(),
      actionType: D,
      iconEmoji: M || "🚀",
      iconUrl: _ || void 0,
      iconBase64: e == null ? void 0 : e.iconBase64
    });
  }, C = {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }, m = {
    background: "rgba(30,30,40,0.95)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 24,
    width: 360,
    maxHeight: "80vh",
    overflowY: "auto",
    color: "#fff",
    fontFamily: "system-ui, sans-serif"
  }, i = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    fontSize: 13,
    outline: "none",
    marginTop: 4
  }, R = {
    padding: "8px 20px",
    borderRadius: 8,
    border: "none",
    background: "#7c3aed",
    color: "#fff",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600
  }, A = {
    padding: "8px 20px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "transparent",
    color: "#aaa",
    cursor: "pointer",
    fontSize: 13
  };
  return /* @__PURE__ */ r("div", { style: C, onClick: y, children: /* @__PURE__ */ c("div", { style: m, onClick: (t) => t.stopPropagation(), children: [
    /* @__PURE__ */ r("h3", { style: { margin: "0 0 16px", fontSize: 16, fontWeight: 600 }, children: e ? "Edit Shortcut" : "Add Shortcut" }),
    !e && /* @__PURE__ */ r("div", { style: { display: "flex", gap: 8, marginBottom: 16 }, children: ["preset", "custom"].map((t) => /* @__PURE__ */ r(
      "button",
      {
        onClick: () => p(t),
        style: {
          flex: 1,
          padding: "6px 0",
          borderRadius: 8,
          border: "none",
          background: a === t ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.06)",
          color: a === t ? "#c4b5fd" : "#888",
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 500
        },
        children: t === "preset" ? "App Preset" : "Custom"
      },
      t
    )) }),
    a === "preset" && !e && /* @__PURE__ */ r("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }, children: Y.map((t) => /* @__PURE__ */ c(
      "button",
      {
        onClick: () => S(t.value),
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          padding: 8,
          borderRadius: 10,
          border: "none",
          cursor: "pointer",
          background: w === t.value ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.05)",
          color: "#fff",
          fontSize: 11
        },
        children: [
          /* @__PURE__ */ r("span", { style: { fontSize: 24 }, children: t.emoji }),
          /* @__PURE__ */ r("span", { style: { opacity: 0.7 }, children: t.label })
        ]
      },
      t.value
    )) }),
    (a === "custom" || e) && /* @__PURE__ */ c("div", { style: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }, children: [
      /* @__PURE__ */ c("label", { style: { fontSize: 12, color: "#aaa" }, children: [
        "Label",
        /* @__PURE__ */ r("input", { style: i, value: j, onChange: (t) => l(t.target.value), placeholder: "My App" })
      ] }),
      /* @__PURE__ */ c("label", { style: { fontSize: 12, color: "#aaa" }, children: [
        "Path / URL / Protocol",
        /* @__PURE__ */ r("input", { style: i, value: v, onChange: (t) => g(t.target.value), placeholder: "https://... or /path/to/file or spotify://" })
      ] }),
      /* @__PURE__ */ c("label", { style: { fontSize: 12, color: "#aaa" }, children: [
        "Type",
        /* @__PURE__ */ c(
          "select",
          {
            style: { ...i, appearance: "auto" },
            value: D,
            onChange: (t) => E(t.target.value),
            children: [
              /* @__PURE__ */ r("option", { value: "auto", children: "Auto-detect" }),
              /* @__PURE__ */ r("option", { value: "url", children: "URL" }),
              /* @__PURE__ */ r("option", { value: "file", children: "File" }),
              /* @__PURE__ */ r("option", { value: "folder", children: "Folder" }),
              /* @__PURE__ */ r("option", { value: "protocol", children: "Protocol" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ c("label", { style: { fontSize: 12, color: "#aaa" }, children: [
        "Icon Emoji",
        /* @__PURE__ */ r("input", { style: i, value: M, onChange: (t) => U(t.target.value), placeholder: "\\u{1F680}" })
      ] }),
      /* @__PURE__ */ c("label", { style: { fontSize: 12, color: "#aaa" }, children: [
        "Icon Image URL (optional)",
        /* @__PURE__ */ r("input", { style: i, value: _, onChange: (t) => T(t.target.value), placeholder: "https://..." })
      ] })
    ] }),
    /* @__PURE__ */ c("div", { style: { display: "flex", gap: 8, justifyContent: "flex-end" }, children: [
      /* @__PURE__ */ r("button", { style: A, onClick: y, children: "Cancel" }),
      /* @__PURE__ */ r("button", { style: R, onClick: k, children: e ? "Save" : "Add" })
    ] })
  ] }) });
}
function se({
  icon: e,
  iconSize: d,
  showLabel: y,
  labelSize: a,
  labelColor: p,
  enableGlow: j,
  glowColor: l,
  gridSpacing: v,
  onLaunch: g,
  onEdit: D,
  onDelete: E,
  onDragStart: M,
  onDragOver: U,
  onDragEnd: _
}) {
  const [T, w] = h(!1), [z, S] = h(!1), k = V(null), [C, m] = h(!1), i = V(!1), R = () => {
    i.current = !1, k.current = setTimeout(() => {
      i.current = !0, m(!0);
    }, 500);
  }, A = () => {
    k.current && (clearTimeout(k.current), k.current = null), !i.current && !C && (S(!0), setTimeout(() => S(!1), 200), g(e));
  }, t = () => {
    w(!1), k.current && (clearTimeout(k.current), k.current = null);
  }, P = J(() => {
    const n = { width: d, height: d, objectFit: "contain", borderRadius: 8 };
    return e.iconBase64 ? /* @__PURE__ */ r("img", { style: n, src: `data:image/png;base64,${e.iconBase64}`, alt: "", draggable: !1 }) : e.iconUrl ? /* @__PURE__ */ r("img", { style: n, src: e.iconUrl, alt: "", draggable: !1 }) : /* @__PURE__ */ r("span", { style: { fontSize: d * 0.7, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", width: d, height: d }, children: e.iconEmoji || "🚀" });
  }, [e.iconBase64, e.iconUrl, e.iconEmoji, d]), L = {
    position: "absolute",
    left: e.col * v,
    top: e.row * v,
    width: v,
    height: v,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    cursor: "pointer",
    userSelect: "none",
    transition: "transform 0.15s ease, filter 0.15s ease",
    transform: z ? "scale(0.92)" : T ? "scale(1.08)" : "scale(1)",
    filter: T && j ? `drop-shadow(0 0 8px ${ae(l, 0.6)})` : "none",
    zIndex: C ? 100 : 1
  }, $ = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "rgba(30,30,40,0.95)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 10,
    padding: "6px 0",
    zIndex: 200,
    minWidth: 120,
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
  }, F = {
    display: "block",
    width: "100%",
    padding: "6px 16px",
    border: "none",
    background: "transparent",
    color: "#fff",
    fontSize: 12,
    cursor: "pointer",
    textAlign: "left"
  };
  return /* @__PURE__ */ c(
    "div",
    {
      style: L,
      draggable: !0,
      onDragStart: (n) => {
        n.dataTransfer.setData("text/plain", e.id), M(e.id);
      },
      onDragEnd: _,
      onPointerDown: R,
      onPointerUp: A,
      onPointerEnter: () => w(!0),
      onPointerLeave: t,
      children: [
        /* @__PURE__ */ r("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }, children: P }),
        y && /* @__PURE__ */ r("div", { style: {
          fontSize: a,
          color: p,
          textAlign: "center",
          textShadow: "0 1px 4px rgba(0,0,0,0.7)",
          lineHeight: 1.2,
          maxWidth: v - 8,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontFamily: "system-ui, sans-serif"
        }, children: e.label }),
        C && /* @__PURE__ */ c("div", { style: $, onClick: (n) => n.stopPropagation(), children: [
          /* @__PURE__ */ c(
            "button",
            {
              style: F,
              onPointerDown: (n) => n.stopPropagation(),
              onClick: () => {
                m(!1), D(e);
              },
              onMouseEnter: (n) => n.currentTarget.style.background = "rgba(255,255,255,0.08)",
              onMouseLeave: (n) => n.currentTarget.style.background = "transparent",
              children: [
                "✏️",
                " Edit"
              ]
            }
          ),
          /* @__PURE__ */ c(
            "button",
            {
              style: { ...F, color: "#f87171" },
              onPointerDown: (n) => n.stopPropagation(),
              onClick: () => {
                m(!1), E(e.id);
              },
              onMouseEnter: (n) => n.currentTarget.style.background = "rgba(255,255,255,0.08)",
              onMouseLeave: (n) => n.currentTarget.style.background = "transparent",
              children: [
                "🗑️",
                " Delete"
              ]
            }
          ),
          /* @__PURE__ */ r(
            "button",
            {
              style: F,
              onPointerDown: (n) => n.stopPropagation(),
              onClick: () => m(!1),
              onMouseEnter: (n) => n.currentTarget.style.background = "rgba(255,255,255,0.08)",
              onMouseLeave: (n) => n.currentTarget.style.background = "transparent",
              children: "Cancel"
            }
          )
        ] })
      ]
    }
  );
}
function ge() {
  const e = te(), { setValue: d, onButtonClick: y } = re(), a = ne(), { openPath: p, getDesktopIcons: j } = le(), l = e.icons ?? [], v = e.iconSize ?? 48, g = e.gridSpacing ?? 90, D = e.showLabels ?? !0, E = e.labelSize ?? 11, M = e.labelColor ?? "#ffffff", U = e.enableGlow ?? !0, _ = e.glowColor ?? "#8b5cf6", [T, w] = h(!1), [z, S] = h(null), [k, C] = h(null), m = J(() => !a.width || g <= 0 ? 8 : Math.max(1, Math.floor(a.width / g)), [a.width, g]), i = x((o) => {
    d("icons", o);
  }, [d]);
  oe(() => {
    y("addShortcut", () => {
      w(!0);
    }), y("importDesktopIcons", () => {
      R();
    });
  }, []);
  const R = x(async () => {
    try {
      const o = await j();
      Array.isArray(o) && o.length > 0 ? A(o) : console.warn("[Shortcuts] No desktop icons found");
    } catch (o) {
      console.error("[Shortcuts] Failed to import desktop icons:", o);
    }
  }, [l, m, j]), A = x((o) => {
    const s = new Set(l.map((b) => b.execPath)), f = [];
    let B = { col: 0, row: 0 };
    const H = [...l];
    for (const b of o)
      s.has(b.exec_path) || (B = q([...H, ...f], m), f.push({
        id: X(),
        label: b.name,
        execPath: b.exec_path,
        actionType: b.is_directory ? "folder" : "file",
        iconBase64: b.icon_base64 || void 0,
        iconEmoji: b.is_directory ? "📁" : "📄",
        col: B.col,
        row: B.row
      }));
    f.length > 0 && i([...l, ...f]);
  }, [l, m, i]), t = x((o) => {
    if (o.id) {
      const s = l.map((f) => f.id === o.id ? { ...f, ...o } : f);
      i(s);
    } else {
      const s = q(l, m), f = {
        ...o,
        id: X(),
        col: s.col,
        row: s.row
      };
      i([...l, f]);
    }
    w(!1), S(null);
  }, [l, m, i]), P = x((o) => {
    i(l.filter((s) => s.id !== o));
  }, [l, i]), L = x(async (o) => {
    if (o.execPath)
      try {
        await p(o.execPath, o.actionType === "auto" ? void 0 : o.actionType);
      } catch (s) {
        console.error("[Shortcuts] Launch failed:", s);
      }
  }, [p]), $ = x((o) => {
    S(o), w(!0);
  }, []), F = x((o) => {
    C(o);
  }, []), n = x(() => {
    C(null);
  }, []), K = x((o) => {
    o.preventDefault();
    const s = o.dataTransfer.getData("text/plain");
    if (!s) return;
    const f = o.currentTarget.getBoundingClientRect(), B = o.clientX - f.left, H = o.clientY - f.top, b = Math.max(0, Math.floor(B / g)), O = Math.max(0, Math.floor(H / g)), N = l.find((u) => u.col === b && u.row === O && u.id !== s), W = l.find((u) => u.id === s);
    if (!W) return;
    let G;
    N ? G = l.map((u) => u.id === s ? { ...u, col: b, row: O } : u.id === N.id ? { ...u, col: W.col, row: W.row } : u) : G = l.map((u) => u.id === s ? { ...u, col: b, row: O } : u), i(G), C(null);
  }, [l, g, i]), Q = x(() => {
    S(null), w(!0);
  }, []), Z = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #root { width: 100%; height: 100%; overflow: hidden; background: transparent; }
  `, I = (l.reduce((o, s) => Math.max(o, s.row), 0) + 2) * g;
  return /* @__PURE__ */ c(ee, { children: [
    /* @__PURE__ */ r("style", { children: Z }),
    /* @__PURE__ */ c(
      "div",
      {
        style: {
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "auto",
          padding: 8
        },
        onDragOver: (o) => o.preventDefault(),
        onDrop: K,
        children: [
          /* @__PURE__ */ r("div", { style: { position: "relative", minHeight: I }, children: l.map((o) => /* @__PURE__ */ r(
            se,
            {
              icon: o,
              iconSize: v,
              showLabel: D,
              labelSize: E,
              labelColor: M,
              enableGlow: U,
              glowColor: _,
              gridSpacing: g,
              onLaunch: L,
              onEdit: $,
              onDelete: P,
              onDragStart: F,
              onDragOver: () => {
              },
              onDragEnd: n
            },
            o.id
          )) }),
          /* @__PURE__ */ r(
            "button",
            {
              onClick: Q,
              style: {
                position: "fixed",
                bottom: 20,
                right: 20,
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(124,58,237,0.5)",
                backdropFilter: "blur(12px)",
                color: "#fff",
                fontSize: 24,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.15s ease, background 0.15s ease",
                zIndex: 50,
                boxShadow: "0 4px 16px rgba(0,0,0,0.3)"
              },
              onMouseEnter: (o) => {
                o.currentTarget.style.transform = "scale(1.1)", o.currentTarget.style.background = "rgba(124,58,237,0.7)";
              },
              onMouseLeave: (o) => {
                o.currentTarget.style.transform = "scale(1)", o.currentTarget.style.background = "rgba(124,58,237,0.5)";
              },
              children: "+"
            }
          )
        ]
      }
    ),
    T && /* @__PURE__ */ r(
      ie,
      {
        editIcon: z,
        onSave: t,
        onClose: () => {
          w(!1), S(null);
        }
      }
    )
  ] });
}
export {
  ge as default
};
