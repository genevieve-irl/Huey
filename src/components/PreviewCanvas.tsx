import React, { useEffect, useRef, useState } from "react";
import { PaletteVariant, ColorMapping } from "../types";
import { Download, Monitor, Tablet, Smartphone, Shuffle, ExternalLink, Menu } from "lucide-react";

interface PreviewCanvasProps {
  html: string;
  detectedFonts: string[];
  variants: PaletteVariant[];
  activeVariantId: string;
  onSelectVariant: (id: string) => void;
  onOpenExport: () => void;
  onGenerateMore: () => void;
  isGeneratingMore: boolean;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

const getHeroColor = (vars: ColorMapping): string => {
  const candidateKeys = [
    "--btn-primary",
    "--accent-color",
    "--primary",
    "--accent",
    "--hero-bg",
    "--badge-blue",
    "--badge-purple",
    "--accent-green",
    "--surface-1"
  ];
  for (const key of candidateKeys) {
    if (vars[key]) {
      const val = vars[key].toLowerCase().trim();
      if (val !== "#ffffff" && val !== "#faf9f6" && val !== "#f8fafc" && val !== "#f5f5f4") {
        return vars[key];
      }
    }
  }
  for (const [key, val] of Object.entries(vars)) {
    if (key !== "--bg-base" && key !== "--text-primary" && key !== "--text-inverse") {
      const v = val.toLowerCase().trim();
      if (v.startsWith("#") && v !== "#ffffff" && v !== "#faf9f6" && v !== "#f8fafc") {
        return val;
      }
    }
  }
  return vars["--surface-1"] || vars["--text-primary"] || "#3b82f6";
};

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  html,
  detectedFonts,
  variants,
  activeVariantId,
  onSelectVariant,
  onOpenExport,
  onGenerateMore,
  isGeneratingMore,
  isSidebarCollapsed,
  onToggleSidebar,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const activeVariant = variants.find((v) => v.id === activeVariantId) || variants[0];
  const activeVariables: ColorMapping = activeVariant?.variables || {};

  // Build iframe initial document content
  const buildIframeDoc = () => {
    const fontsList = (detectedFonts || ["Inter", "DM Sans"])
      .map((font) => (font === "Newsreader" ? "DM Sans" : font));
    const fontsLink = fontsList.filter((f, index) => fontsList.indexOf(f) === index)
      .map((font) => font.trim().replace(/\s+/g, "+") + ":wght@300;400;500;600;700")
      .join("&family=");

    const cssTokens = Object.entries(activeVariables)
      .map(([key, val]) => `${key.trim().startsWith("--") ? key.trim() : "--" + key.trim().replace(/^-+/, "")}: ${val};`)
      .join("\n      ");

    return `<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${activeVariant?.name || "Huey Preview"}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
            serif: ['"DM Sans"', 'system-ui', 'sans-serif'],
          }
        }
      }
    }
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${fontsLink}&display=swap" rel="stylesheet">
  <style id="dynamic-theme-tokens">
    :root {
      ${cssTokens}
    }
    * {
      transition: background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1), 
                  color 0.35s cubic-bezier(0.4, 0, 0.2, 1), 
                  border-color 0.35s cubic-bezier(0.4, 0, 0.2, 1), 
                  box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    html {
      zoom: 0.8;
    }
    body {
      margin: 0;
      padding: 0;
      min-height: 100vh;
      background-color: var(--bg-base, #faf9f6);
      color: var(--text-primary, #1c1917);
      font-family: 'Inter', system-ui, sans-serif;
    }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: var(--surface-1, #f1f5f9); }
    ::-webkit-scrollbar-thumb { background: var(--border-accent, #cbd5e1); border-radius: 3px; }
  </style>
</head>
<body class="h-full antialiased">
  <div id="app-root" class="min-h-full w-full">
    ${html}
  </div>
</body>
</html>`;
  };

