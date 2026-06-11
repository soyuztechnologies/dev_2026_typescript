import type { SalesOrderInput, SalesOrderItemInput } from '../types/sales-order';

// Narrow `unknown` to an object we can index
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function requireString(obj: Record<string, unknown>, field: string): string {
  const v = obj[field];
  if (typeof v !== 'string' || v.length === 0) {
    throw new Error(`Field "${field}" is required and must be a non-empty string.`);
  }
  return v;
}

function parseItem(raw: unknown): SalesOrderItemInput {
  if (!isRecord(raw)) throw new Error('Each item must be an object.');
  return {
    salesOrderItem: requireString(raw, 'salesOrderItem'),
    material: requireString(raw, 'material'),
    requestedQuantity: requireString(raw, 'requestedQuantity'),
    requestedQuantityUnit: requireString(raw, 'requestedQuantityUnit'),
  };
}

// The public entry point: unknown JSON -> validated SalesOrderInput
export function parseSalesOrder(raw: unknown): SalesOrderInput {
  if (!isRecord(raw)) throw new Error('Payload must be a JSON object.');

  const itemsRaw = raw['items'];
  if (!Array.isArray(itemsRaw) || itemsRaw.length === 0) {
    throw new Error('At least one item is required.');
  }

  return {
    salesOrderType: requireString(raw, 'salesOrderType'),
    salesOrganization: requireString(raw, 'salesOrganization'),
    distributionChannel: requireString(raw, 'distributionChannel'),
    organizationDivision: requireString(raw, 'organizationDivision'),
    salesDistrict: requireString(raw, 'salesDistrict'),
    soldToParty: requireString(raw, 'soldToParty'),
    salesOrderDate: requireString(raw, 'salesOrderDate'),
    items: itemsRaw.map(parseItem),
  };
}