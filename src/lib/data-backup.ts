import type { Factory, Inspection, PurchaseOrder } from './types';
import { subDays, formatISO } from 'date-fns';

export const factories: Factory[] = [
  { id: 1, name: 'AMMUNITION FACTORY KHADKI', location: 'Khadki, India', sections: ['C4', 'LAB'] },
  { id: 2, name: 'ORDNANCE FACTORY DEHUROAD', location: 'Dehu Road, India', sections: ['134', '139/136', '132'] },
];

export const purchaseOrders: PurchaseOrder[] = [
  { id: '1004', itemCode: '5514634032', factoryId: 1, status: 'Partially Completed' },
  { id: 'D-2074', itemCode: '1000000014', factoryId: 2, status: 'In-process' },
  { id: 'D-2069', itemCode: '1000000014', factoryId: 2, status: 'In-process' },
  { id: 'D-2070', itemCode: '1000000013', factoryId: 2, status: 'Completed' },
];

export const inspections: Inspection[] = [
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
        { name: 'VISUAL', value: 0, unit: 'count', operator: 'Arpit Turkar', timestamp: formatISO(subDays(new Date(), 1)) }
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
      { name: 'Strength', value: 11, unit: '%', operator: 'Arpit Turkar', timestamp: formatISO(subDays(new Date(), 2)), lsl: 8, target: 12, usl: 16 },
      { name: 'Strength', value: 10, unit: '%', operator: 'Arpit Turkar', timestamp: formatISO(subDays(new Date(), 2)), lsl: 8, target: 12, usl: 16 },
    ],
  },
  {
    id: '3',
    poId: 'D-2074',
    factoryId: 2,
    section: '139/136',
    itemCode: '1000000014',
    type: 'Final',
    operationName: 'Ingredient preparation for composition SR-252',
    parameters: [
      { name: 'Charge Mass of compo. ME-433', value: 1, unit: 'gm', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 3)), lsl: 60, target: 65, usl: 70 },
      { name: 'Charge Mass of compo. ME-433', value: 0, unit: 'gm', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 3)), lsl: 60, target: 65, usl: 70 },
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
        { name: 'Weight of Mg.Powder', value: 0, unit: 'count', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 4)) }
    ],
  },
  {
    id: '5',
    poId: 'D-2069',
    factoryId: 2,
    section: '132',
    itemCode: '1000000014',
    type: 'Final',
    parameters: [
      { name: 'Check Filled box 37A, Container, Pickets, 75 A', value: 71, unit: 'count', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 5)) },
      { name: 'Check Filled box 37A, Container, Pickets, 75 A', value: 75, unit: 'count', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 5)) },
      { name: 'Check Filled box 37A, Container, Pickets, 75 A', value: 79, unit: 'count', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 5)) },
    ],
  },
  {
    id: '6',
    poId: 'D-2069',
    factoryId: 2,
    section: '132',
    itemCode: '1000000014',
    type: 'Final',
    parameters: [
      { name: 'Verification of Acceptance details', value: 0, unit: 'bool', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 6)) },
      { name: 'Verification of Acceptance details', value: 1, unit: 'bool', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 6)) },
      { name: 'Verification of Acceptance details', value: 1, unit: 'bool', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 6)) },
    ],
  },
  {
    id: '7',
    poId: 'D-2070',
    factoryId: 2,
    section: '134',
    itemCode: '1000000013',
    type: 'Inward',
    summary: { accepted: 2, rejected: 0},
    parameters: [
       { name: 'Verification of Acceptance details', value: 1, unit: 'bool', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 7)) },
    ],
  },
  {
    id: '8',
    poId: 'D-2070',
    factoryId: 2,
    section: '134',
    itemCode: '1000000013',
    type: 'Inward',
    summary: { accepted: 2, rejected: 1},
    parameters: [
       { name: 'Verification of Acceptance details', value: 0, unit: 'bool', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 8)) },
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
        { name: 'Verification of Acceptance details', value: 53, unit: 'rating', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 9)), lsl: 51, target: 57, usl: 57 },
        { name: 'Verification of Acceptance details', value: 57, unit: 'rating', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 9)), lsl: 51, target: 57, usl: 57 },
        { name: 'Verification of Acceptance details', value: 52, unit: 'rating', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 9)), lsl: 51, target: 57, usl: 57 },
    ]
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
        { name: 'Check Dwell time', value: 0, unit: 'bool', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 10)) },
        { name: 'Check Dwell time', value: 1, unit: 'bool', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 10)) },
        { name: 'Check Dwell time', value: 1, unit: 'bool', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 10)) },
    ]
  },
  {
    id: '11',
    poId: 'D-2070',
    factoryId: 2,
    section: '134',
    itemCode: '1000000013',
    type: 'Final',
    operationName: 'Mixing of Compo.ME-425',
    parameters: [
        { name: 'Wt. of SMP', value: 2, unit: 'gm', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 11)) },
    ]
  },
  {
    id: '12',
    poId: 'D-2070',
    factoryId: 2,
    section: '134',
    itemCode: '1000000013',
    type: 'Final',
    operationName: 'Mixing of Compo.ME-425',
    parameters: [
        { name: 'Check Crimping Strength', value: 1, unit: 'bool', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 12)) },
        { name: 'Check Crimping Strength', value: 1, unit: 'bool', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 12)) },
        { name: 'Check Crimping Strength', value: 1, unit: 'bool', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 12)) },
    ]
  },
  {
    id: '13',
    poId: 'D-2070',
    factoryId: 2,
    section: '134',
    itemCode: '1000000013',
    type: 'Final',
    operationName: 'Mixing of Compo.ME-425',
    parameters: [
        { name: 'Check Proper Crimping, Ferrule Crack', value: 1, unit: 'bool', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 13)) },
        { name: 'Check Proper Crimping, Ferrule Crack', value: 1, unit: 'bool', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 13)) },
    ]
  },
  {
    id: '14',
    poId: 'D-2070',
    factoryId: 2,
    section: '134',
    itemCode: '1000000013',
    type: 'Final',
    operationName: 'Mixing of Compo.ME-425',
    parameters: [
        { name: 'Weight of BLO', value: 1, unit: 'bool', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 14)) },
        { name: 'Weight of BLO', value: 0, unit: 'bool', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 14)) },
        { name: 'Weight of BLO', value: 0, unit: 'bool', operator: 'Arpit Dehu Road', timestamp: formatISO(subDays(new Date(), 14)) },
    ]
  }
];
