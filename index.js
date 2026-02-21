import { jsxs as R, Fragment as Q, jsx as i } from "react/jsx-runtime";
import { useState as a, useRef as V, useEffect as k, useCallback as B } from "react";
import { useSettings as X, useSystemActions as Y, useFiles as Z } from "@mywallpaper/sdk-react";
function ee(e, f) {
  const d = parseInt(e.slice(1, 3), 16), u = parseInt(e.slice(3, 5), 16), o = parseInt(e.slice(5, 7), 16);
  return `rgba(${d}, ${u}, ${o}, ${f})`;
}
function le() {
  const e = X(), { openPath: f } = Y(), { request: d, isFileReference: u } = Z(), [o, S] = a(!1), [E, I] = a(!1), [$, j] = a(null), [F, h] = a(null), H = V(null), P = e.label ?? "My Button", b = e.actionType ?? "url", w = {
    url: e.execUrl ?? "",
    file: e.execFile ?? "",
    folder: e.execFolder ?? "",
    protocol: e.execProtocol ?? ""
  }[b] ?? "", T = e.iconEmoji ?? "🚀", s = e.iconSourceType ?? "emoji", z = e.iconUrl ?? "", c = e.size ?? 48, G = (e.hoverScale ?? 108) / 100, M = e.enableGlow ?? !0, A = e.glowColor ?? "#8b5cf6", L = e.glowIntensity ?? 10, l = e.gifPlayOnHover ?? !1, O = s === "url" ? e.borderRadiusUrl ?? 8 : s === "upload" ? e.borderRadiusUpload ?? 8 : 0;
  k(() => {
    s === "upload" && u(e.iconImage) && d("iconImage").then((t) => {
      t && j(t);
    });
  }, [s, e.iconImage, d, u]);
  const n = s === "upload" ? $ : s === "url" ? z : null, [g, v] = a(!1);
  k(() => {
    if (!n) {
      v(!1), h(null);
      return;
    }
    let t = !1;
    return fetch(n).then((m) => m.blob()).then(async (m) => {
      if (t) return;
      const p = new Uint8Array(await m.slice(0, 6).arrayBuffer()), U = p[0] === 71 && p[1] === 73 && p[2] === 70 && p[3] === 56;
      if (v(U), U && l) {
        const y = await createImageBitmap(m);
        if (t) return;
        const x = document.createElement("canvas");
        x.width = y.width, x.height = y.height;
        const C = x.getContext("2d");
        C && (C.drawImage(y, 0, 0), h(x.toDataURL("image/png"))), y.close();
      } else
        h(null);
    }).catch(() => {
      v(!1), h(null);
    }), () => {
      t = !0;
    };
  }, [n, l]);
  const q = B(async () => {
    if (w) {
      I(!0), setTimeout(() => I(!1), 200);
      try {
        await f(w, b);
      } catch (t) {
        console.error("[Button] Launch failed:", t);
      }
    }
  }, [w, b, f]), [D, K] = a(0), W = B(() => {
    S(!0), l && g && K((t) => t + 1);
  }, [l, g]);
  let r;
  l && g && !o && F ? r = F : l && g && o && n ? r = n + (n.includes("?") ? "&" : "?") + "_r=" + D : r = n;
  const _ = r ? /* @__PURE__ */ i(
    "img",
    {
      src: r,
      alt: "",
      draggable: !1,
      style: { maxWidth: c, maxHeight: c, borderRadius: O, display: "block" }
    }
  ) : /* @__PURE__ */ i("span", { style: { fontSize: c * 0.7, lineHeight: 1 }, children: T || "🚀" }), J = E ? "scale(0.92)" : o ? `scale(${G})` : "scale(1)", N = o && M ? `drop-shadow(0 0 ${L}px ${ee(A, 0.6)})` : "none";
  return /* @__PURE__ */ R(Q, { children: [
    /* @__PURE__ */ i("style", { children: `* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #root { width: 100%; height: 100%; overflow: hidden; background: transparent; }` }),
    /* @__PURE__ */ i(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        },
        children: /* @__PURE__ */ R(
          "div",
          {
            onClick: q,
            onPointerEnter: W,
            onPointerLeave: () => S(!1),
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
              userSelect: "none",
              transition: "transform 0.15s ease, filter 0.15s ease",
              transform: J,
              filter: N
            },
            children: [
              _,
              P && /* @__PURE__ */ i(
                "span",
                {
                  style: {
                    fontSize: Math.max(11, c * 0.25),
                    color: "#fff",
                    textShadow: "0 1px 4px rgba(0,0,0,0.7)",
                    fontFamily: "system-ui, sans-serif",
                    textAlign: "center",
                    lineHeight: 1.2,
                    maxWidth: c * 2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  },
                  children: P
                }
              )
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ i("canvas", { ref: H, style: { display: "none" } })
  ] });
}
export {
  le as default
};
