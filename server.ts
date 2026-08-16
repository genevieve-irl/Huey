import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { ColorMapping, PaletteVariant, AnalysisResult } from "./src/types";

dotenv.config();

const PORT = 3000;
const HOST = "0.0.0.0";

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please configure it in user settings.");
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// Advanced JSON sanitizer for LLM responses (specifically handles control characters in string literals, comments, and truncation)
function sanitizeJSONString(text: string): string {
  let result = "";
  let inString = false;
  let escape = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    const code = text.charCodeAt(i);

    if (escape) {
      if ('"\\/bfnrtu'.includes(char)) {
        result += "\\" + char;
      } else if (char === "'") {
        result += "'";
      } else {
        result += "\\\\" + char;
      }
      escape = false;
      i++;
      continue;
    }

    if (inString && char === '\\') {
      escape = true;
      i++;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      result += char;
      i++;
      continue;
    }

    if (inString) {
      if (code < 32) {
        if (code === 10) result += "\\n";
        else if (code === 13) result += "\\r";
        else if (code === 9) result += "\\t";
        else if (code === 8) result += "\\b";
        else if (code === 12) result += "\\f";
        else result += "\\u00" + code.toString(16).padStart(2, "0");
        i++;
        continue;
      }
      result += char;
      i++;
      continue;
    }

    // Outside strings: strip single line comments // ...
    if (char === '/' && text[i + 1] === '/') {
      i += 2;
      while (i < text.length && text[i] !== '\n' && text[i] !== '\r') {
        i++;
      }
      continue;
    }

    // Outside strings: strip multi line comments /* ... */
    if (char === '/' && text[i + 1] === '*') {
      i += 2;
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) {
        i++;
      }
      if (i < text.length) i += 2;
      continue;
    }

    result += char;
    i++;
  }

  return result;
}

function fixStructuralJSON(text: string): string {
  let result = "";
  let inString = false;
  let escape = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    if (escape) {
      result += char;
      escape = false;
      i++;
      continue;
    }
    if (char === '\\' && inString) {
      result += char;
      escape = true;
      i++;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      result += char;
      i++;
      continue;
    }
    if (inString) {
      result += char;
      i++;
      continue;
    }

    if (char === ',') {
      let j = i + 1;
      while (j < text.length && /\s/.test(text[j])) j++;
      if (j < text.length && (text[j] === '}' || text[j] === ']')) {
        i++;
        continue;
      }
    }

    if (char === '}' || char === ']') {
      result += char;
      let j = i + 1;
      let spaces = "";
      while (j < text.length && /\s/.test(text[j])) {
        spaces += text[j];
        j++;
      }
      if (j < text.length && (text[j] === '{' || text[j] === '[')) {
        result += spaces + ", ";
        i = j;
        continue;
      }
      i++;
      continue;
    }

    result += char;
    i++;
  }

  return result;
}

function repairTruncatedJSON(str: string): string {
  let text = str.trim();
  const stack: string[] = [];
  let inString = false;
  let escape = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (escape) { escape = false; continue; }
    if (char === '\\' && inString) { escape = true; continue; }
    if (char === '"') { inString = !inString; continue; }
    if (!inString) {
      if (char === '{') stack.push('}');
      else if (char === '[') stack.push(']');
      else if (char === '}' || char === ']') stack.pop();
    }
  }

  if (inString) {
    text += '"';
  }

  text = text.replace(/,\s*$/, "");
  text = text.replace(/:\s*$/, ": null");

  while (stack.length > 0) {
    text += stack.pop();
  }

  return text;
}

// Robust JSON parsing with salvage logic for truncated or slightly malformed AI responses
function parseOrSalvageJSON(rawText: string) {
  let text = rawText.trim();
  
  if (text.includes("```")) {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match && match[1]) {
      text = match[1].trim();
    }
  }

  text = sanitizeJSONString(text);
  text = fixStructuralJSON(text);

  try {
    return JSON.parse(text);
  } catch (err: any) {
    console.log("[JSON Parser] Initial parse required cleanup, extracting structured objects...");

    const firstBrace = text.indexOf("{");
    const firstBracket = text.indexOf("[");
    let startIdx = -1;
    let endIdx = -1;

    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      startIdx = firstBrace;
      endIdx = text.lastIndexOf("}");
    } else if (firstBracket !== -1) {
      startIdx = firstBracket;
      endIdx = text.lastIndexOf("]");
    }

    if (startIdx !== -1 && endIdx > startIdx) {
      const slice = text.substring(startIdx, endIdx + 1);
      try {
        return JSON.parse(fixStructuralJSON(slice));
      } catch (e) {}
    }

    if (startIdx !== -1) {
      const candidate = text.substring(startIdx);
      try {
        const repaired = repairTruncatedJSON(candidate);
        return JSON.parse(fixStructuralJSON(repaired));
      } catch (e) {}
    }

    const salvagedObjects: any[] = [];
    let depth = 0;
    let objStartIdx = -1;
    let inString = false;
    let escape = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (escape) { escape = false; continue; }
      if (char === '\\' && inString) { escape = true; continue; }
      if (char === '"') { inString = !inString; continue; }
      if (inString) continue;

      if (char === '{') {
        if (depth === 0) objStartIdx = i;
        depth++;
      } else if (char === '}') {
        depth--;
        if (depth === 0 && objStartIdx !== -1) {
          const objStr = text.substring(objStartIdx, i + 1);
          try {
            const cleanObj = fixStructuralJSON(objStr);
            salvagedObjects.push(JSON.parse(cleanObj));
          } catch (e) {
            try {
              salvagedObjects.push(JSON.parse(repairTruncatedJSON(objStr)));
            } catch (e2) {}
          }
          objStartIdx = -1;
        }
      }
    }

    if (depth > 0 && objStartIdx !== -1) {
      const leftover = text.substring(objStartIdx);
      try {
        const repaired = repairTruncatedJSON(leftover);
        salvagedObjects.push(JSON.parse(fixStructuralJSON(repaired)));
      } catch (e) {}
    }

    if (salvagedObjects.length > 0) {
      console.log(`Successfully salvaged ${salvagedObjects.length} valid JSON object(s) from response.`);
      if (text.trim().startsWith("[") || salvagedObjects.length > 1) {
        return salvagedObjects;
      }
      return salvagedObjects[0];
    }

    throw err;
  }
}

