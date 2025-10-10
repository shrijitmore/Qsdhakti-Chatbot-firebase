import type { Factory, Inspection, PurchaseOrder } from './types';
import { subDays, formatISO } from 'date-fns';

export const factories: Factory[] = [
  { id: 1, name: 'AMMUNITION FACTORY KHADKI', location: 'Khadki, India', sections: ['C4', 'LAB'] },
  { id: 2, name: 'ORDNANCE FACTORY DEHUROAD', location: 'Dehu Road, India', sections: ['139/136', '132', '134'] },
];

export const purchaseOrders: PurchaseOrder[] = [
  { id: '1004', itemCode: '5514634032', factoryId: 1, status: 'Partially Completed' },
  { id: 'D-2074', itemCode: '1000000014', factoryId: 2, status: 'In-process' },
  { id: 'D-2069', itemCode: '1000000014', factoryId: 2, status: 'In-process' },
  { id: 'D-2070', itemCode: '1000000013', factoryId: 2, status: 'Completed' },
];

export const inspections: Inspection[] = [
  // Factory 1 (AMMUNITION FACTORY KHADKI) - PO 1004
  // In-process Inspections
  {
    id: '1',
    poId: '1004',
    factoryId: 1,
    section: 'C4',
    itemCode: '5514634032',
    type: 'In-process',
    operationName: 'I&II DRAW & TRIMMING HS-I',
    summary: { accepted: 2, rejected: 2 },
    parameters: [
      { name: 'VISUAL', value: 2, unit: 'defects', operator: 'Arpit Turkar', timestamp: formatISO(subDays(new Date(), 1)), lsl: 6, target: 10, usl: 14 },
      { name: 'VISUAL', value: 8, unit: 'defects', operator: 'Arpit Turkar', timestamp: formatISO(subDays(new Date(), 2)), lsl: 6, target: 10, usl: 14 },
      { name: 'VISUAL', value: 12, unit: 'defects', operator: 'Arpit Turkar', timestamp: formatISO(subDays(new Date(), 3)), lsl: 6, target: 10, usl: 14 },
      { name: 'VISUAL', value: 10, unit: 'defects', operator: 'Arpit Turkar', timestamp: formatISO(subDays(new Date(), 4)), lsl: 6, target: 10, usl: 14 },
    ],
  },
  {
    id: '2',
    poId: '1004',
    factoryId: 1,
    section: 'LAB',
    itemCode: '5514634032',
    type: 'In-process',
    operationName: 'Checking of Solution Strength from Lab',
    parameters: [
      { name: 'Strength', value: 9, unit: '%', operator: 'Arpit Turkar', timestamp: formatISO(subDays(new Date(), 2)), lsl: 8, target: 12, usl: 16 },
      { name: 'Strength', value: 11, unit: '%', operator: 'Arpit Turkar', timestamp: formatISO(subDays(new Date(), 3)), lsl: 8, target: 12, usl: 16 },
      { name: 'Strength', value: 10, unit: '%', operator: 'Arpit Turkar', timestamp: formatISO(subDays(new Date(), 4)), lsl: 8, target: 12, usl: 16 },
      { name: 'Strength', value: 13, unit: '%', operator: 'Arpit Turkar', timestamp: formatISO(subDays(new Date(), 5)), lsl: 8, target: 12, usl: 16 },
      { name: 'Strength', value: 12, unit: '%', operator: 'Arpit Turkar', timestamp: formatISO(subDays(new Date(), 6)), lsl: 8, target: 12, usl: 16 },
    ],
  },

  // Inward Inspections for Factory 1
  {
    id: '15',
    poId: '1004',
    factoryId: 1,
    section: 'C4',
    itemCode: '5514634032',
    type: 'Inward',
    operationName: 'Raw Material Inspection',
    summary: { accepted: 98, rejected: 2 },
    parameters: [
      { name: 'Dimension Check', value: 5.55, unit: 'mm', operator: 'Arpit Turkar', timestamp: formatISO(subDays(new Date(), 7)), lsl: 5.5, target: 5.56, usl: 5.6 },
      { name: 'Dimension Check', value: 5.56, unit: 'mm', operator: 'Arpit Turkar', timestamp: formatISO(subDays(new Date(), 8)), lsl: 5.5, target: 5.56, usl: 5.6 },
      { name: 'Dimension Check', value: 5.58, unit: 'mm', operator: 'Arpit Turkar', timestamp: formatISO(subDays(new Date(), 9)), lsl: 5.5, target: 5.56, usl: 5.6 },
    ],
  },

  // Final Inspections for Factory 1
  {
    id: '16',
    poId: '1004',
    factoryId: 1,
    section: 'C4',
    itemCode: '5514634032',
    type: 'Final',
    operationName: 'Final Assembly Inspection',
    summary: { accepted: 95, rejected: 5 },
    parameters: [
      { name: 'Overall Quality', value: 92, unit: '%', operator: 'Arpit Turkar', timestamp: formatISO(subDays(new Date(), 10)), lsl: 85, target: 95, usl: 100 },
      { name: 'Overall Quality', value: 96, unit: '%', operator: 'Arpit Turkar', timestamp: formatISO(subDays(new Date(), 11)), lsl: 85, target: 95, usl: 100 },
      { name: 'Overall Quality', value: 94, unit: '%', operator: 'Arpit Turkar', timestamp: formatISO(subDays(new Date(), 12)), lsl: 85, target: 95, usl: 100 },
    ],
  },

  // Factory 2 (ORDNANCE FACTORY DEHUROAD) - PO D-2074
  // Final Inspections
  {
    id: '3',
    poId: 'D-2074',
    factoryId: 2,
    section: '139/136',
    itemCode: '1000000014',
    type: 'Final',
    operationName: 'Ingredient preparation for composition SR-252',
    parameters: [
      { name: 'Charge Mass of compo. ME-433', value: 61, unit: 'gm', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 3)), lsl: 60, target: 65, usl: 70 },
      { name: 'Charge Mass of compo. ME-433', value: 64, unit: 'gm', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 4)), lsl: 60, target: 65, usl: 70 },
      { name: 'Charge Mass of compo. ME-433', value: 67, unit: 'gm', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 5)), lsl: 60, target: 65, usl: 70 },
      { name: 'Charge Mass of compo. ME-433', value: 65, unit: 'gm', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 6)), lsl: 60, target: 65, usl: 70 },
    ],
  },
  {
    id: '4',
    poId: 'D-2074',
    factoryId: 2,
    section: '139/136',
    itemCode: '1000000014',
    type: 'Final',
    operationName: 'Ingredient preparation for composition SR-252',
    summary: { accepted: 2, rejected: 0 },
    parameters: [
      { name: 'Weight of Mg.Powder', value: 58, unit: 'gm', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 4)), lsl: 57, target: 60, usl: 61 },
      { name: 'Weight of Mg.Powder', value: 60, unit: 'gm', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 5)), lsl: 57, target: 60, usl: 61 },
    ],
  },

  // Inward Inspections for Factory 2 - PO D-2074
  {
    id: '17',
    poId: 'D-2074',
    factoryId: 2,
    section: '139/136',
    itemCode: '1000000014',
    type: 'Inward',
    operationName: 'Raw Material Receipt Inspection',
    summary: { accepted: 48, rejected: 2 },
    parameters: [
      { name: 'Material Quality', value: 95, unit: '%', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 7)), lsl: 90, target: 97, usl: 100 },
      { name: 'Material Quality', value: 98, unit: '%', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 8)), lsl: 90, target: 97, usl: 100 },
    ],
  },

  // In-process Inspections for Factory 2 - PO D-2074
  {
    id: '18',
    poId: 'D-2074',
    factoryId: 2,
    section: '139/136',
    itemCode: '1000000014',
    type: 'In-process',
    operationName: 'Mixing Process Monitoring',
    parameters: [
      { name: 'Mixing Time', value: 11, unit: 'min', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 9)), lsl: 10, target: 12, usl: 14 },
      { name: 'Mixing Time', value: 12, unit: 'min', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 10)), lsl: 10, target: 12, usl: 14 },
      { name: 'Mixing Time', value: 13, unit: 'min', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 11)), lsl: 10, target: 12, usl: 14 },
    ],
  },

  // Factory 2 - PO D-2069
  {
    id: '5',
    poId: 'D-2069',
    factoryId: 2,
    section: '132',
    itemCode: '1000000014',
    type: 'Final',
    operationName: 'Ingredient Preparation (Potassium Chlorate)',
    parameters: [
      { name: 'Check Filled box 37A, Container, Pickets, 75 A', value: 71, unit: 'count', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 5)), lsl: 70, target: 75, usl: 80 },
      { name: 'Check Filled box 37A, Container, Pickets, 75 A', value: 75, unit: 'count', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 6)), lsl: 70, target: 75, usl: 80 },
      { name: 'Check Filled box 37A, Container, Pickets, 75 A', value: 79, unit: 'count', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 7)), lsl: 70, target: 75, usl: 80 },
      { name: 'Check Filled box 37A, Container, Pickets, 75 A', value: 73, unit: 'count', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 8)), lsl: 70, target: 75, usl: 80 },
    ],
  },
  {
    id: '6',
    poId: 'D-2069',
    factoryId: 2,
    section: '132',
    itemCode: '1000000014',
    type: 'Final',
    operationName: 'Ingredient Preparation (Potassium Chlorate)',
    parameters: [
      { name: 'Verification of Acceptance details', value: 65, unit: 'score', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 6)), lsl: 60, target: 70, usl: 75 },
      { name: 'Verification of Acceptance details', value: 70, unit: 'score', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 7)), lsl: 60, target: 70, usl: 75 },
      { name: 'Verification of Acceptance details', value: 72, unit: 'score', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 8)), lsl: 60, target: 70, usl: 75 },
    ],
  },

  // Inward Inspections for Factory 2 - PO D-2069
  {
    id: '19',
    poId: 'D-2069',
    factoryId: 2,
    section: '132',
    itemCode: '1000000014',
    type: 'Inward',
    operationName: 'Chemical Ingredient Verification',
    summary: { accepted: 97, rejected: 3 },
    parameters: [
      { name: 'Purity Level', value: 98.5, unit: '%', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 9)), lsl: 97, target: 99, usl: 100 },
      { name: 'Purity Level', value: 99.1, unit: '%', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 10)), lsl: 97, target: 99, usl: 100 },
    ],
  },

  // In-process Inspections for Factory 2 - PO D-2069
  {
    id: '20',
    poId: 'D-2069',
    factoryId: 2,
    section: '132',
    itemCode: '1000000014',
    type: 'In-process',
    operationName: 'Packaging Quality Check',
    parameters: [
      { name: 'Seal Strength', value: 45, unit: 'N', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 11)), lsl: 40, target: 50, usl: 60 },
      { name: 'Seal Strength', value: 52, unit: 'N', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 12)), lsl: 40, target: 50, usl: 60 },
      { name: 'Seal Strength', value: 48, unit: 'N', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 13)), lsl: 40, target: 50, usl: 60 },
    ],
  },

  // Factory 2 - PO D-2070 - Item 1000000013
  {
    id: '7',
    poId: 'D-2070',
    factoryId: 2,
    section: '134',
    itemCode: '1000000013',
    type: 'Final',
    operationName: 'Ingredient Preparation (Potassium Chlorate)',
    summary: { accepted: 2, rejected: 0 },
    parameters: [
      { name: 'Ensure proper container packing 75 A', value: 65, unit: 'score', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 7)), lsl: 57, target: 67, usl: 70 },
      { name: 'Ensure proper container packing 75 A', value: 68, unit: 'score', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 8)), lsl: 57, target: 67, usl: 70 },
    ],
  },
  {
    id: '8',
    poId: 'D-2070',
    factoryId: 2,
    section: '134',
    itemCode: '1000000013',
    type: 'Final',
    operationName: 'Mixing of Compo.ME-425',
    summary: { accepted: 2, rejected: 1 },
    parameters: [
      { name: 'Weight of BLO', value: 59, unit: 'gm', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 8)), lsl: 57, target: 60, usl: 63 },
      { name: 'Weight of BLO', value: 60, unit: 'gm', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 9)), lsl: 57, target: 60, usl: 63 },
      { name: 'Weight of BLO', value: 61, unit: 'gm', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 10)), lsl: 57, target: 60, usl: 63 },
    ],
  },
  {
    id: '9',
    poId: 'D-2070',
    factoryId: 2,
    section: '134',
    itemCode: '1000000013',
    type: 'Final',
    operationName: 'Mixing of Compo.ME-425',
    parameters: [
      { name: 'Verification of Acceptance details', value: 53, unit: 'score', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 9)), lsl: 51, target: 57, usl: 57 },
      { name: 'Verification of Acceptance details', value: 57, unit: 'score', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 10)), lsl: 51, target: 57, usl: 57 },
      { name: 'Verification of Acceptance details', value: 52, unit: 'score', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 11)), lsl: 51, target: 57, usl: 57 },
      { name: 'Verification of Acceptance details', value: 55, unit: 'score', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 12)), lsl: 51, target: 57, usl: 57 },
    ],
  },
  {
    id: '10',
    poId: 'D-2070',
    factoryId: 2,
    section: '134',
    itemCode: '1000000013',
    type: 'Final',
    operationName: 'Mixing of Compo.ME-425',
    parameters: [
      { name: 'Check Filled box 37A, Container, Pickets, 75 A', value: 54, unit: 'count', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 10)), lsl: 52, target: 58, usl: 58 },
      { name: 'Check Filled box 37A, Container, Pickets, 75 A', value: 57, unit: 'count', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 11)), lsl: 52, target: 58, usl: 58 },
      { name: 'Check Filled box 37A, Container, Pickets, 75 A', value: 56, unit: 'count', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 12)), lsl: 52, target: 58, usl: 58 },
    ],
  },
  {
    id: '11',
    poId: 'D-2070',
    factoryId: 2,
    section: '134',
    itemCode: '1000000013',
    type: 'Final',
    operationName: 'Ingredient preparation for composition SR-252',
    parameters: [
      { name: 'Check Proper Crimping, Ferrule Crack', value: 59, unit: 'score', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 11)), lsl: 57, target: 60, usl: 63 },
      { name: 'Check Proper Crimping, Ferrule Crack', value: 61, unit: 'score', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 12)), lsl: 57, target: 60, usl: 63 },
    ],
  },
  {
    id: '12',
    poId: 'D-2070',
    factoryId: 2,
    section: '134',
    itemCode: '1000000013',
    type: 'Final',
    operationName: 'Ingredient preparation for composition SR-252',
    parameters: [
      { name: 'Check Dwell time', value: 56, unit: 'sec', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 12)), lsl: 54, target: 60, usl: 60 },
      { name: 'Check Dwell time', value: 59, unit: 'sec', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 13)), lsl: 54, target: 60, usl: 60 },
      { name: 'Check Dwell time', value: 58, unit: 'sec', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 14)), lsl: 54, target: 60, usl: 60 },
    ],
  },
  {
    id: '13',
    poId: 'D-2070',
    factoryId: 2,
    section: '134',
    itemCode: '1000000013',
    type: 'Final',
    operationName: 'Ingredient preparation for composition SR-252',
    parameters: [
      { name: 'Wt. of SMP', value: 55, unit: 'gm', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 13)), lsl: 53, target: 59, usl: 59 },
      { name: 'Wt. of SMP', value: 58, unit: 'gm', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 14)), lsl: 53, target: 59, usl: 59 },
    ],
  },
  {
    id: '14',
    poId: 'D-2070',
    factoryId: 2,
    section: '134',
    itemCode: '1000000013',
    type: 'Final',
    operationName: 'Mixing of composition SR-252',
    parameters: [
      { name: 'Check Crimping Strength', value: 59, unit: 'N', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 14)), lsl: 57, target: 60, usl: 63 },
      { name: 'Check Crimping Strength', value: 61, unit: 'N', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 15)), lsl: 57, target: 60, usl: 63 },
      { name: 'Check Crimping Strength', value: 60, unit: 'N', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 16)), lsl: 57, target: 60, usl: 63 },
    ],
  },

  // Inward Inspections for Factory 2 - PO D-2070
  {
    id: '21',
    poId: 'D-2070',
    factoryId: 2,
    section: '134',
    itemCode: '1000000013',
    type: 'Inward',
    operationName: 'Raw Material Acceptance',
    summary: { accepted: 195, rejected: 5 },
    parameters: [
      { name: 'Material Certification', value: 97, unit: '%', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 15)), lsl: 95, target: 98, usl: 100 },
      { name: 'Material Certification', value: 98, unit: '%', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 16)), lsl: 95, target: 98, usl: 100 },
    ],
  },

  // In-process Inspections for Factory 2 - PO D-2070
  {
    id: '22',
    poId: 'D-2070',
    factoryId: 2,
    section: '134',
    itemCode: '1000000013',
    type: 'In-process',
    operationName: 'Composition Mixing',
    parameters: [
      { name: 'Mixing Homogeneity', value: 92, unit: '%', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 17)), lsl: 85, target: 95, usl: 100 },
      { name: 'Mixing Homogeneity', value: 96, unit: '%', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 18)), lsl: 85, target: 95, usl: 100 },
      { name: 'Mixing Homogeneity', value: 94, unit: '%', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 19)), lsl: 85, target: 95, usl: 100 },
    ],
  },
];
