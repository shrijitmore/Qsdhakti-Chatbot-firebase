import { factories, inspections, purchaseOrders } from './data';
import type { Option } from './types';
import { parseISO, isAfter, subDays, format } from 'date-fns';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export async function getInitialData() {
    try {
        const [factoriesRes, purchaseOrdersRes, itemCodesRes, parametersRes, operationsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/plants/`),
            fetch(`${API_BASE_URL}/productionplanners/`),
            fetch(`${API_BASE_URL}/itemmasters/`),
            fetch(`${API_BASE_URL}/parameterlists/`),
            fetch(`${API_BASE_URL}/operationmasters/`),
        ]);

        const [factoriesJson, poJson, itemsJson, paramsJson, opsJson] = await Promise.all([
            factoriesRes.json(), purchaseOrdersRes.json(), itemCodesRes.json(), parametersRes.json(), operationsRes.json()
        ]);

        console.log('[API] factories:', factoriesJson);
        console.log('[API] productionplanners:', poJson);
        console.log('[API] itemmasters:', itemsJson);
        console.log('[API] parameterlists:', paramsJson);
        console.log('[API] operationmasters:', opsJson);

        const factories = Array.isArray(factoriesJson) ? factoriesJson : [];
        const purchaseOrders = Array.isArray(poJson) ? poJson : [];
        const itemCodes = Array.isArray(itemsJson) ? itemsJson : [];
        const parameters = Array.isArray(paramsJson) ? paramsJson : [];
        const operations = Array.isArray(opsJson) ? opsJson : [];

        const itemCodeMap = new Map<string, string>();
        itemCodes.forEach((ic: any) => {
            itemCodeMap.set(String(ic.id), ic.item_code);
        });

        return {
            factories: factories.map((f: any) => ({ label: f.plant_name || f.name || String(f.id ?? f.pk ?? f.plant_id), value: String(f.id ?? f.pk) })),
            purchaseOrders: purchaseOrders.map((po: any) => ({ id: String(po.id ?? po.order_number), factoryId: String(po.plant ?? po.plant_id ?? po.plantId ?? ''), itemCode: String(po.item_code ?? po.item_code_id ?? ''), status: po.status, section: po.section })),
            itemCodes: itemCodes.map((ic: any) => ({ factoryId: String(ic.plant ?? ic.plant_id ?? ''), section: String(ic.building ?? ic.building_id ?? ''), label: ic.item_code, value: ic.item_code })),
            parameters: parameters.map((p: any) => ({ factoryId: String(p.plant ?? p.plant_id ?? ''), itemCode: String(p.item_code ?? ''), label: p.inspection_parameter, value: p.inspection_parameter })),
            operations: operations.map((op: any) => ({ factoryId: String(op.plant ?? op.plant_id ?? ''), itemCode: itemCodeMap.get(String(op.item_code)), label: op.operation_name, value: op.operation_name })),
        };
    } catch (err) {
        console.error('[API] getInitialData error:', err);
        return { factories: [], purchaseOrders: [], itemCodes: [], parameters: [], operations: [] };
    }
}

export async function getPurchaseOrderStatus(poId: string) {
    const poRes = await fetch(`${API_BASE_URL}/productionplanners/${poId}/`);
    if (!poRes.ok) return null;
    const po = await poRes.json();

    return {
        'PO Number': po.order_number,
        'Item': po.item_code,
        'Status': po.status,
        'Customer Name': po.customer_name,
        'Start Date': po.start_date,
        'Target Date': po.target_date,
    };
}

export async function getPurchaseOrdersByFactory(factoryId: string) {
  const res = await fetch(`${API_BASE_URL}/productionplanners/?plant=${encodeURIComponent(factoryId)}`);
  if (!res.ok) return [] as { id: string }[];
  const data = await res.json();
  console.log('[API] productionplanners by plant', factoryId, data);
  return (Array.isArray(data) ? data : []).map((po: any) => ({
    id: String(po.order_number ?? po.id),
  }));
}

export async function getFactorySections(factoryId: number): Promise<Option[]> {
  const sectionsRes = await fetch(`${API_BASE_URL}/buildingsectionlabs/?plant=${factoryId}`);
  const sections = await sectionsRes.json();
  console.log('[API] sections by plant', factoryId, sections);
  return sections.map((s: any) => ({ label: s.building_name, value: s.id.toString() }));
}

export async function getItemCodesByFactorySection(factoryId: string, sectionId: string, itemType?: 'RM' | 'SFG' | 'FG') {
  const url = new URL(`${API_BASE_URL}/itemmasters/`);
  url.searchParams.set('building', sectionId);
  if (itemType) url.searchParams.set('item_type', itemType);
  const res = await fetch(url.toString());
  if (!res.ok) return [] as { label: string; value: string }[];
  const data = await res.json();
  console.log('[API] itemmasters by building', { factoryId, sectionId, itemType, sample: data?.[0] });
  return (Array.isArray(data) ? data : []).map((ic: any) => ({
    label: ic.item_code,
    value: ic.item_code,
  }));
}

export async function getFilteredInspections(filters: {
  factoryId: number;
  section: string;
  itemCode: string;
  type: 'Inward' | 'In-process' | 'Final';
  poId: string;
}) {
  const params = new URLSearchParams({
    plant_id: filters.factoryId.toString(),
    building: filters.section,
    item_code: filters.itemCode,
    inspection_type: filters.type,
    po_no: filters.poId,
  });
  
  // Fetch actual readings instead of just schedule
  const readingsRes = await fetch(`${API_BASE_URL}/inspections/actual-readings/?${params.toString()}`);
  const data = await readingsRes.json();
  
  console.log('[API] actual inspection readings:', data);
  
  if (!data.readings || data.readings.length === 0) {
    return [];
  }
  
  // Group readings by schedule_id
  const groupedBySchedule = data.readings.reduce((acc: any, reading: any) => {
    if (!acc[reading.schedule_id]) {
      acc[reading.schedule_id] = {
        id: reading.schedule_id,
        factoryId: reading.plant_id,
        section: reading.building_id,
        itemCode: reading.item_code,
        type: reading.inspection_type,
        poId: reading.po_no || reading.io_no,
        operationName: reading.operation_name,
        parameters: []
      };
    }
    
    acc[reading.schedule_id].parameters.push({
      name: reading.parameter_name,
      value: reading.r_value,  // Use actual r_value instead of target_value
      unit: reading.unit || '',
      timestamp: reading.timestamp,
      lsl: reading.lsl,
      usl: reading.usl,
      operator: reading.operator,
      r_key: reading.r_key,
    });
    
    return acc;
  }, {});
  
  return Object.values(groupedBySchedule);
}

export async function getParameterAnalysis(factoryId: number, itemCode: string, operation: string, parameter: string) {
  const params = new URLSearchParams({
    plant_id: factoryId.toString(),
    item_code: itemCode,
    operation: operation,
    inspection_parameter_name: parameter,
  });
  const inspectionsRes = await fetch(`${API_BASE_URL}/inspectionschedules/?${params.toString()}`);
  const inspections = await inspectionsRes.json();

  const relevantParams = inspections.map((i: any) => ({
    value: i.target_value,
    unit: '', // Placeholder
    operator: i.created_by, // Assuming created_by is the operator
    lsl: i.lsl,
    usl: i.usl,
  }));

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
  };
}

export async function getParameterDistribution(context: 'Inward' | 'In-process' | 'Final', factoryId: number, section: string, itemCode: string) {
    const params = new URLSearchParams({
        inspection_type: context,
        plant_id: factoryId.toString(),
        building: section,
        item_code: itemCode,
    });
    const inspectionsRes = await fetch(`${API_BASE_URL}/inspectionschedules/?${params.toString()}`);
    const inspections = await inspectionsRes.json();

    if (inspections.length === 0) return null;

    const operations = inspections.map((i: any) => i.operation).filter(Boolean);
    const parameters = inspections.map((i: any) => i.inspection_parameter_name);

    return {
        'Operations': [...new Set(operations)].join(', '),
        'Parameters': [...new Set(parameters)].join(', '),
    };
}

export async function getParameterSeriesAndStats(
  factoryId: number,
  itemCode: string,
  operation: string,
  parameter: string,
  days?: number
) {
  const now = new Date();
  const cutoff = days ? subDays(now, days) : null;

  const params = new URLSearchParams({
    plant_id: factoryId.toString(),
    item_code: itemCode,
    operation: operation,
    inspection_parameter_name: parameter,
  });
  const inspectionsRes = await fetch(`${API_BASE_URL}/inspectionschedules/?${params.toString()}`);
  const inspections = await inspectionsRes.json();

  let readings = inspections.map((i: any) => ({
    name: i.inspection_parameter_name,
    value: i.target_value,
    unit: '', // Placeholder
    operator: i.created_by, // Assuming created_by is the operator
    timestamp: i.created_at,
    lsl: i.lsl,
    usl: i.usl,
    target: i.target_value,
  })).filter((p) => (cutoff ? isAfter(parseISO(p.timestamp), cutoff) : true))
  .sort((a, b) => parseISO(a.timestamp).getTime() - parseISO(b.timestamp).getTime());

  if (readings.length === 0) return null;

  const values = readings.map((r) => r.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((s, v) => s + v, 0) / values.length;
  const unit = readings[0].unit;

  const spec = {
    lsl: readings[0].lsl,
    usl: readings[0].usl,
    target: readings[0].target,
    unit,
  };

  const enriched = readings.map((r) => {
    const isOOS = (spec.lsl !== undefined && r.value < spec.lsl) || (spec.usl !== undefined && r.value > spec.usl);
    return {
      timestamp: r.timestamp,
      value: r.value,
      unit: r.unit,
      operator: r.operator,
      status: isOOS ? 'OOS' : 'OK' as const,
    };
  });

  const series = readings.map((r) => ({
    label: format(parseISO(r.timestamp), 'dd MMM'),
    value: r.value,
  }));

  return {
    series,
    stats: {
      min: `${min.toFixed(3)} ${unit}`,
      max: `${max.toFixed(3)} ${unit}`,
      avg: `${avg.toFixed(3)} ${unit}`,
      count: readings.length,
      unit,
    },
    spec,
    readings: enriched,
    oos: enriched.filter((e) => e.status === 'OOS'),
  };
}

export async function getLSLUSLDistribution(
  factoryId: number,
  itemCode: string,
  operation: string,
  parameter: string,
  days?: number
) {
  const analysis = await getParameterSeriesAndStats(factoryId, itemCode, operation, parameter, days);
  if (!analysis) return null;

  // derive LSL/USL if missing
  let lsl = analysis.spec.lsl;
  let usl = analysis.spec.usl;
  if (lsl === undefined || usl === undefined || usl === lsl) {
    const vals = (analysis.readings || []).map((r) => r.value);
    if (vals.length > 0) {
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      if (min !== max) {
        lsl = min;
        usl = max;
      } else {
        lsl = min;
        usl = min + 1; // ensure span
      }
    } else {
      lsl = 0; usl = 1;
    }
  }

  const labels = ['<LSL', '0-20%', '20-40%', '40-60%', '60-80%', '80-100%', '>USL'] as const;
  const counts: Record<(typeof labels)[number], number> = {
    '<LSL': 0,
    '0-20%': 0,
    '20-40%': 0,
    '40-60%': 0,
    '60-80%': 0,
    '80-100%': 0,
    '>USL': 0,
  };

  const span = (usl! - lsl!);
  (analysis.readings || []).forEach((r) => {
    if (lsl !== undefined && r.value < lsl) {
      counts['<LSL'] += 1;
      return;
    }
    if (usl !== undefined && r.value > usl) {
      counts['>USL'] += 1;
      return;
    }
    if (lsl === undefined || usl === undefined || span <= 0) {
      // cannot bucket without a valid range
      return;
    }
    const ratio = (r.value - lsl) / span; // 0..1 inclusive
    const idx = Math.min(4, Math.max(0, Math.floor(ratio * 5))); // 5 in-spec buckets
    const bucket = labels[idx + 1];
    counts[bucket] += 1;
  });

  const data = labels.map((lab) => ({ value: lab, count: counts[lab] }));

  return {
    data,
    xAxisLabel: 'LSL / USL',
    yAxisLabel: 'No. of counts',
  };
}
