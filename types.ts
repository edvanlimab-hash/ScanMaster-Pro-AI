
export enum AppTab {
  SCAN = 'scan',
  CREATE = 'create',
  HISTORY = 'history',
  SETTINGS = 'settings'
}

export interface ScanResult {
  id: string;
  type: string;
  data: string;
  timestamp: number;
  aiAnalysis?: string;
}

export type CodeType = 'QR_CODE' | 'EAN_13' | 'UPC_A' | 'CODE_128';

export interface CreateFormData {
  type: CodeType;
  content: string;
}
