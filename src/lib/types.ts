export interface PurchaseOrder {
  id: string;
  itemCode: string;
  factoryId: number;
  status: 'In Production' | 'Completed' | 'Delayed' | 'Shipped';
}

export interface Factory {
  id: number;
  name: string;
  location: string;
  sections: string[];
}

export interface InspectionParameter {
  name: string;
  value: number;
  unit: string;
  operator: string;
  timestamp: string;
}

export interface Inspection {
  id: string;
  poId: string;
  factoryId: number;
  section: string;
  itemCode: string;
  type: 'Inward' | 'In-process' | 'Final';
  parameters: InspectionParameter[];
}

export type ChatMessage = {
  id: string;
  role: 'user' | 'bot';
  content: React.ReactNode;
};

export type Option = {
  label: string;
  value: string;
};
