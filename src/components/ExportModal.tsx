import React, { useState } from "react";
import { PaletteVariant, ColorMapping } from "../types";
import { X, Copy, Check, Download, Code, Sparkles, FileText, Layers } from "lucide-react";

interface ExportModalProps {
  variant: PaletteVariant;
  html: string;
  detectedFonts: string[];
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  variant,
  html,
  detectedFonts,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"css" | "tailwind" | "prompt" | "html">("css");
  const [copied, setCopied] = useState(false);

  const variables: ColorMapping = variant?.variables || {};

  // 1. Raw CSS Block
  const cssString = `:root {
  /* Huey Palette: ${variant.name} */
${Object.entries(variables)
  .map(([k, v]) => `  ${k}: ${v};`)
  .join("\n")}
}`;

  // 2. Tailwind Extension
  const tailwindString = `// tailwind.config.ts / vite.config.ts
export default {
  theme: {
    extend: {
      colors: {
${Object.entries(variables)
  .map(([k, v]) => `        '${k.replace("--", "")}': '${v}',`)
  .join("\n")}
      },
    },
  },
};`;

  // 3. LLM Prompt
  const llmPromptString = `Please refactor my web application UI to use the following semantic color design token system ("${variant.name}"):

Design Token Mapping:
${Object.entries(variables)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}

Instructions:
1. Ensure all background surfaces use classes like \`bg-[var(--bg-base)]\`, \`bg-[var(--surface-1)]\`, or \`bg-[var(--surface-2)]\`.
2. Ensure all text elements use \`text-[var(--text-primary)]\`, \`text-[var(--text-secondary)]\`, or \`text-[var(--text-muted)]\`.
3. Ensure action buttons use \`bg-[var(--btn-primary)]\` with \`text-[var(--btn-text)]\`.
4. Preserve high visual hierarchy and smooth hover transitions.`;

  // 4. Standalone HTML
  const standaloneHtmlString = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Huey - ${variant.name}</title>
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
  <link href="https://fonts.googleapis.com/css2?family=${(detectedFonts || ["Inter", "DM Sans"])
    .map((f) => (f === "Newsreader" ? "DM Sans" : f))
    .map((f) => f.replace(/\s+/g, "+"))
    .join("&family=")}:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
${Object.entries(variables)
  .map(([k, v]) => `      ${k}: ${v};`)
  .join("\n")}
    }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', sans-serif;
      background-color: var(--bg-base);
      color: var(--text-primary);
    }
  </style>
</head>
<body>
${html}
</body>
</html>`;

  const getActiveContent = () => {
    switch (activeTab) {
      case "tailwind":
        return tailwindString;
      case "prompt":
        return llmPromptString;
      case "html":
        return standaloneHtmlString;
      default:
        return cssString;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([standaloneHtmlString], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `huey-${variant.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl bg-white border border-stone-200 rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 bg-white border-b border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-900">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-semibold text-lg text-stone-900">Export Theme</h3>
              <p className="text-xs text-stone-500 font-light">Variant: <strong className="text-stone-900 font-medium">{variant.name}</strong></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 bg-stone-50 border-b border-stone-200 flex gap-4 overflow-x-auto shrink-0">
          <button
            onClick={() => { setActiveTab("css"); setCopied(false); }}
            className={`flex items-center gap-2 pb-3 border-b-2 text-xs font-medium transition-all ${
              activeTab === "css"
                ? "border-stone-900 text-stone-900"
                : "border-transparent text-stone-400 hover:text-stone-700"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>CSS Variables</span>
          </button>
          <button
            onClick={() => { setActiveTab("tailwind"); setCopied(false); }}
            className={`flex items-center gap-2 pb-3 border-b-2 text-xs font-medium transition-all ${
              activeTab === "tailwind"
                ? "border-stone-900 text-stone-900"
                : "border-transparent text-stone-400 hover:text-stone-700"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tailwind Config</span>
          </button>
          <button
            onClick={() => { setActiveTab("prompt"); setCopied(false); }}
            className={`flex items-center gap-2 pb-3 border-b-2 text-xs font-medium transition-all ${
              activeTab === "prompt"
                ? "border-stone-900 text-stone-900"
                : "border-transparent text-stone-400 hover:text-stone-700"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-stone-700" />
            <span>AI Prompt</span>
          </button>
          <button
            onClick={() => { setActiveTab("html"); setCopied(false); }}
            className={`flex items-center gap-2 pb-3 border-b-2 text-xs font-medium transition-all ${
              activeTab === "html"
                ? "border-stone-900 text-stone-900"
                : "border-transparent text-stone-400 hover:text-stone-700"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-stone-700" />
            <span>Standalone HTML</span>
          </button>
        </div>

        {/* Code Content Area */}
        <div className="p-6 flex-1 overflow-y-auto bg-[#f8f9fa]">
          <div className="relative">
            <pre className="p-5 rounded-2xl bg-stone-900 border border-stone-800 text-xs font-mono text-stone-200 overflow-x-auto leading-relaxed shadow-inner">
              <code>{getActiveContent()}</code>
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-white border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-stone-500 font-light">
            {activeTab === "prompt" ? (
              <span>💡 Paste this prompt into any LLM to apply this theme.</span>
            ) : activeTab === "html" ? (
              <span>💡 Standalone file includes Tailwind CDN and tokens.</span>
            ) : (
              <span>💡 Ready to drop into your stylesheet.</span>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            {activeTab === "html" && (
              <button
                onClick={handleDownloadHtml}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-900 font-medium text-xs transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download HTML</span>
              </button>
            )}
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs shadow-sm transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy {activeTab.toUpperCase()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
