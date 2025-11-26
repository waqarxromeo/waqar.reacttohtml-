export interface FileContent {
  path: string;
  content: string;
  type: 'file' | 'directory';
}

export interface ProcessingStatus {
  step: 'idle' | 'extracting' | 'analyzing' | 'generating' | 'completed' | 'error';
  message: string;
  progress?: number;
}

export enum ModelType {
  GEMINI_FLASH = 'gemini-2.5-flash',
  GEMINI_PRO = 'gemini-3-pro-preview',
}