  // Open preview in new tab
  const handleOpenInNewTab = () => {
    const docContent = buildIframeDoc();
    const blob = new Blob([docContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Write initial document to iframe when HTML changes
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(buildIframeDoc());
    doc.close();

    // Ensure root inline styles are populated immediately after write
    if (doc.documentElement) {
      Object.entries(activeVariables).forEach(([key, val]) => {
        const normKey = key.trim().startsWith("--") ? key.trim() : "--" + key.trim().replace(/^-+/, "");
        doc.documentElement.style.setProperty(normKey, String(val));
      });
    }
  }, [html, detectedFonts]);

  // Hot-swap CSS variables directly in iframe without reload!
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    // 1. Direct DOM root variable injection for guaranteed instant 0ms repaint
    if (doc.documentElement) {
      Object.entries(activeVariables).forEach(([key, val]) => {
        const normKey = key.trim().startsWith("--") ? key.trim() : "--" + key.trim().replace(/^-+/, "");
        doc.documentElement.style.setProperty(normKey, String(val));
      });
    }

    // 2. Also update <style> token definition for stylesheet completeness
    const styleEl = doc.getElementById("dynamic-theme-tokens");
    if (styleEl) {
      const cssTokens = Object.entries(activeVariables)
        .map(([key, val]) => `${key.trim().startsWith("--") ? key.trim() : "--" + key.trim().replace(/^-+/, "")}: ${val};`)
        .join("\n      ");
      styleEl.textContent = `
        :root {
          ${cssTokens}
        }
        * {
          transition: background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1), 
                      color 0.35s cubic-bezier(0.4, 0, 0.2, 1), 
                      border-color 0.35s cubic-bezier(0.4, 0, 0.2, 1), 
                      box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        html {
          zoom: 0.8;
        }
        body {
          margin: 0;
          padding: 0;
          min-height: 100vh;
          background-color: var(--bg-base, #faf9f6);
          color: var(--text-primary, #1c1917);
        }
      `;
    }
  }, [activeVariables]);

  const getViewportWidth = () => {
    switch (viewport) {
      case "mobile":
        return "max-w-[375px]";
      case "tablet":
        return "max-w-[768px]";
      default:
        return "w-full";
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-sm">
      {/* Top Minimal Toolbar */}
      <div className="px-4 py-2.5 bg-white border-b border-stone-200 flex items-center justify-between gap-3 shrink-0">
        {/* Left: Hamburger / Menu Chip for Token Inspector */}
        <button
          onClick={onToggleSidebar}
          title={isSidebarCollapsed ? "Show Token Inspector" : "Collapse Token Inspector"}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors shrink-0"
        >
          <Menu className="w-3.5 h-3.5" />
          <span>{isSidebarCollapsed ? "Show Tokens" : "Hide Tokens"}</span>
        </button>

        {/* Right: Viewport Toggles, Fullscreen & Export */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Viewport Selector */}
          <div className="hidden md:flex items-center bg-stone-100 p-1 rounded-full border border-stone-200 text-stone-600">
            <button
              onClick={() => setViewport("desktop")}
              title="Desktop Viewport"
              className={`p-1.5 rounded-full transition-colors ${viewport === "desktop" ? "bg-white text-stone-900 shadow-sm" : "hover:text-stone-900"}`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport("tablet")}
              title="Tablet Viewport (768px)"
              className={`p-1.5 rounded-full transition-colors ${viewport === "tablet" ? "bg-white text-stone-900 shadow-sm" : "hover:text-stone-900"}`}
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport("mobile")}
              title="Mobile Viewport (375px)"
              className={`p-1.5 rounded-full transition-colors ${viewport === "mobile" ? "bg-white text-stone-900 shadow-sm" : "hover:text-stone-900"}`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleOpenInNewTab}
            title="Open in Fullscreen (new browser tab)"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-xs transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fullscreen</span>
          </button>

          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Iframe Preview Wrapper with Minimal Padding */}
      <div className="flex-1 w-full bg-[#f8f9fa] flex items-center justify-center p-1 sm:p-2 overflow-y-auto relative">
        <div className={`w-full h-full min-h-[500px] transition-all duration-300 rounded-xl overflow-hidden border border-stone-200/60 bg-white shadow-sm relative ${getViewportWidth()}`}>
          <iframe
            ref={iframeRef}
            title="Huey Render Canvas"
            className="w-full h-full border-0 bg-transparent"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>

        {/* Floating Theme Chips over the bottom center of the render */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 max-w-[96%] flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-2 py-2 px-1 rounded-full bg-transparent backdrop-blur-md pointer-events-auto overflow-x-auto flex-nowrap max-w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {variants.map((variant) => {
              const isSelected = variant.id === activeVariantId;
              const heroColor = getHeroColor(variant.variables || {});
              return (
                <button
                  key={variant.id}
                  onClick={() => onSelectVariant(variant.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap shrink-0 shadow-sm border ${
                    isSelected
                      ? "bg-stone-900 text-white font-semibold border-stone-800 scale-105 shadow-md"
                      : "bg-white/90 hover:bg-white text-stone-800 border-stone-200/80 hover:border-stone-300"
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0 shadow-2xs transition-colors"
                    style={{ backgroundColor: heroColor }}
                  />
                  <span>{variant.name}</span>
                </button>
              );
            })}

            <div className="w-px h-5 bg-stone-300/80 mx-1 shrink-0" />

            <button
              onClick={onGenerateMore}
              disabled={isGeneratingMore}
              title="Generate New Theme Variations"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-stone-800 text-xs font-medium border border-stone-200/80 hover:border-stone-300 transition-all disabled:opacity-50 whitespace-nowrap shrink-0 shadow-sm"
            >
              <Shuffle className={`w-3 h-3 text-stone-600 ${isGeneratingMore ? "animate-spin" : ""}`} />
              <span>{isGeneratingMore ? "Creating..." : "New Variants"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


