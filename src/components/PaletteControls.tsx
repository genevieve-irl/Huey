import React, { useState } from "react";
import { PaletteVariant, ChatMessage } from "../types";
import { Send, Layers, MessageSquare, Sparkles, Check, RotateCcw } from "lucide-react";

interface PaletteControlsProps {
  activeVariant: PaletteVariant;
  onUpdateVariable: (key: string, newHex: string) => void;
  onRefineWithAI: (userPrompt: string) => void;
  isRefining: boolean;
  chatHistory: ChatMessage[];
  onOpenContrastAudit?: () => void;
  stagedVariables?: Record<string, string>;
  onSaveStaged?: (key?: string) => void;
  onDiscardStaged?: (key?: string) => void;
}

const SUGGESTED_PROMPTS = [
  "✨ Make buttons deep charcoal",
  "☀️ Switch to a warm sandstone palette",
  "🌿 Transform into an earthy green theme",
  "🖤 Create an OLED monochrome dark mode",
];

export const PaletteControls: React.FC<PaletteControlsProps> = ({
  activeVariant,
  onUpdateVariable,
  onRefineWithAI,
  isRefining,
  chatHistory,
  stagedVariables,
  onSaveStaged,
  onDiscardStaged,
}) => {
  const [activeTab, setActiveTab] = useState<"swatches" | "chat">("swatches");
  const [chatInput, setChatInput] = useState("");

  const variables = activeVariant?.variables || {};

  // Group variables logically
  const groupVariables = () => {
    const groups: Record<string, [string, string][]> = {
      "Surfaces": [],
      "Typography": [],
      "Actions & Buttons": [],
      "Borders & Accents": [],
    };

    Object.entries(variables).forEach(([key, rawVal]) => {
      const val = String(rawVal || "");
      if (key.includes("bg") || key.includes("surface") || key.includes("canvas") || key.includes("card")) {
        groups["Surfaces"].push([key, val]);
      } else if (key.includes("text") || key.includes("font") || key.includes("title") || key.includes("label") || key.includes("inverse")) {
        groups["Typography"].push([key, val]);
      } else if (key.includes("btn") || key.includes("button") || key.includes("action") || key.includes("cta")) {
        groups["Actions & Buttons"].push([key, val]);
      } else {
        groups["Borders & Accents"].push([key, val]);
      }
    });

    return groups;
  };

  const handleSendChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isRefining) return;
    onRefineWithAI(chatInput.trim());
    setChatInput("");
  };

  const grouped = groupVariables();

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-sm">
      {/* Header & Minimal Tabs */}
      <div className="p-4 bg-white border-b border-stone-200 shrink-0">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="font-serif font-semibold text-lg text-stone-900">
            Token Inspector
          </h2>
          <span className="px-2.5 py-1 rounded-full text-[11px] bg-stone-100 text-stone-700 font-medium">
            {activeVariant.name}
          </span>
        </div>

        {/* 2 Tabs */}
        <div className="grid grid-cols-2 gap-1 bg-stone-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveTab("swatches")}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
              activeTab === "swatches"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Variables ({Object.keys(variables).length})</span>
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
              activeTab === "chat"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI Refiner</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Token Swatches */}
      {activeTab === "swatches" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#f8f9fa]">
          {stagedVariables && Object.keys(stagedVariables).length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between gap-3 shadow-xs animate-fade-in">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <p className="text-xs font-medium text-amber-900 truncate">
                  {Object.keys(stagedVariables).length} color{Object.keys(stagedVariables).length > 1 ? "s" : ""} modified (unsaved)
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onDiscardStaged?.()}
                  className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 hover:bg-amber-100/50 text-amber-800 text-xs font-medium transition-colors"
                >
                  Discard All
                </button>
                <button
                  onClick={() => onSaveStaged?.()}
                  className="px-3 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium shadow-xs transition-all"
                >
                  Save All
                </button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {Object.entries(grouped).map(([groupName, items]) => {
              if (items.length === 0) return null;

              return (
                <div key={groupName} className="space-y-1">
                  <h3 className="text-[11px] font-medium tracking-wide text-stone-400 border-b border-stone-200/80 pb-1.5 mb-1 flex items-center justify-between">
                    <span>{groupName}</span>
                    <span>{items.length}</span>
                  </h3>
                  <div className="divide-y divide-stone-200/60">
                    {items.map(([key, val]) => {
                      const normKey = key.trim().startsWith("--") ? key.trim() : "--" + key.trim().replace(/^-+/, "");
                      const isStaged = stagedVariables && normKey in stagedVariables;

                      return (
                        <div
                          key={key}
                          className={`flex items-center justify-between py-2.5 px-1 transition-all group ${
                            isStaged
                              ? "bg-amber-50/80 px-2 rounded-lg my-1 border border-amber-300 shadow-2xs"
                              : "hover:bg-stone-200/30 rounded-md"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Color Swatch / Picker Trigger */}
                            <div className="relative w-7 h-7 rounded-lg overflow-hidden shrink-0 border border-black/10 shadow-2xs group-hover:scale-105 transition-transform">
                              <input
                                type="color"
                                value={val.startsWith("#") && val.length >= 7 ? val.slice(0, 7) : "#000000"}
                                onChange={(e) => onUpdateVariable(key, e.target.value)}
                                className="absolute -inset-2 w-10 h-10 cursor-pointer opacity-0"
                                title={`Click to pick color for ${key}`}
                              />
                              <div
                                className="w-full h-full pointer-events-none"
                                style={{ backgroundColor: val }}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-mono text-xs font-medium text-stone-800 truncate">
                                {key}
                              </p>
                              <p className="font-mono text-[11px] text-stone-400 uppercase">{val}</p>
                            </div>
                          </div>

                          {/* Hex editor */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isStaged && (
                              <div className="flex items-center gap-1 mr-1 animate-fade-in">
                                <button
                                  onClick={() => onSaveStaged?.(normKey)}
                                  title="Save this change"
                                  className="p-1 rounded bg-stone-900 text-white hover:bg-stone-800 transition-colors"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onDiscardStaged?.(normKey)}
                                  title="Discard change"
                                  className="p-1 rounded bg-stone-200 text-stone-700 hover:bg-stone-300 transition-colors"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                            <input
                              type="text"
                              value={val}
                              onChange={(e) => onUpdateVariable(key, e.target.value)}
                              className="w-22 px-2 py-1 rounded bg-stone-50 border border-stone-200 text-[11px] font-mono text-stone-700 text-center uppercase focus:outline-none focus:border-stone-400"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: AI Chat Refiner */}
      {activeTab === "chat" && (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f8f9fa]">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3">
            <div className="p-4 rounded-2xl bg-white border border-stone-200 text-xs text-stone-600 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 font-medium text-stone-900">
                <Sparkles className="w-3.5 h-3.5 text-stone-700" />
                <span>Natural Language Theme Editor</span>
              </div>
              <p className="leading-relaxed font-light">
                Ask the AI to adjust colors or moods. Try requesting warmer backgrounds, deeper text contrast, or specific brand colors.
              </p>
            </div>

            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                    msg.sender === "user"
                      ? "bg-stone-900 text-white rounded-br-xs"
                      : "bg-white border border-stone-200 text-stone-800 rounded-bl-xs"
                  }`}
                >
                  <p>{msg.text}</p>
                  {msg.paletteCreated && (
                    <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] font-medium text-stone-500">
                      <span>Palette created: {msg.paletteCreated.name}</span>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-stone-400 mt-1 px-1">
                  {msg.sender === "user" ? "You" : "Huey"}
                </span>
              </div>
            ))}

            {isRefining && (
              <div className="flex items-center gap-2 text-xs text-stone-500 p-3 bg-white rounded-xl border border-stone-200 shadow-2xs animate-pulse">
                <div className="w-3 h-3 rounded-full border-2 border-stone-900 border-t-transparent animate-spin"></div>
                <span>Adjusting tokens...</span>
              </div>
            )}
          </div>

          {/* Prompt Suggestion Chips */}
          <div className="px-4 py-2 bg-white border-t border-stone-200 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex gap-1.5 shrink-0">
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => setChatInput(prompt)}
                className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-[11px] text-stone-600 hover:text-stone-900 border border-stone-200/60 shrink-0 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendChat} className="p-3 bg-white border-t border-stone-200 flex gap-2 shrink-0">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask AI to refine colors..."
              disabled={isRefining}
              className="flex-1 px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-full text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isRefining}
              className="w-8 h-8 rounded-full bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white transition-all shadow-sm flex items-center justify-center shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