// Safe AI execution with fallback and large output token headroom
async function callGeminiJSON(contents: any[], systemInstruction?: string) {
  const ai = getAI();
  const modelsToTry = ["gemini-3.7-flash", "gemini-3.6-flash"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          responseMimeType: "application/json",
          temperature: 0.4,
          maxOutputTokens: 65536,
          systemInstruction: systemInstruction || undefined,
        },
      });
      const text = typeof response.text === "function" ? (response.text as any)() : response.text;
      if (!text) throw new Error("Empty response from AI model");
      return parseOrSalvageJSON(text as string);
    } catch (err: any) {
      console.log(`[AI Model Notice] Model ${model} execution retry/error:`, err.message || err);
      lastError = err;
    }
  }
  throw new Error(`AI generation failed across all fallback models: ${lastError?.message || lastError}`);
}

function ensureCssVarKey(key: string): string {
  let k = key.trim();
  if (!k.startsWith("--")) {
    k = "--" + k.replace(/^-+/, "");
  }
  return k;
}

function getLuminance(hexOrRgb: string): number {
  if (!hexOrRgb) return 0.5;
  const str = hexOrRgb.trim();
  let r = 0, g = 0, b = 0;
  if (str.startsWith("#")) {
    let hex = str.slice(1);
    if (hex.length === 3) {
      hex = hex.split("").map((c) => c + c).join("");
    }
    if (hex.length >= 6) {
      r = parseInt(hex.slice(0, 2), 16) / 255;
      g = parseInt(hex.slice(2, 4), 16) / 255;
      b = parseInt(hex.slice(4, 6), 16) / 255;
    }
  } else if (str.startsWith("rgb")) {
    const match = str.match(/\d+(\.\d+)?/g);
    if (match && match.length >= 3) {
      r = parseFloat(match[0]) / 255;
      g = parseFloat(match[1]) / 255;
      b = parseFloat(match[2]) / 255;
    }
  }
  const a = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function detectThemeMode(mapping: Record<string, string>): "dark" | "light" {
  if (!mapping || typeof mapping !== "object") return "dark";

  // Check primary background variable tokens
  const bgCandidates = [
    "--bg-base",
    "--bg",
    "--background",
    "--body-bg",
    "--canvas-bg",
    "--surface-1",
    "--surface-base",
    "--card-bg",
  ];
  for (const candidate of bgCandidates) {
    const val = mapping[candidate] || mapping[candidate.replace(/^--/, "")];
    if (val && typeof val === "string") {
      return getLuminance(val) > 0.35 ? "light" : "dark";
    }
  }

  // Fallback: check any variable key containing "bg" or "surface"
  const bgKeys = Object.keys(mapping).filter((k) => {
    const l = k.toLowerCase();
    return l.includes("bg") || l.includes("surface") || l.includes("base") || l.includes("canvas");
  });

  if (bgKeys.length > 0) {
    let sumLum = 0;
    for (const k of bgKeys) {
      sumLum += getLuminance(mapping[k]);
    }
    return sumLum / bgKeys.length > 0.35 ? "light" : "dark";
  }

  // Check text color: if text-primary is light, UI is dark mode; if text-primary is dark, UI is light mode
  const textCandidates = ["--text-primary", "--text", "--color-text", "--text-main", "--foreground"];
  for (const candidate of textCandidates) {
    const val = mapping[candidate] || mapping[candidate.replace(/^--/, "")];
    if (val && typeof val === "string") {
      return getLuminance(val) > 0.5 ? "dark" : "light";
    }
  }

  return "dark";
}

function normalizeColorVal(val: string): string {
  if (!val) return "";
  let v = String(val).trim().toLowerCase();
  if (v.startsWith("#") && v.length === 4) {
    v = "#" + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
  }
  return v;
}

function arePalettesIdentical(
  a: Record<string, string>,
  b: Record<string, string>
): boolean {
  if (!a || !b) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length === 0 || keysB.length === 0) return false;

  let matchingKeys = 0;
  let totalCompared = 0;

  for (const k of keysA) {
    const normK = k.startsWith("--") ? k : "--" + k;
    const valA = a[k] || a[normK];
    const valB = b[k] || b[normK];

    if (valA && valB) {
      totalCompared++;
      if (normalizeColorVal(valA) === normalizeColorVal(valB)) {
        matchingKeys++;
      }
    }
  }

  // If 85% or more of the compared color tokens match, consider it duplicate/redundant
  return totalCompared > 0 && matchingKeys / totalCompared >= 0.85;
}

