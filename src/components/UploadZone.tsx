import React, { useState, useEffect, useRef } from "react";
import { Upload, Sparkles, ArrowRight, CheckCircle2, ShieldAlert, Timer } from "lucide-react";

interface UploadZoneProps {
  onAnalyze: (base64: string, mimeType: string) => void;
  onSelectSample: (sampleId: string) => void;
  isAnalyzing: boolean;
  error?: string | null;
}

const ANALYSIS_STEPS = [
  "Scanning screenshot visual hierarchy...",
  "Extracting semantic color tokens...",
  "Translating layout to responsive Tailwind CSS...",
  "Synthesizing theme variations..."
];

export const UploadZone: React.FC<UploadZoneProps> = ({
  onAnalyze,
  isAnalyzing,
  error,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Faster step progression tailored for ~30s average processing
  useEffect(() => {
    if (!isAnalyzing) {
      setStepIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setStepIndex((prev) => Math.min(prev + 1, ANALYSIS_STEPS.length - 1));
    }, 7000);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Live timer counting minutes, seconds, milliseconds
  useEffect(() => {
    if (!isAnalyzing) {
      setElapsedMs(0);
      return;
    }
    const startTime = performance.now();
    const timerInterval = setInterval(() => {
      setElapsedMs(performance.now() - startTime);
    }, 33); // ~30fps for smooth millisecond display

    return () => clearInterval(timerInterval);
  }, [isAnalyzing]);

  const formatTimer = (totalMs: number) => {
    const mins = Math.floor(totalMs / 60000);
    const secs = Math.floor((totalMs % 60000) / 1000);
    const ms = Math.floor((totalMs % 1000) / 10);
    return {
      minutes: mins.toString().padStart(2, "0"),
      seconds: secs.toString().padStart(2, "0"),
      milliseconds: ms.toString().padStart(2, "0"),
    };
  };

  const timer = formatTimer(elapsedMs);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, WEBP, GIF).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onAnalyze(result, file.type);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 sm:py-24 flex flex-col items-center text-center">
      {/* Editorial Hero Header */}
      <div className="max-w-2xl mx-auto mb-14">
        <h1 className="text-[80px] leading-[68.5px] pb-[4px] font-serif font-semibold text-stone-900 tracking-tight">
          One screenshot. <br />
          Endless themes.
        </h1>
        
        <p className="mt-6 text-[20.5px] text-stone-600 max-w-xl mx-auto leading-relaxed font-sans font-light">
          Upload any screenshot to instantly reconstruct it in clean Tailwind CSS with semantic variables and AI theme variations.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="w-full max-w-xl mx-auto mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-left">
          <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <strong className="font-semibold block text-rose-900">Analysis Error</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Upload Zone / Loading State */}
      <div className="w-full max-w-2xl mx-auto">
        {isAnalyzing ? (
          <div className="p-12 sm:p-16 rounded-3xl bg-white border border-stone-200 shadow-xl text-center relative overflow-hidden animate-fade-in">
            <div className="relative z-10 flex flex-col items-center">
              {/* Live Millisecond Stopwatch Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-transparent border border-black text-stone-900 font-mono text-xs font-semibold mb-4">
                <Timer className="w-3.5 h-3.5 text-stone-900 shrink-0" />
                <span className="tracking-wider">
                  {timer.minutes}:{timer.seconds}.<span className="text-stone-600">{timer.milliseconds}</span>
                </span>
              </div>

              <h3 className="text-2xl font-serif font-semibold text-stone-900 mb-2">
                Rebuilding architecture
              </h3>
              
              <p className="text-stone-500 font-normal text-sm sm:text-base mb-8 min-h-[24px]">
                {ANALYSIS_STEPS[stepIndex]}
              </p>

              <div className="grid grid-cols-1 gap-2.5 text-left w-full max-w-sm mx-auto">
                {ANALYSIS_STEPS.map((step, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition-all ${
                      idx < stepIndex 
                        ? "bg-stone-100 text-stone-700"
                        : idx === stepIndex 
                        ? "bg-stone-900 text-white shadow-sm"
                        : "text-stone-400"
                    }`}
                  >
                    {idx < stepIndex ? (
                      <CheckCircle2 className="w-4 h-4 text-stone-900 shrink-0" />
                    ) : idx === stepIndex ? (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin shrink-0"></div>
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full bg-stone-200 shrink-0"></div>
                    )}
                    <span className="truncate">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group relative p-12 sm:p-16 rounded-3xl border border-dashed transition-all cursor-pointer text-center bg-white/70 backdrop-blur-sm ${
              isDragging
                ? "border-stone-900 bg-white shadow-2xl scale-[1.01]"
                : "border-stone-300 hover:border-stone-600 hover:bg-white hover:shadow-xl"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />

            <div className="w-14 h-14 rounded-2xl bg-stone-100 border border-stone-200/80 flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform shadow-sm">
              <Upload className="w-6 h-6 text-stone-700" />
            </div>

            <h3 className="text-xl sm:text-2xl font-serif font-semibold text-stone-900 mb-2">
              Drop your screenshot here
            </h3>
            <p className="text-stone-500 text-sm max-w-sm mx-auto mb-8 font-light">
              PNG, JPG, WEBP, or GIF. Reconstructed with responsive layouts and semantic tokens.
            </p>

            <button
              type="button"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm shadow-md transition-all group-hover:scale-105"
            >
              <span>Select image</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

