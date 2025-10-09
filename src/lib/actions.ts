'use server';

import { factories, inspections, purchaseOrders } from './data';
import type { Factory, Inspection, PurchaseOrder } from './types';
import { parseISO, isAfter } from 'date-fns';

const simulateLatency = () => new Promise(res => setTimeout(res, 300 + Math.random() * 400));

export async function getInitialData() {
  await simulateLatency();
  return {
    factories: factories.map(f => ({ label: f.name, value: f.id.toString() })),
    purchaseOrders: purchaseOrders.map(p => ({ label: p.id, value: p.id })),
    itemCodes: [...new Set(inspections.map(i => i.itemCode))].map(ic => ({ label: ic, value: ic })),
    parameters: [...new Set(inspections.flatMap(i => i.parameters.map(p => p.name)))].map(p => ({ label: p, value: p })),
  };
}

export async function getPurchaseOrderStatus(poId: string): Promise<PurchaseOrder | undefined> {
  await simulateLatency();
  return purchaseOrders.find(p => p.id === poId);
}

export async function getFactorySections(factoryId: number): Promise<{ label: string, value: string }[]> {
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

export async function getParameterAnalysis(parameter: string, durationDays: number) {
  await simulateLatency();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - durationDays);

  const relevantData = inspections
    .flatMap(i => i.parameters)
    .filter(p => p.name === parameter && isAfter(parseISO(p.timestamp), cutoffDate))
    .sort((a, b) => parseISO(a.timestamp).getTime() - parseISO(b.timestamp).getTime());

  if (relevantData.length === 0) return null;

  const values = relevantData.map(p => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  const unit = relevantData[0].unit;

  return {
    stats: {
      min: `${min.toFixed(3)} ${unit}`,
      max: `${max.toFixed(3)} ${unit}`,
      avg: `${avg.toFixed(3)} ${unit}`,
      count: relevantData.length,
    },
    runChartData: relevantData.map(p => ({
      date: parseISO(p.timestamp).toLocaleDateString(),
      value: p.value,
    })),
  };
}


export async function getParameterDistribution(itemCode: string, parameter: string) {
  await simulateLatency();
  const relevantParams = inspections
    .filter(i => i.itemCode === itemCode)
    .flatMap(i => i.parameters)
    .filter(p => p.name === parameter);

  if (relevantParams.length === 0) return null;
    
  const valueCounts = relevantParams.reduce((acc, p) => {
    // Group by rounding to create buckets
    const bucket = p.value.toFixed(2);
    acc[bucket] = (acc[bucket] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const distributionData = Object.entries(valueCounts)
    .map(([value, count]) => ({
      value: parseFloat(value),
      count,
    }))
    .sort((a,b) => a.value - b.value);

  return distributionData;
}
