'use server';

import { factories, inspections, purchaseOrders } from './data';
import type { Factory, Inspection, PurchaseOrder, Option } from './types';
import { parseISO, isAfter } from 'date-fns';

const simulateLatency = () => new Promise(res => setTimeout(res, 300 + Math.random() * 400));

export async function getInitialData() {
    await simulateLatency();
    const factoryOptions = factories.map(f => ({ label: f.name, value: f.id.toString() }));
    
    const poOptions = (factoryId: number) => {
        return purchaseOrders.filter(po => po.factoryId === factoryId).map(po => ({ label: po.id, value: po.id }));
    }

    const itemCodeOptions = (factoryId: number, section?: string) => {
        const itemCodes = inspections
            .filter(i => i.factoryId === factoryId && (!section || i.section === section))
            .map(i => i.itemCode);
        return [...new Set(itemCodes)].map(ic => ({label: ic, value: ic}));
    }

    const parameterOptions = (factoryId: number, itemCode?: string) => {
        const parameters = inspections
            .filter(i => i.factoryId === factoryId && (!itemCode || i.itemCode === itemCode))
            .flatMap(i => i.parameters.map(p => p.name));
        return [...new Set(parameters)].map(p => ({label: p, value: p}));
    }

    const operationOptions = (factoryId: number, itemCode?: string) => {
        const operations = inspections
            .filter(i => i.factoryId === factoryId && i.operationName && (!itemCode || i.itemCode === itemCode))
            .map(i => i.operationName!);
        return [...new Set(operations)].map(op => ({label: op, value: op}));
    }

    return {
        factories: factoryOptions,
        getPurchaseOrders: poOptions,
        getItemCodes: itemCodeOptions,
        getParameters: parameterOptions,
        getOperations: operationOptions,
    };
}

export async function getPurchaseOrderStatus(poId: string): Promise<any> {
    await simulateLatency();
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) return null;

    const relevantInspections = inspections.filter(i => i.poId === poId);
    const item = inspections.find(i => i.itemCode === po.itemCode)?.itemCode || 'N/A';

    const inspectionSummaries = relevantInspections.map(i => {
        let details = '';
        if (i.summary) {
            details = `Accepted: ${i.summary.accepted}, Rejected: ${i.summary.rejected}`;
        } else if (i.parameters.length > 0) {
            const readings = i.parameters.map(p => p.value).join(', ');
            details = `Readings: [${readings}]`;
            if(i.parameters[0].lsl !== undefined && i.parameters[0].usl !== undefined) {
                details += ` vs. Spec [${i.parameters[0].lsl}-${i.parameters[0].usl}]`;
            }
        }
        return `Inspection ${i.id}: ${details}`;
    });

    return {
        'PO Number': po.id,
        'Item': item,
        'Total Inspections': relevantInspections.length,
        'Status': po.status,
        'Details': inspectionSummaries.join('\n'),
    };
}

export async function getFactorySections(factoryId: number): Promise<Option[]> {
  await simulateLatency();
  const factory = factories.find(f => f.id === factoryId);
  return factory ? factory.sections.map(s => ({ label: s, value: s })) : [];
}

export async function getFilteredInspections(filters: {
  factoryId: number;
  section: string;
  itemCode: string;
  type: 'Inward' | 'In-process' | 'Final';
  poId: string;
}): Promise<Inspection[]> {
  await simulateLatency();
  return inspections.filter(i =>
    i.factoryId === filters.factoryId &&
    i.section === filters.section &&
    i.itemCode === filters.itemCode &&
    i.type === filters.type &&
    i.poId === filters.poId
  );
}

export async function getParameterAnalysis(factoryId: number, itemCode: string, operation: string, parameter: string) {
  await simulateLatency();

  const relevantParams = inspections
    .filter(i => i.factoryId === factoryId && i.itemCode === itemCode && i.operationName === operation)
    .flatMap(i => i.parameters)
    .filter(p => p.name === parameter);

  if (relevantParams.length === 0) return null;

  const values = relevantParams.map(p => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  const unit = relevantParams[0].unit;
  const operator = relevantParams[0].operator;
  const { lsl, usl } = relevantParams[0];
  
  const outsideSpec = values.filter(v => (lsl !== undefined && v < lsl) || (usl !== undefined && v > usl));

  return {
    'Average Reading': `${avg.toFixed(3)} ${unit}`,
    'Min Reading': `${min.toFixed(3)} ${unit}`,
    'Max Reading': `${max.toFixed(3)} ${unit}`,
    'Readings Outside Spec': outsideSpec.length > 0 ? outsideSpec.join(', ') : 'None',
    'Operator': operator,
  };
}


export async function getParameterDistribution(context: 'Inward' | 'In-process' | 'Final', factoryId: number, section: string, itemCode: string) {
    await simulateLatency();
    const relevantInspections = inspections
        .filter(i => i.type === context && i.factoryId === factoryId && i.section === section && i.itemCode === itemCode);

    if (relevantInspections.length === 0) return null;

    const operations = relevantInspections.map(i => i.operationName).filter(Boolean);
    const parameters = relevantInspections.flatMap(i => i.parameters.map(p => p.name));

    return {
        'Operations': [...new Set(operations)].join(', '),
        'Parameters': [...new Set(parameters)].join(', '),
    };
}
