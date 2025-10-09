'use server';

import { factories, inspections, purchaseOrders } from './data';
import type { Option } from './types';

const simulateLatency = () => new Promise(res => setTimeout(res, 300 + Math.random() * 400));

export async function getInitialData() {
    const factoryOptions = factories.map(f => ({ label: f.name, value: f.id.toString() }));

    const allPurchaseOrders = purchaseOrders.map(po => ({ ...po, factoryId: po.factoryId.toString()}));

    const allItemCodes = inspections.map(i => ({
        factoryId: i.factoryId.toString(),
        section: i.section,
        label: i.itemCode,
        value: i.itemCode
    })).filter((item, index, self) => self.findIndex(t => t.label === item.label && t.factoryId === item.factoryId && t.section === item.section) === index);

    const allParameters = inspections.flatMap(i => i.parameters.map(p => ({
        factoryId: i.factoryId.toString(),
        itemCode: i.itemCode,
        label: p.name,
        value: p.name
    }))).filter((param, index, self) => self.findIndex(t => t.label === param.label) === index);
    
    const allOperations = inspections.filter(i => i.operationName).map(i => ({
        factoryId: i.factoryId.toString(),
        itemCode: i.itemCode,
        label: i.operationName!,
        value: i.operationName!
    })).filter((op, index, self) => self.findIndex(t => t.label === op.label) === index);

    return {
        factories: factoryOptions,
        purchaseOrders: allPurchaseOrders,
        itemCodes: allItemCodes,
        parameters: allParameters,
        operations: allOperations,
    };
}

export async function getPurchaseOrderStatus(poId: string) {
    await simulateLatency();
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) return null;

    const relevantInspections = inspections.filter(i => i.poId === poId);
    const item = inspections.find(i => i.itemCode === po.itemCode)?.itemCode || 'N/A';

    let details = '';
    relevantInspections.forEach(i => {
        if(i.summary) {
            details += `Inspection ${i.id}: Accepted: ${i.summary.accepted}, Rejected: ${i.summary.rejected}. `;
        }
        if(i.parameters.length > 0) {
            const values = i.parameters.map(p => p.value);
            details += `Readings for ${i.parameters[0].name}: [${values.join(', ')}]. `
            if(i.parameters[0].lsl !== undefined && i.parameters[0].usl !== undefined) {
                details += `Spec: [${i.parameters[0].lsl}-${i.parameters[0].usl}]. `;
            }
        }
    });

    return {
        'PO Number': po.id,
        'Item': item,
        'Total Inspections': relevantInspections.length,
        'Status': po.status,
        'Details': details.trim(),
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
}) {
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
