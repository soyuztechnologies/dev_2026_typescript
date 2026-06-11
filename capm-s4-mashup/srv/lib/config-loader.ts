import 'dotenv/config';
import type { S4Config, ODataVersion } from '../types/sales-order';

// OData V4 service binding for the Sales Order (A2X) service.
// Kept here (not in .env) so the env only holds the host/credentials.
const SALES_ORDER_SERVICE_PATH =
  '/sap/opu/odata4/sap/api_salesorder/srvd_a2x/sap/salesorder/0001';

// Read and validate the S/4HANA configuration from .env
export function loadS4Config(): S4Config {
  const host = process.env.S4_URL ?? '';
  const username = process.env.S4_USERNAME ?? '';
  const password = process.env.S4_PASSWORD ?? '';

  if (!host || !username || !password) {
    throw new Error('Missing S4_URL / S4_USERNAME / S4_PASSWORD in .env');
  }

  // Combine host (from .env) with the service path (defined above).
  const url = host.replace(/\/+$/, '') + SALES_ORDER_SERVICE_PATH;

  return { url, username, password, odataVersion: detectVersion(url) };
}

// Decide the protocol by inspecting the URL
export function detectVersion(url: string): ODataVersion {
  return url.includes('/odata4/') ? 'v4' : 'v2';
}

// Type guard: is this a V2 config?
export function isODataV2(config: S4Config): config is S4Config & { odataVersion: 'v2' } {
  return config.odataVersion === 'v2';
}

// Type guard: is this a V4 config?
export function isODataV4(config: S4Config): config is S4Config & { odataVersion: 'v4' } {
  return config.odataVersion === 'v4';
}