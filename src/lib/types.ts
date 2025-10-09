export interface PurchaseOrder {
  id: string;
  itemCode: string;
  factoryId: number;
  status: string; // Simplified from enum for broader data
}

export interface Factory {
  id: number;
  name: string;
  location: string; // Location can be derived or kept static
  sections: string[];
}

export interface InspectionParameter {
  name: string;
  value: number;
  unit: string;
  operator: string;
  timestamp: string;
  lsl?: number;
  usl?: number;
  target?: number;
}

export interface Inspection {
  id: string;
  poId: string;
  factoryId: number;
  section: string;
  itemCode: string;
  type: 'Inward' | 'In-process' | 'Final';
  parameters: InspectionParameter[];
  operationName?: string;
  summary?: {
    accepted: number;
    rejected: number;
  }
}

export interface Option {
  label: string;
  value: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: React.ReactNode;
}
