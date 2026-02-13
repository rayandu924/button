import { jsx as r, jsxs as U, Fragment as ce } from "react/jsx-runtime";
import { useState as g, useEffect as E, useMemo as b, useCallback as O } from "react";
import { useSettings as se, useViewport as ae, useFiles as de, useSystemActions as ue } from "@mywallpaper/sdk-react";
const pe = {
  spotify: {
    protocol: "spotify://",
    emoji: "🎵",
    label: "Spotify",
    icon: "https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg"
  },
  discord: {
    protocol: "discord://",
    emoji: "💬",
    label: "Discord",
    icon: "https://assets-global.website-files.com/6257adef93867e50d84d30e2/6257d23c5fb25be7e0b6e220_Open%20Source%20Projects%20702702b9ac54dd3a999140.svg"
  },
  vscode: {
    protocol: "vscode://",
    emoji: "💻",
    label: "VS Code",
    icon: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Visual_Studio_Code_1.35_icon.svg"
  },
  slack: {
    protocol: "slack://",
    emoji: "📢",
    label: "Slack",
    icon: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg"
  },
  telegram: {
    protocol: "tg://",
    emoji: "✈️",
    label: "Telegram",
    icon: "https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg"
  },
  steam: {
    protocol: "steam://",
    emoji: "🎮",
    label: "Steam",
    icon: "https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg"
  },
  obs: {
    protocol: "obsproject://",
    emoji: "🎥",
    label: "OBS Studio",
    icon: "https://upload.wikimedia.org/wikipedia/commons/1/14/Open_Broadcaster_Software_Logo.png"
  },
  figma: {
    protocol: "figma://",
    emoji: "🎨",
    label: "Figma",
    icon: "https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg"
  },
  notion: {
    protocol: "notion://",
    emoji: "📝",
    label: "Notion",
    icon: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png"
  },
  chrome: {
    protocol: "googlechrome://",
    emoji: "🌐",
    label: "Chrome",
    icon: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg"
  },
  firefox: {
    protocol: "firefox://",
    emoji: "🦊",
    label: "Firefox",
    icon: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Firefox_logo%2C_2019.svg"
  },
  terminal: {
    protocol: "x-terminal-emulator://",
    emoji: "⬛",
    label: "Terminal",
    icon: null
  }
};
function h(e, l) {
  const u = parseInt(e.slice(1, 3), 16), s = parseInt(e.slice(3, 5), 16), p = parseInt(e.slice(5, 7), 16);
  return `rgba(${u}, ${s}, ${p}, ${l})`;
}
function be() {
  const e = se();
  ae();
  const l = de(), { openPath: u } = ue(), [s, p] = g(null), [x, j] = g(null), [B, v] = g(!1), [D, m] = g(!1), i = e.actionMode ?? "preset", H = e.appPreset ?? "spotify", f = e.targetUrl ?? "https://github.com", a = e.targetFile ?? null, F = e.targetFolder ?? "", C = e.targetProtocol ?? "", c = e.iconSource ?? "auto", _ = e.iconEmoji ?? "🚀", w = e.iconUrl ?? "", y = e.iconFile ?? null, n = e.iconSize ?? 48, L = e.showLabel ?? !0, $ = e.labelMode ?? "auto", z = e.labelCustom ?? "", M = e.labelSize ?? 14, W = e.labelColor ?? "#ffffff", N = e.tileColor ?? "#ffffff", G = e.tileOpacity ?? 10, T = e.blurAmount ?? 12, V = e.borderRadius ?? 16, q = e.borderWidth ?? 1, K = e.borderColor ?? "#ffffff", J = e.borderOpacity ?? 20, R = e.enableGlow ?? !0, A = e.glowColor ?? "#8b5cf6", I = e.glowIntensity ?? 10, Q = e.hoverScale ?? 1.08, X = e.clickScale ?? 0.95, t = i === "preset" ? pe[H] ?? null : null;
  E(() => {
    c === "file" && y && l.isFileReference(y) ? l.request("iconFile").then((o) => {
      o && p(o);
    }) : p(null);
  }, [c, y, l]), E(() => {
    i === "file" && a && l.isFileReference(a) ? l.request("targetFile").then((o) => {
      o && j(o);
    }) : j(null);
  }, [i, a, l]);
  const S = b(() => {
    switch (i) {
      case "preset":
        return t ? t.protocol : "";
      case "url":
        return f;
      case "file":
        return x ?? a ?? "";
      case "folder":
        return F;
      case "custom":
        return C;
      default:
        return "";
    }
  }, [i, t, f, x, a, F, C]), P = b(() => {
    switch (i) {
      case "preset":
      case "custom":
        return "protocol";
      case "url":
        return "url";
      case "file":
        return "file";
      case "folder":
        return "folder";
      default:
        return "auto";
    }
  }, [i]), k = O(async () => {
    if (!S) {
      console.warn("[ShortcutTile] No target configured"), m(!0), setTimeout(() => m(!1), 2e3);
      return;
    }
    v(!0), setTimeout(() => v(!1), 300);
    try {
      await u(S, P);
    } catch (o) {
      console.error("[ShortcutTile] Error:", o), m(!0), setTimeout(() => m(!1), 2e3);
    }
  }, [S, P, u]), Y = O(
    (o) => {
      (o.key === "Enter" || o.key === " ") && (o.preventDefault(), k());
    },
    [k]
  ), Z = b(() => {
    const o = { width: n, height: n };
    if (c === "auto" && t)
      return t.icon ? /* @__PURE__ */ r("img", { style: { ...o, objectFit: "contain" }, src: t.icon, alt: "" }) : /* @__PURE__ */ r("span", { style: { fontSize: n, lineHeight: 1, textAlign: "center" }, children: t.emoji });
    switch (c) {
      case "auto":
      case "emoji": {
        const ne = c === "auto" && t ? t.emoji : _;
        return /* @__PURE__ */ r("span", { style: { fontSize: n, lineHeight: 1, textAlign: "center" }, children: ne || "🚀" });
      }
      case "url":
        return w ? /* @__PURE__ */ r("img", { style: { ...o, objectFit: "contain" }, src: w, alt: "" }) : /* @__PURE__ */ r("span", { style: { fontSize: n, lineHeight: 1, textAlign: "center" }, children: "🚀" });
      case "file":
        return s ? /* @__PURE__ */ r("img", { style: { ...o, objectFit: "contain" }, src: s, alt: "" }) : /* @__PURE__ */ r("span", { style: { fontSize: n, lineHeight: 1, textAlign: "center" }, children: "🚀" });
      default:
        return /* @__PURE__ */ r("span", { style: { fontSize: n, lineHeight: 1, textAlign: "center" }, children: "🚀" });
    }
  }, [c, t, n, _, w, s]), ee = b(() => {
    if ($ === "auto") {
      if (t) return t.label;
      if (i === "url")
        try {
          return new URL(f).hostname;
        } catch {
          return "URL";
        }
      return i === "file" ? "Fichier" : i === "folder" ? "Dossier" : "Raccourci";
    }
    return z || "Raccourci";
  }, [$, t, i, f, z]), oe = h(A, 0.5), te = h(A, 0.7), ie = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    width: "100%",
    height: "100%",
    cursor: "pointer",
    userSelect: "none",
    background: h(N, G / 100),
    backdropFilter: `blur(${T}px)`,
    WebkitBackdropFilter: `blur(${T}px)`,
    border: `${q}px solid ${h(K, J / 100)}`,
    borderRadius: V,
    boxShadow: R ? `0 0 ${I}px ${oe}` : void 0,
    borderColor: D ? "rgba(239, 68, 68, 0.5)" : void 0
  }, re = {
    display: L ? "block" : "none",
    fontWeight: 500,
    fontSize: M,
    color: W,
    textAlign: "center",
    textShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%"
  }, d = "shortcut-tile", le = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #root { width: 100%; height: 100%; overflow: hidden; background: transparent; }

    #${d} {
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                  box-shadow 0.2s ease,
                  background-color 0.2s ease;
    }

    #${d}:hover {
      transform: scale(${Q});
      ${R ? `box-shadow: 0 0 ${I * 1.5}px ${te};` : ""}
    }

    #${d}:active {
      transform: scale(${X});
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.7; }
      100% { opacity: 1; }
    }

    #${d}.clicked {
      animation: pulse 0.3s ease;
    }
  `;
  return /* @__PURE__ */ U(ce, { children: [
    /* @__PURE__ */ r("style", { children: le }),
    /* @__PURE__ */ U(
      "div",
      {
        id: d,
        className: B ? "clicked" : void 0,
        style: ie,
        tabIndex: 0,
        role: "button",
        onClick: k,
        onKeyDown: Y,
        children: [
          /* @__PURE__ */ r("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }, children: Z }),
          /* @__PURE__ */ r("div", { style: re, children: ee })
        ]
      }
    )
  ] });
}
export {
  be as default
};
