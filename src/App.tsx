import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { UploadZone } from "./components/UploadZone";
import { PreviewCanvas } from "./components/PreviewCanvas";
import { PaletteControls } from "./components/PaletteControls";
import { ExportModal } from "./components/ExportModal";
import { ContrastModal } from "./components/ContrastModal";
import { PRESET_ANALYSES } from "./data/presets";
import { AnalysisResult, PaletteVariant, ChatMessage } from "./types";
import { Sparkles, ArrowLeft, RefreshCw } from "lucide-react";

export default function App() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [variants, setVariants] = useState<PaletteVariant[]>([]);
  const [activeVariantId, setActiveVariantId] = useState<string>("original");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showExportModal, setShowExportModal] = useState(false);
  const [showContrastModal, setShowContrastModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [stagedVariables, setStagedVariables] = useState<Record<string, string>>({});

  // 1. Analyze Screenshot Upload
  const handleAnalyze = async (base64Data: string, mimeType: string) => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    setVariants([]);
    setStagedVariables({});

    try {
      // Call backend Vision API
      const res = await fetch("/api/analyze-ui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64Data, mimeType }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${res.status}`);
      }

      const result: AnalysisResult = await res.json();
      setAnalysisResult(result);

      // Create Original Palette Variant
      const originalVariant: PaletteVariant = {
        id: "original",
        name: "Original Theme",
        description: result.summary || "The exact color tokens detected from your screenshot.",
        variables: result.originalMapping,
      };
      
      setVariants([originalVariant]);
      setActiveVariantId("original");
      setIsAnalyzing(false);

      // Add welcoming chat message
      setChatHistory([
        {
          id: `welcome-${Date.now()}`,
          sender: "ai",
          text: `Reconstructed your UI in Tailwind CSS with ${Object.keys(result.originalMapping).length} semantic variables! Generating theme variations...`,
          timestamp: Date.now(),
        }
      ]);

      // Automatically generate AI palette variations
      await generateInitialPalettes(result.originalMapping, result.summary, [originalVariant]);
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setError(err.message || "Failed to analyze UI image. Please try again.");
      setIsAnalyzing(false);
    }
  };

  // 2. Generate Initial Palette Variations
  const generateInitialPalettes = async (
    originalMapping: Record<string, string>,
    summary: string,
    currentVariants: PaletteVariant[]
  ) => {
    try {
      const pastPalettes = currentVariants.map((v) => ({ name: v.name, variables: v.variables }));
      const res = await fetch("/api/generate-palettes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalMapping, summary, pastPalettes }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.variants && Array.isArray(data.variants)) {
          const updated = [...currentVariants, ...data.variants];
          setVariants(updated);

          setChatHistory((prev) => [
            ...prev,
            {
              id: `palettes-ready-${Date.now()}`,
              sender: "ai",
              text: `✨ Generated 3 theme variations: "${data.variants[0]?.name}", "${data.variants[1]?.name}", and "${data.variants[2]?.name}". Click any tab above the preview to switch themes!`,
              timestamp: Date.now(),
            }
          ]);
        }
      }
    } catch (err) {
      console.warn("Failed to generate initial variants:", err);
    }
  };

  // 3. Instant Preset Sample Selection (stubbed for clean minimal design)
  const handleSelectSample = (sampleId: string) => {
    const preset = PRESET_ANALYSES[sampleId];
    if (!preset) return;

    setError(null);
    setAnalysisResult(preset.analysis);

    const originalVariant: PaletteVariant = {
      id: "original",
      name: "Original Theme",
      description: preset.analysis.summary,
      variables: preset.analysis.originalMapping,
    };

    const allVariants = [originalVariant, ...preset.variants];
    setVariants(allVariants);
    setActiveVariantId("original");
    setStagedVariables({});
  };

  // 4. Manual Color Swatch Update (Staged Draft with Real-Time 0ms Iframe Hot-Swap)
  const handleUpdateVariable = (key: string, newHex: string) => {
    const normKey = key.trim().startsWith("--") ? key.trim() : "--" + key.trim().replace(/^-+/, "");
    setStagedVariables((prev) => ({
      ...prev,
      [normKey]: newHex,
    }));
  };

  const handleSaveStaged = (key?: string) => {
    if (key) {
      const normKey = key.trim().startsWith("--") ? key.trim() : "--" + key.trim().replace(/^-+/, "");
      const val = stagedVariables[normKey];
      if (!val) return;
      setVariants((prev) =>
        prev.map((v) => (v.id === activeVariantId ? { ...v, variables: { ...v.variables, [normKey]: val } } : v))
      );
      setStagedVariables((prev) => {
        const copy = { ...prev };
        delete copy[normKey];
        return copy;
      });
    } else {
      setVariants((prev) =>
        prev.map((v) => (v.id === activeVariantId ? { ...v, variables: { ...v.variables, ...stagedVariables } } : v))
      );
      setStagedVariables({});
    }
  };

  const handleDiscardStaged = (key?: string) => {
    if (key) {
      const normKey = key.trim().startsWith("--") ? key.trim() : "--" + key.trim().replace(/^-+/, "");
      setStagedVariables((prev) => {
        const copy = { ...prev };
        delete copy[normKey];
        return copy;
      });
    } else {
      setStagedVariables({});
    }
  };

  // 5. Refine Palette via AI Chat
  const handleRefineWithAI = async (userPrompt: string) => {
    const activeVariant = variants.find((v) => v.id === activeVariantId) || variants[0];
    if (!activeVariant) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userPrompt,
      timestamp: Date.now(),
    };
    setChatHistory((prev) => [...prev, userMsg]);
    setIsRefining(true);

    try {
      const res = await fetch("/api/refine-palette", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPalette: activeVariant,
          userPrompt,
          chatHistory: [...chatHistory, userMsg],
          allVariables: activeVariant.variables,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to refine palette with AI");
      }

      const data = await res.json();
      if (data.newPalette) {
        setVariants((prev) => [...prev, data.newPalette]);
        setActiveVariantId(data.newPalette.id);

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: data.replyMessage || `Created new variant "${data.newPalette.name}".`,
          timestamp: Date.now(),
          paletteCreated: data.newPalette,
        };
        setChatHistory((prev) => [...prev, aiMsg]);
      }
    } catch (err: any) {
      console.error("Chat refinement error:", err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "ai",
        text: `Error adjusting palette: ${err.message}`,
        timestamp: Date.now(),
      };
      setChatHistory((prev) => [...prev, errorMsg]);
    } finally {
      setIsRefining(false);
    }
  };

  // 6. Generate More Palettes
  const handleGenerateMore = async () => {
    if (!analysisResult) return;
    setIsGeneratingMore(true);

    try {
      const pastPalettes = variants.map((v) => ({ name: v.name, variables: v.variables }));
      const res = await fetch("/api/generate-palettes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalMapping: analysisResult.originalMapping,
          summary: `${analysisResult.summary} (Generate completely fresh new variations)`,
          pastPalettes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.variants && Array.isArray(data.variants)) {
          // Client-side deduplication check against existing variants
          const uniqueNew = data.variants.filter((newV: PaletteVariant) => {
            return !variants.some((ex) => {
              const keysA = Object.keys(ex.variables || {});
              if (keysA.length === 0) return false;
              let matchCount = 0;
              let compareCount = 0;
              for (const k of keysA) {
                const vA = String(ex.variables[k] || "").trim().toLowerCase();
                const vB = String(newV.variables?.[k] || "").trim().toLowerCase();
                if (vA && vB) {
                  compareCount++;
                  if (vA === vB) matchCount++;
                }
              }
              return compareCount > 0 && matchCount / compareCount >= 0.85;
            });
          });

          const toAdd = uniqueNew.length > 0 ? uniqueNew : data.variants;
          setVariants((prev) => [...prev, ...toAdd]);
        }
      }
    } catch (err) {
      console.warn("Error generating more palettes:", err);
    } finally {
      setIsGeneratingMore(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setVariants([]);
    setError(null);
    setStagedVariables({});
  };

  const activeVariant = variants.find((v) => v.id === activeVariantId) || variants[0];
  const effectiveVariables = activeVariant ? { ...activeVariant.variables, ...stagedVariables } : {};
  const effectiveVariant = activeVariant ? { ...activeVariant, variables: effectiveVariables } : undefined;
  const effectiveVariants = variants.map((v) =>
    v.id === activeVariantId ? { ...v, variables: { ...v.variables, ...stagedVariables } } : v
  );

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 flex flex-col font-sans selection:bg-stone-900 selection:text-white">
      <Navbar onReset={handleReset} hasActiveSession={!!analysisResult} />

      <main className="flex-1 flex flex-col">
        {!analysisResult ? (
          <UploadZone
            onAnalyze={handleAnalyze}
            onSelectSample={handleSelectSample}
            isAnalyzing={isAnalyzing}
            error={error}
          />
        ) : (
          <div className="flex-1 max-w-[1700px] w-full mx-auto p-2 sm:p-4 flex flex-col lg:flex-row gap-3 sm:gap-4 animate-fade-in">
            {/* Left Sidebar: Controls & Inspector (Collapsible) */}
            {!isSidebarCollapsed && (
              <div className="w-full lg:w-[400px] xl:w-[420px] shrink-0 h-[580px] lg:h-[calc(100vh-4.25rem)] transition-all duration-300">
                {effectiveVariant && (
                  <PaletteControls
                    activeVariant={effectiveVariant}
                    onUpdateVariable={handleUpdateVariable}
                    onRefineWithAI={handleRefineWithAI}
                    isRefining={isRefining}
                    chatHistory={chatHistory}
                    stagedVariables={stagedVariables}
                    onSaveStaged={handleSaveStaged}
                    onDiscardStaged={handleDiscardStaged}
                  />
                )}
              </div>
            )}

            {/* Right Main Area: Live Iframe Preview Canvas */}
            <div className="flex-1 min-w-0 h-[650px] lg:h-[calc(100vh-4.25rem)] transition-all duration-300">
              <PreviewCanvas
                html={analysisResult.html}
                detectedFonts={analysisResult.detectedFonts || ["Inter", "DM Sans"]}
                variants={effectiveVariants}
                activeVariantId={activeVariantId}
                onSelectVariant={(id) => {
                  setActiveVariantId(id);
                  setStagedVariables({});
                }}
                onOpenExport={() => setShowExportModal(true)}
                onGenerateMore={handleGenerateMore}
                isGeneratingMore={isGeneratingMore}
                isSidebarCollapsed={isSidebarCollapsed}
                onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              />
            </div>
          </div>
        )}
      </main>

      {/* Export Modal */}
      {showExportModal && activeVariant && analysisResult && (
        <ExportModal
          variant={activeVariant}
          html={analysisResult.html}
          detectedFonts={analysisResult.detectedFonts || ["Inter", "DM Sans"]}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}