function preserveShadowOpacity(key: string, newVal: string, origVal?: string): string {
  const kLower = key.toLowerCase();
  if (!kLower.includes("shadow") && !kLower.includes("glow") && !kLower.includes("drop")) {
    return newVal;
  }
  if (!origVal || typeof origVal !== "string") {
    if (/^#[0-9a-fA-F]{6}$/.test(newVal)) {
      return newVal + "14";
    }
    return newVal;
  }
  const hex8Match = origVal.match(/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})$/);
  if (hex8Match) {
    const alphaHex = hex8Match[1];
    if (/^#[0-9a-fA-F]{6}$/.test(newVal)) {
      return newVal + alphaHex;
    }
    if (/^#[0-9a-fA-F]{8}$/.test(newVal)) {
      return newVal.slice(0, 7) + alphaHex;
    }
  }
  const rgbaMatch = origVal.match(/rgba\([^,]+,[^,]+,[^,]+,\s*([0-9.]+)\s*\)/i);
  if (rgbaMatch) {
    const alphaNum = parseFloat(rgbaMatch[1]);
    if (/^#[0-9a-fA-F]{6}$/.test(newVal)) {
      const r = parseInt(newVal.slice(1, 3), 16);
      const g = parseInt(newVal.slice(3, 5), 16);
      const b = parseInt(newVal.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alphaNum})`;
    }
  }
  return newVal;
}

function normalizeAnalysisResult(raw: any): any {
  if (!raw) return null;
  
  let candidate = raw;
  if (Array.isArray(raw)) {
    const found = raw.find(item => item && typeof item === "object" && (
      item.html || item.code || item.component || item.template || item.jsx || item.ui ||
      item.originalMapping || item.mapping || item.tokens || item.variables || item.colors
    ));
    candidate = found || raw[0];
  }

  if (!candidate || typeof candidate !== "object") return null;

  if (candidate.result && typeof candidate.result === "object") candidate = candidate.result;
  else if (candidate.data && typeof candidate.data === "object") candidate = candidate.data;
  else if (candidate.analysis && typeof candidate.analysis === "object") candidate = candidate.analysis;
  else if (candidate.output && typeof candidate.output === "object") candidate = candidate.output;

  let html = candidate.html || candidate.code || candidate.component || candidate.template || candidate.jsx || candidate.htmlCode || candidate.uiCode || candidate.content || candidate.ui || "";
  if (typeof html !== "string") html = "";

  let mappingRaw = candidate.originalMapping || candidate.mapping || candidate.tokens || candidate.variables || candidate.cssVariables || candidate.colors || candidate.colorMapping || candidate.palette || candidate.theme || {};
  let originalMapping: Record<string, string> = {};
  
  if (mappingRaw && typeof mappingRaw === "object") {
    if (Array.isArray(mappingRaw)) {
      for (const item of mappingRaw) {
        if (item && typeof item === "object") {
          if (item.key && item.value) originalMapping[ensureCssVarKey(item.key)] = String(item.value);
          else if (item.name && item.value) originalMapping[ensureCssVarKey(item.name)] = String(item.value);
          else if (item.variable && item.hex) originalMapping[ensureCssVarKey(item.variable)] = String(item.hex);
          else {
            for (const [k, v] of Object.entries(item)) {
              if (typeof v === "string" || typeof v === "number") originalMapping[ensureCssVarKey(k)] = String(v);
            }
          }
        }
      }
    } else {
      for (const [k, v] of Object.entries(mappingRaw)) {
        if (typeof v === "string" || typeof v === "number") originalMapping[ensureCssVarKey(k)] = String(v);
      }
    }
  }

  if (Object.keys(originalMapping).length === 0) {
    for (const [k, v] of Object.entries(candidate)) {
      if (v && typeof v === "object" && !Array.isArray(v) && k !== "html" && k !== "code") {
        const keys = Object.keys(v);
        const hasCssVar = keys.some(key => key.startsWith("--") || String((v as any)[key]).startsWith("#"));
        if (hasCssVar || keys.length >= 3) {
          for (const [propKey, propVal] of Object.entries(v)) {
            if (typeof propVal === "string" || typeof propVal === "number") {
              originalMapping[ensureCssVarKey(propKey)] = String(propVal);
            }
          }
          break;
        }
      }
    }
  }

  if (!html) {
    for (const [k, v] of Object.entries(candidate)) {
      if (typeof v === "string" && (v.includes("<div") || v.includes("<main") || v.includes("<header") || v.includes("<section"))) {
        html = v;
        break;
      }
    }
  }

  if (Object.keys(originalMapping).length === 0 && html) {
    const defRegex = /(--[a-zA-Z0-9_-]+)\s*:\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\))/g;
    let match;
    while ((match = defRegex.exec(html)) !== null) {
      if (match[1] && match[2]) {
        originalMapping[ensureCssVarKey(match[1])] = match[2].trim();
      }
    }

    const refRegex = /var\((--[a-zA-Z0-9_-]+)\)/g;
    while ((match = refRegex.exec(html)) !== null) {
      const varKey = ensureCssVarKey(match[1]);
      if (!originalMapping[varKey]) {
        const kLower = varKey.toLowerCase();
        if (kLower.includes("bg") || kLower.includes("body") || kLower.includes("base")) originalMapping[varKey] = "#0f172a";
        else if (kLower.includes("surface") || kLower.includes("card") || kLower.includes("panel")) originalMapping[varKey] = "#1e293b";
        else if (kLower.includes("text") && kLower.includes("muted")) originalMapping[varKey] = "#94a3b8";
        else if (kLower.includes("text") && kLower.includes("sec")) originalMapping[varKey] = "#cbd5e1";
        else if (kLower.includes("text")) originalMapping[varKey] = "#f8fafc";
        else if (kLower.includes("btn") && kLower.includes("text")) originalMapping[varKey] = "#ffffff";
        else if (kLower.includes("btn") || kLower.includes("primary") || kLower.includes("accent")) originalMapping[varKey] = "#3b82f6";
        else if (kLower.includes("border") || kLower.includes("divider") || kLower.includes("line")) originalMapping[varKey] = "#334155";
        else originalMapping[varKey] = "#64748b";
      }
    }

    if (Object.keys(originalMapping).length === 0) {
      originalMapping = {
        "--bg-base": "#0f172a",
        "--surface-1": "#1e293b",
        "--surface-2": "#334155",
        "--text-primary": "#f8fafc",
        "--text-secondary": "#cbd5e1",
        "--text-muted": "#94a3b8",
        "--btn-primary": "#3b82f6",
        "--btn-text": "#ffffff",
        "--border-accent": "#334155",
      };
    }
  }

  let detectedFonts = candidate.detectedFonts || candidate.fonts || candidate.fontFamilies || ["Inter", "Space Grotesk"];
  if (!Array.isArray(detectedFonts)) detectedFonts = ["Inter", "Space Grotesk"];

  let summary = candidate.summary || candidate.description || candidate.title || "Modern UI design with semantic color theming.";
  if (typeof summary !== "string") summary = "Modern UI design with semantic color theming.";

  if (!html || Object.keys(originalMapping).length === 0) {
    return null;
  }

  return { html, originalMapping, detectedFonts, summary };
}

function normalizePalettes(raw: any, originalMapping: Record<string, string>): any[] {
  let list = raw;
  if (!Array.isArray(list)) {
    if (list && Array.isArray(list.variants)) list = list.variants;
    else if (list && Array.isArray(list.palettes)) list = list.palettes;
    else if (list && Array.isArray(list.themes)) list = list.themes;
    else if (list && Array.isArray(list.colors)) list = list.colors;
    else if (list && Array.isArray(list.data)) list = list.data;
    else if (list && typeof list === "object") {
      const vals = Object.values(list).filter(v => v && typeof v === "object" && !Array.isArray(v) && ((v as any).name || (v as any).variables || (v as any).mapping || (v as any).colors));
      if (vals.length > 0) list = vals;
      else list = [list];
    }
  }

  if (!Array.isArray(list) || list.length === 0) {
    return [];
  }

  return list.map((item, idx) => {
    let name = item.name || item.title || item.themeName || item.label || `Theme Variant ${idx + 1}`;
    let description = item.description || item.summary || item.rationale || item.reason || `Professional color theme tailored for ideal visual hierarchy and readability.`;
    
    let varsRaw = item.variables || item.mapping || item.tokens || item.colors || item.cssVariables || item.palette || item.theme || {};
    let variables: Record<string, string> = {};

    if (varsRaw && typeof varsRaw === "object") {
      if (Array.isArray(varsRaw)) {
        for (const el of varsRaw) {
          if (el && typeof el === "object") {
            if (el.key && el.value) variables[ensureCssVarKey(el.key)] = String(el.value);
            else if (el.name && el.value) variables[ensureCssVarKey(el.name)] = String(el.value);
            else if (el.variable && el.hex) variables[ensureCssVarKey(el.variable)] = String(el.hex);
            else {
              for (const [k, v] of Object.entries(el)) {
                if (typeof v === "string" || typeof v === "number") variables[ensureCssVarKey(k)] = String(v);
              }
            }
          }
        }
      } else {
        for (const [k, v] of Object.entries(varsRaw)) {
          if (typeof v === "string" || typeof v === "number") variables[ensureCssVarKey(k)] = String(v);
        }
      }
    }

    if (Object.keys(variables).length === 0) {
      for (const [k, v] of Object.entries(item)) {
        if (v && typeof v === "object" && !Array.isArray(v) && k !== "name" && k !== "description") {
          for (const [propKey, propVal] of Object.entries(v)) {
            if (typeof propVal === "string" || typeof propVal === "number") {
              variables[ensureCssVarKey(propKey)] = String(propVal);
            }
          }
          if (Object.keys(variables).length > 0) break;
        }
      }
    }

    if (originalMapping && typeof originalMapping === "object") {
      for (const [origKey, origVal] of Object.entries(originalMapping)) {
        const normOrigKey = ensureCssVarKey(origKey);
        if (!variables[normOrigKey]) {
          variables[normOrigKey] = String(origVal);
        } else {
          variables[normOrigKey] = preserveShadowOpacity(normOrigKey, variables[normOrigKey], String(origVal));
        }
      }
    }

    for (const [k, v] of Object.entries(variables)) {
      const origVal = originalMapping ? (originalMapping[k] || originalMapping[k.replace(/^--/, "")]) : undefined;
      variables[k] = preserveShadowOpacity(k, v, origVal ? String(origVal) : undefined);
    }

    return { name, description, variables };
  });
}

function normalizeRefinedPalette(raw: any, currentPalette: any): any {
  let item = raw;
  if (Array.isArray(item) && item.length > 0) {
    item = item.find(el => el && typeof el === "object" && (el.variables || el.mapping || el.tokens || el.colors)) || item[0];
  }
  if (item && typeof item === "object") {
    if (item.result && typeof item.result === "object") item = item.result;
    else if (item.data && typeof item.data === "object") item = item.data;
    else if (item.palette && typeof item.palette === "object" && !item.variables) item = item.palette;
  }

  if (!item || typeof item !== "object") return null;

  let name = item.name || item.title || item.themeName || currentPalette?.name || "Custom Palette";
  let description = item.description || item.summary || item.rationale || "Refined palette tailored to your specifications.";
  let replyMessage = item.replyMessage || item.reply || item.message || item.chatMessage || "I've updated the colors based on your feedback!";

  let varsRaw = item.variables || item.mapping || item.tokens || item.colors || item.cssVariables || item.palette || item.theme || {};
  let variables: Record<string, string> = {};

  if (varsRaw && typeof varsRaw === "object") {
    if (Array.isArray(varsRaw)) {
      for (const el of varsRaw) {
        if (el && typeof el === "object") {
          if (el.key && el.value) variables[ensureCssVarKey(el.key)] = String(el.value);
          else if (el.name && el.value) variables[ensureCssVarKey(el.name)] = String(el.value);
          else if (el.variable && el.hex) variables[ensureCssVarKey(el.variable)] = String(el.hex);
          else {
            for (const [k, v] of Object.entries(el)) {
              if (typeof v === "string" || typeof v === "number") variables[ensureCssVarKey(k)] = String(v);
            }
          }
        }
      }
    } else {
      for (const [k, v] of Object.entries(varsRaw)) {
        if (typeof v === "string" || typeof v === "number") variables[ensureCssVarKey(k)] = String(v);
      }
    }
  }

  if (Object.keys(variables).length === 0) {
    for (const [k, v] of Object.entries(item)) {
      if (v && typeof v === "object" && !Array.isArray(v) && k !== "name" && k !== "description" && k !== "replyMessage") {
        for (const [propKey, propVal] of Object.entries(v)) {
          if (typeof propVal === "string" || typeof propVal === "number") {
            variables[ensureCssVarKey(propKey)] = String(propVal);
          }
        }
        if (Object.keys(variables).length > 0) break;
      }
    }
  }

  if (currentPalette && currentPalette.variables) {
    for (const [origKey, origVal] of Object.entries(currentPalette.variables)) {
      const normOrigKey = ensureCssVarKey(origKey);
      if (!variables[normOrigKey]) {
        variables[normOrigKey] = String(origVal);
      } else {
        variables[normOrigKey] = preserveShadowOpacity(normOrigKey, variables[normOrigKey], String(origVal));
      }
    }
  }

  for (const [k, v] of Object.entries(variables)) {
    const origVal = currentPalette?.variables ? (currentPalette.variables[k] || currentPalette.variables[k.replace(/^--/, "")]) : undefined;
    variables[k] = preserveShadowOpacity(k, v, origVal ? String(origVal) : undefined);
  }

  if (Object.keys(variables).length === 0) {
    return null;
  }

  return { name, description, variables, replyMessage };
}

async function startServer() {
  const app = express();
  
  // Increase payload limit for screenshot base64 uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // 1. Vision Phase: Upload & Analyze UI Screenshot
  app.post("/api/analyze-ui", async (req, res) => {
    try {
      const { imageBase64, mimeType } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "No imageBase64 provided" });
      }

      // Clean base64 header if present
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      const prompt = `Analyze this UI screenshot image in detail as an elite Front-End Architect, Digital Colorist, & Design Systems Engineer.
Your goal is to recreate this exact UI layout as a responsive, single-page static HTML component using Tailwind CSS utility classes, AND extract an ultra-precise semantic CSS variable color token system.

CRUCIAL ARCHITECTURE RULES:
1. Recreate the layout, hierarchy, cards, typography, navigation, buttons, and visual balance of the screenshot using HTML and Tailwind CSS classes. Do NOT include HTML script tags or JavaScript.
2. DO NOT use hardcoded color utility classes (e.g. NO \`bg-blue-500\`, \`text-gray-900\`, \`border-red-400\`, or inline \`style="color: #123456"\`).
3. Instead, you MUST create semantic CSS design token variables (e.g. \`--bg-base\`, \`--surface-1\`, \`--surface-2\`, \`--text-primary\`, \`--text-secondary\`, \`--text-muted\`, \`--btn-primary\`, \`--btn-text\`, \`--border-accent\`, \`--card-bg\`, \`--accent-color\`, etc.) and apply them in Tailwind classes using arbitrary value syntax: e.g. \`bg-[var(--bg-base)]\`, \`text-[var(--text-primary)]\`, \`border-[var(--border-accent)]\`, \`bg-[var(--btn-primary)]\`, \`text-[var(--btn-text)]\`.
4. Ensure visible element backgrounds, text, borders, and accents use your semantic variables! For box-shadows and drop-shadows, prefer standard Tailwind shadow utilities (e.g., shadow-sm, shadow-md, shadow-lg, shadow-xl, shadow-2xl) with their natural built-in transparency. If you must define custom shadow color variables (e.g. --shadow-color or --card-shadow), you MUST use rgba format with low alpha/opacity (e.g., rgba(15, 23, 42, 0.08) or 8-digit hex with alpha like #0f172a14), never solid 100% opaque 6-digit hex colors!
5. Match the typography style closely. Select 1 or 2 suitable Google Fonts (e.g., 'Inter', 'Space Grotesk', 'Plus Jakarta Sans', 'Outfit', 'Roboto', 'Syne', 'Fira Code', 'Playfair Display') and apply font family classes or inline style font-family on the root wrapper div.
6. Make sure the generated HTML is wrapped in a main root container div like \`<div class="min-h-full w-full p-4 md:p-8 bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-300 font-sans">\` that can be cleanly rendered inside an iframe or container. Include rich placeholder data or realistic text matching the screenshot so the preview looks full and authentic. Use SVG icons (or clean Tailwind badges/icons) where appropriate.
7. BORDER & DIVIDER DISCIPLINE (NO EXCESSIVE BORDERS OR WHITE LINES):
- Do NOT add dividing lines, border outlines, card borders (\`border\`, \`border-r\`, \`border-b\`, \`border-[var(--border-accent)]\`, \`divide-y\`), or box outlines unless a distinct, visible border line is explicitly present in the original screenshot!
- Notice that in sleek modern dark mode dashboards, sidebars, headers, cards, and pills are separated purely by subtle surface background color steps (e.g. sidebar vs main canvas) and generous negative space—NOT by border lines! Never add a bright white or high-contrast vertical line separating a sidebar from main content.
- If the original UI does have a subtle border or divider (e.g., \`--border-accent\`, \`--divider\`), make sure its extracted color code matches the screenshot's ultra-subtle contrast (e.g., in dark mode, a very dark gray or low-opacity white like \`#262626\` or \`rgba(255, 255, 255, 0.08)\`—NEVER a bright or high-contrast white \`#ffffff\` line!).

CRITICAL FOR COLOR ACCURACY ("DIGITAL EYEDROPPER" RULE):
- You MUST act as a high-precision digital eyedropper tool. Look closely at the exact RGB pixels in the screenshot for every background, card surface, button, border, and text element.
- Do NOT substitute generic Tailwind utility hex colors (e.g. do not guess #0f172a or #3b82f6 if the real color in the image is #12131a or #4f46e5).
- Extract the genuine, exact hex codes from the image pixels so the "original" recreation matches the screenshot's color fidelity with 100% precision!
- Create a rich, comprehensive set of tokens (8 to 15 variables) so subtle tonal variations in headers, sidebar backgrounds, card surfaces, and badges are preserved accurately.
- Ensure every token key in "originalMapping" starts with "--" (e.g., "--bg-base").

IMPORTANT: In the returned JSON object, you MUST output "summary", "detectedFonts", and "originalMapping" FIRST, before the large "html" string! This prevents token truncation.

Return ONLY a valid JSON object matching this exact schema:
{
  "summary": "A concise 1-2 sentence description of the UI analyzed (e.g., Modern SaaS analytics dashboard with metrics cards and dark slate theming).",
  "detectedFonts": ["Inter", "Space Grotesk"],
  "originalMapping": {
    "--bg-base": "#12131a",
    "--surface-1": "#1e2029",
    "--surface-2": "#262936",
    "--text-primary": "#f3f4f6",
    "--text-secondary": "#9ca3af",
    "--text-muted": "#6b7280",
    "--btn-primary": "#4f46e5",
    "--btn-text": "#ffffff",
    "--border-accent": "#374151"
  },
  "html": "<div class='min-h-full w-full bg-[var(--bg-base)]...'>...complete HTML code...</div>"
}`;

      const aiResultRaw = await callGeminiJSON([
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: mimeType || "image/png",
                data: cleanBase64,
              },
            },
            { text: prompt },
          ],
        },
      ]);

      const aiResult = normalizeAnalysisResult(aiResultRaw);
      if (!aiResult || !aiResult.html || !aiResult.originalMapping) {
        console.error("[analyze-ui] Normalization failed on raw AI response:", JSON.stringify(aiResultRaw).slice(0, 1500));
        throw new Error("AI response missing required HTML or color mapping");
      }

      res.json(aiResult as AnalysisResult);
    } catch (error: any) {
      console.error("Error in /api/analyze-ui:", error);
      res.status(500).json({ error: error.message || "Failed to analyze UI screenshot" });
    }
  });

  // 2. Theming Phase: Generate 3 Palette Variants
  app.post("/api/generate-palettes", async (req, res) => {
    try {
      const { originalMapping, summary, pastPalettes } = req.body;
      if (!originalMapping) {
        return res.status(400).json({ error: "originalMapping is required" });
      }

      console.log(`[generate-palettes] Request received for summary: "${summary || "N/A"}". Past palettes logged: ${Array.isArray(pastPalettes) ? pastPalettes.length : 0}`);

      const isLightMode = detectThemeMode(originalMapping) === "light";
      const detectedMode = isLightMode ? "LIGHT MODE" : "DARK MODE";
      const modeInstruction = isLightMode
        ? `STRICT LIGHT MODE REQUIREMENT:
The original UI is in LIGHT MODE (light background/surface colors, dark text).
You MUST ONLY generate LIGHT MODE variations!
- All 3 themes MUST have light backgrounds (e.g. #ffffff, #faf9f6, #f8fafc, #f5f5f4, soft warm sandstone, clean ivory, light sage pastel, alabaster) and dark legible text (#0f172a, #1c1917, #18181b, #27272a, etc.).
- NEVER generate a dark mode, midnight, or dark slate theme when the source UI is in light mode. Every single variation MUST be a distinct, beautiful light mode palette.`
        : `STRICT DARK MODE REQUIREMENT:
The original UI is in DARK MODE (dark background/surface colors, light text).
You MUST ONLY generate DARK MODE variations!
- All 3 themes MUST have dark backgrounds (e.g. #09090b, #0f172a, #12131a, #18181b, deep slate, obsidian, midnight navy, dark emerald, deep charcoal) and light legible text (#f8fafc, #f3f4f6, #fafafa, #ffffff, etc.).
- NEVER generate a light mode, white, or bright background theme when the source UI is in dark mode. Every single variation MUST be a distinct, beautiful dark mode palette.`;

      // Build past palettes avoidance block if past palettes exist
      let pastPalettesPromptSection = "";
      if (Array.isArray(pastPalettes) && pastPalettes.length > 0) {
        const pastList = pastPalettes
          .slice(-10) // Keep the last 10 for rich context without overloading tokens
          .map((p: any, i: number) => {
            const sampleVars = Object.entries(p.variables || {})
              .slice(0, 5)
              .map(([k, v]) => `${k}: ${v}`)
              .join(", ");
            return `  ${i + 1}. "${p.name || `Theme ${i + 1}`}": [${sampleVars}]`;
          })
          .join("\n");

        pastPalettesPromptSection = `
PREVIOUSLY GENERATED THEMES IN THIS APP (STRICT NO-DUPLICATE RULE):
The following themes and color schemes have ALREADY been generated for this application session:
${pastList}

CRITICAL: You MUST NOT duplicate or make near-identical copies of any previously generated themes above!
- Explore completely fresh, distinct color directions, accent palettes, surface temperatures (e.g. warm vs cool vs muted), and brand feelings.
- Ensure every new palette brings novel aesthetic variety to the user's workspace.`;
      }

      const prompt = `You are an elite Front-End Architect, Brand Identity Designer, and Color Scientist.
THE BEAUTY AND AESTHETIC COHESION OF THE OUTPUT IS ABSOLUTELY KEY. Users will judge your output on visual excellence, emotional resonance, and world-class design taste.

FIRST: Carefully study this original design's aesthetic, style, domain, and token mapping to understand its vibe:
UI Domain & Vibe Summary: "${summary || "Modern web application UI"}"
Detected UI Theme Mode: ${detectedMode}
Original Semantic Color Variables:
${JSON.stringify(originalMapping, null, 2)}
${pastPalettesPromptSection}

SECOND: Analyze the subtle visual relationships in this UI—how background surfaces, cards, borders, text contrast, and action buttons work together.

THIRD: Think deeply and reason about how the current color palette and brand aesthetic could be enhanced. Generate 3 distinct, world-class color schemes that offer genuine, exciting variety in the redesigns.
Do NOT apply formulaic, canned, or clashing themes. Every palette must feel intentionally crafted by a master colorist who has reasoned deeply about what color pairings, surface depths, and tonal atmospheres would elevate this specific application:
- Ensure the 3 redesigns offer rich, inspiring visual diversity so the user sees a wide range of creative possibilities.
- Each theme should have a clear design philosophy that enhances the UI's visual hierarchy, emotional resonance, and overall polish.

CRITICAL MODE RULE (MANDATORY):
${modeInstruction}

CRITICAL DESIGN RULES:
- Pristine Color Harmony: Ensure backgrounds, cards, borders, text, and buttons create a balanced, beautiful visual hierarchy.
- Readability & WCAG Contrast: Text tokens MUST have optimal contrast against surface tokens. Never place dark text on dark surfaces or light text on light surfaces.
- Complete Token Mapping: You MUST return a value for EVERY single CSS variable key present in originalMapping. Do not omit any keys.
- SHADOWS MUST STAY INTACT & SOFT: Do NOT produce darker or heavier shadows in your variants! If any variable in originalMapping represents a shadow, drop-shadow, or glow (e.g. --shadow, --card-shadow, --shadow-color, --drop-shadow), its intensity and alpha transparency MUST stay intact! You must preserve low opacity/alpha (using rgba like rgba(15, 23, 42, 0.08) or 8-digit hex with alpha like #0f172a14). Never convert soft/transparent shadow variables into solid 100% opaque 6-digit hex codes! At most, change the base color tint to match the theme, but the intensity and softness must NOT become darker!
- BORDER & DIVIDER SUBTLETY: If any variable represents a border or divider (e.g. --border, --border-accent, --divider), ensure its contrast against the background is subtle and soft! Never make borders high-contrast or bright white in a dark theme, or harsh black in a light theme. Keep borders low-opacity or very low contrast against their background surface.

Return ONLY a valid JSON array containing exactly 3 objects. Do NOT include comments or markdown text outside the JSON. Each object MUST have this schema:
{
  "name": "Catchy, Professional Theme Name",
  "description": "A short 2-3 sentence UX/UI rationale explaining why this palette works for this specific app, the mood it evokes, and how it improves visual hierarchy.",
  "variables": {}
}
IMPORTANT: In "variables", map every single key from originalMapping to valid color codes (e.g. "#1a202c" for solid colors, or preserve rgba/8-digit hex for transparent shadow variables so shadows do not become darker). Ensure EVERY variable key begins with the "--" prefix (e.g., "--bg-base").`;

      const systemInstruction = `You are an elite Color Scientist and Design Systems Engineer. You strictly maintain the required theme mode (${detectedMode}): if the original UI is light mode, you ONLY generate light mode palettes. If the original UI is dark mode, you ONLY generate dark mode palettes. You strictly avoid duplicate or redundant palettes compared to previous generations. Return strictly valid JSON.`;

      const variantsRaw = await callGeminiJSON([{ role: "user", parts: [{ text: prompt }] }], systemInstruction);
      
      const variants = normalizePalettes(variantsRaw, originalMapping);
      if (!Array.isArray(variants) || variants.length === 0) {
        console.error("[generate-palettes] Normalization failed on raw AI response:", JSON.stringify(variantsRaw).slice(0, 1500));
        throw new Error("Invalid response from AI: expected array of variants");
      }

      // Deduplicate variants against past generated palettes and against each other in the current batch
      const knownPalettes: Array<Record<string, string>> = [];
      if (Array.isArray(pastPalettes)) {
        for (const p of pastPalettes) {
          if (p?.variables) knownPalettes.push(p.variables);
        }
      }
      // Also add originalMapping
      knownPalettes.push(originalMapping);

      const uniqueVariants: any[] = [];
      for (const variant of variants) {
        const isDuplicate = knownPalettes.some((known) => arePalettesIdentical(variant.variables, known));
        if (!isDuplicate) {
          uniqueVariants.push(variant);
          knownPalettes.push(variant.variables);
        } else {
          console.log(`[generate-palettes] Filtered out duplicate variant: "${variant.name}"`);
        }
      }

      // If all were duplicates (rare), fallback to all returned variants
      const finalVariants = uniqueVariants.length > 0 ? uniqueVariants : variants;

      // Ensure each variant has an ID
      const formattedVariants: PaletteVariant[] = finalVariants.map((v: any, index: number) => ({
        id: `variant-${index + 1}-${Date.now()}`,
        name: v.name || `Variant ${index + 1}`,
        description: v.description || v.rationale || "AI generated color variation.",
        variables: v.variables || {},
      }));

      console.log(`[generate-palettes] Successfully generated ${formattedVariants.length} unique theme variants: ${formattedVariants.map(v => `"${v.name}"`).join(", ")}`);

      res.json({ variants: formattedVariants });
    } catch (error: any) {
      console.error("Error in /api/generate-palettes:", error);
      res.status(500).json({ error: error.message || "Failed to generate palettes" });
    }
  });

  // 3. Refinement Phase: Iterative Chat to Modify Active Palette
  app.post("/api/refine-palette", async (req, res) => {
    try {
      const { currentPalette, userPrompt, chatHistory, allVariables } = req.body;
      if (!currentPalette || !userPrompt) {
        return res.status(400).json({ error: "currentPalette and userPrompt are required" });
      }

      const prompt = `You are an elite AI Color Scientist and UX Designer inside Huey powered by Earhart.
The user is viewing a UI styled with the following color palette ("${currentPalette.name}"):
${JSON.stringify(currentPalette.variables, null, 2)}

User instruction for changes: "${userPrompt}"

Recent conversation context:
${(chatHistory || []).slice(-4).map((m: any) => `${m.sender.toUpperCase()}: ${m.text}`).join("\n")}

Your task is to modify the color mapping according to the user's request while ensuring the output is visually stunning, aesthetically cohesive, and adheres strictly to WCAG accessibility contrast between background and text variables.
Remember: THE BEAUTY AND AESTHETIC COHESION OF THE OUTPUT IS ABSOLUTELY KEY. Never generate harsh, clashing, or unreadable color pairings. Every color must feel curated by a master designer.
SHADOW RULE: Shadows must stay intact! Do NOT produce darker or heavier shadows. If any variable represents a shadow or drop-shadow (e.g. --shadow, --card-shadow, --shadow-color), you MUST preserve its low opacity/alpha transparency (e.g. rgba or 8-digit hex with alpha). At most, change the base color tint to complement the theme, but the intensity must NOT increase!
BORDER RULE: If any variable represents a border or divider (e.g. --border, --border-accent, --divider), keep its contrast subtle and soft against the surface. Never generate bright white or high-contrast borders in dark themes!

Return ONLY a valid JSON object without comments matching this exact schema:
{
  "name": "New Name Reflecting The Changes (e.g. Cyberpunk Neon V2)",
  "description": "1-2 friendly sentences explaining the specific adjustments made and why they achieve the user's goal with elevated design aesthetics.",
  "variables": {},
  "replyMessage": "A conversational, enthusiastic chat response directly answering the user and explaining what you tweaked."
}
IMPORTANT: In "variables", include the exact same keys (with the "--" prefix) as the current palette mapped to modified valid color codes (solid hex for colors, or preserve rgba/8-digit hex for shadows so they do not become darker).`;

      const aiResponseRaw = await callGeminiJSON([{ role: "user", parts: [{ text: prompt }] }]);
      
      const aiResponse = normalizeRefinedPalette(aiResponseRaw, currentPalette);
      if (!aiResponse || !aiResponse.variables) {
        console.error("[refine-palette] Normalization failed on raw AI response:", JSON.stringify(aiResponseRaw).slice(0, 1500));
        throw new Error("AI failed to return refined color variables");
      }

      const newVariant: PaletteVariant = {
        id: `custom-${Date.now()}`,
        name: aiResponse.name || "Custom AI Refinement",
        description: aiResponse.description || "Refined based on your feedback.",
        variables: aiResponse.variables,
        isCustom: true,
      };

      res.json({
        newPalette: newVariant,
        replyMessage: aiResponse.replyMessage || `I've updated the palette to "${newVariant.name}"! Let me know how this looks in the preview canvas.`,
      });
    } catch (error: any) {
      console.error("Error in /api/refine-palette:", error);
      res.status(500).json({ error: error.message || "Failed to refine palette" });
    }
  });

  // 4. Bonus: Analyze Color Accessibility & WCAG Contrast
  app.post("/api/analyze-contrast", async (req, res) => {
    try {
      const { palette, name } = req.body;
      if (!palette) return res.status(400).json({ error: "palette required" });

      const prompt = `Analyze this color theme mapping ("${name || "Theme"}") for UI accessibility and WCAG contrast:
${JSON.stringify(palette, null, 2)}

Evaluate the contrast pairings between background variables (like --bg-base, --surface-1) and text/button variables (like --text-primary, --btn-text).
Return ONLY a JSON object with this schema:
{
  "overallScore": "AA" | "AAA" | "Needs Improvement",
  "summary": "1-2 sentences summarizing accessibility.",
  "pairings": [
    {
      "backgroundVar": "--bg-base",
      "textVar": "--text-primary",
      "contrastRatio": "8.5:1",
      "rating": "Pass (AAA)"
    }
  ]
}`;

      const aiResponse = await callGeminiJSON([{ role: "user", parts: [{ text: prompt }] }]);
      res.json(aiResponse);
    } catch (error: any) {
      console.error("Error in /api/analyze-contrast:", error);
      res.status(500).json({ error: error.message || "Failed contrast analysis" });
    }
  });

  // Vite Middleware Setup for Development & Static Serving for Production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`🚀 Huey Server running on http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal error starting server:", err);
});
