export interface ColorMapping {
  [variableName: string]: string; // e.g., "--surface-1": "#1e1e24", "--text-primary": "#f8f9fa"
}

export interface VariableMetadata {
  name: string; // e.g. "--surface-1"
  label: string; // e.g. "Primary Background Surface"
  originalHex: string;
  category: 'background' | 'text' | 'border' | 'accent' | 'other';
}

export interface PaletteVariant {
  id: string; // "original", "variant-1", "variant-2", "variant-3", or custom id from chat
  name: string;
  description: string;
  variables: ColorMapping;
  isCustom?: boolean;
}

export interface AnalysisResult {
  html: string;
  originalMapping: ColorMapping;
  variableMetadata?: VariableMetadata[];
  detectedFonts: string[];
  summary: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
  paletteCreated?: PaletteVariant;
}

export interface PresetSample {
  id: string;
  title: string;
  category: string;
  description: string;
  badge: string;
  svgDataUrl: string; // Clean high-fidelity SVG/image representation of UI
}
