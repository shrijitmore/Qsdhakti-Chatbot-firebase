import type { Factory, Inspection, PurchaseOrder } from './types';
import { subDays, formatISO } from 'date-fns';

export const factories: Factory[] = [
  { id: 1, name: 'Alpha Manufacturing', location: 'Shenzhen, China', sections: ['Building A', 'Building B', 'Building C'] },
  { id: 2, name: 'Beta Components', location: 'Hanoi, Vietnam', sections: ['Main Wing', 'West Wing'] },
  { id: 3, name: 'Gamma Assembly', location: 'Penang, Malaysia', sections: ['Floor 1', 'Floor 2'] },
];

export const purchaseOrders: PurchaseOrder[] = [
  { id: 'PO-001', itemCode: 'IC-456', factoryId: 1, status: 'Completed' },
  { id: 'PO-002', itemCode: 'TR-789', factoryId: 2, status: 'In Production' },
  { id: 'PO-003', itemCode: 'IC-456', factoryId: 1, status: 'Delayed' },
  { id: 'PO-004', itemCode: 'PS-101', factoryId: 3, status: 'Shipped' },
  { id: 'PO-005', itemCode: 'TR-789', factoryId: 2, status: 'In Production' },
];

const generateParameters = (base: number, unit: string, count: number) => {
  const operators = ['Op-101', 'Op-102', 'Op-103'];
  return Array.from({ length: count }, (_, i) => ({
    name: 'Diameter',
    value: parseFloat((base + (Math.random() - 0.5) * 0.1).toFixed(3)),
    unit,
    operator: operators[i % operators.length],
    timestamp: formatISO(subDays(new Date(), i)),
  }));
};

export const inspections: Inspection[] = [
  {
    id: 'INSP-1001',
    poId: 'PO-001',
    factoryId: 1,
    section: 'Building A',
    itemCode: 'IC-456',
    type: 'Final',
    parameters: generateParameters(5.0, 'mm', 10),
  },
  {
    id: 'INSP-1002',
    poId: 'PO-002',
    factoryId: 2,
    section: 'Main Wing',
    itemCode: 'TR-789',
    type: 'In-process',
    parameters: [
      { name: 'Resistance', value: 15.2, unit: 'Ohm', operator: 'Op-201', timestamp: formatISO(subDays(new Date(), 2)) },
      { name: 'Capacitance', value: 101.5, unit: 'pF', operator: 'Op-202', timestamp: formatISO(subDays(new Date(), 1)) },
    ],
  },
  {
    id: 'INSP-1003',
    poId: 'PO-003',
    factoryId: 1,
    section: 'Building B',
    itemCode: 'IC-456',
    type: 'In-process',
    parameters: generateParameters(5.0, 'mm', 5),
  },
  {
    id: 'INSP-1004',
    poId: 'PO-004',
    factoryId: 3,
    section: 'Floor 1',
    itemCode: 'PS-101',
    type: 'Inward',
    parameters: [{ name: 'Voltage', value: 12.05, unit: 'V', operator: 'Op-301', timestamp: formatISO(subDays(new Date(), 5)) }],
  },
    {
    id: 'INSP-1005',
    poId: 'PO-001',
    factoryId: 1,
    section: 'Building A',
    itemCode: 'IC-456',
    type: 'In-process',
    parameters: generateParameters(5.0, 'mm', 20),
  },
];
