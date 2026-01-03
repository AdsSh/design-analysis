export interface ColorPaletteItem {
  hex: string;
  name: string;
  usage: string;
}

export interface TypographyItem {
  family: string;
  weight: string;
  role: string;
  size?: string;
}

export interface AssetAlternative {
  type: 'Component' | 'Icon' | 'Logo' | 'Image';
  currentDescription: string;
  suggestion: string;
  reasoning: string;
  url?: string;
}

export interface DesignAnalysis {
  score: number;
  critique: string;
  colors: ColorPaletteItem[];
  typography: TypographyItem[];
  layoutAnalysis: string;
  improvements: string[];
  alternatives: AssetAlternative[];
}

export type AnalysisStepStatus = 'pending' | 'active' | 'completed';

export interface AnalysisStep {
  id: string;
  label: string;
  description: string;
  status: AnalysisStepStatus;
  logs?: string[];
}

export type AppView = 'upload' | 'analyzing' | 'results';