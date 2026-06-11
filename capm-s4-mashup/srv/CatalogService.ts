import cds from '@sap/cds';
import BigNumber from 'bignumber.js';
import { Material, Plant } from '#cds-models/CatalogService';
import { loadS4Config } from './lib/config-loader';
import { parseSalesOrder } from './lib/payload-parser';
import type { SalesOrderView } from './types/sales-order';
import { sapS4OpSalesorder0001V1 as salesOrderService } from './src/generated/sap-s4-OP_SALESORDER_0001-v1';

export class CatalogService extends cds.ApplicationService {
  async init(): Promise<void> {
    // --- Step 1 local validations ---
    this.before('CREATE', 'Materials', this.validateMaterialName);
    this.before('UPDATE', 'Materials', this.checkPlantExists);
    this.before('CREATE', 'Plants', this.checkStorageLocationLimit);

    // --- Step 3 remote mashup ---
    this.on('getSalesOrders', this.getSalesOrders);
    this.on('createSalesOrder', this.createSalesOrder);

    return super.init();
  }

  private validateMaterialName = (req: cds.Request): void => {
    const { materialName } = req.data as Material;
    if (!materialName || materialName.length !== 40) {
      req.reject(400, 'Material name must be exactly 40 characters long.');
      return;
    }
    if (/^[0-9]/.test(materialName)) {
      req.reject(400, 'Material name must not start with a number.');
    }
  };

  private checkPlantExists = async (req: cds.Request): Promise<void> => {
    const plantId = (req.data as Material).plant_ID;
    if (!plantId) return;
    const found = await SELECT.one.from(Plant).where({ ID: plantId });
    if (!found) req.reject(404, `Plant ${plantId} does not exist.`);
  };

  private checkStorageLocationLimit = async (req: cds.Request): Promise<void> => {
    const { storageLocation } = req.data as Plant;
    if (!storageLocation) return;
    const existing = await SELECT.from(Plant).where({ storageLocation });
    if (existing.length >= 2) {
      req.reject(409, `Storage location ${storageLocation} already has 2 plants.`);
    }
  };

  private getSalesOrders = async (): Promise<SalesOrderView[]> => {
    const cfg = loadS4Config();
    const service = salesOrderService();
    const orders = await service.salesOrderApi
      .requestBuilder()
      .getAll()
      // expand the item lines so the detail view can show them in a table
      .expand(service.salesOrderApi.schema.ITEM)
      .top(20)
      .execute({ url: cfg.url, username: cfg.username, password: cfg.password });

    return orders.map((o) => ({
      salesOrder: o.salesOrder,
      salesOrderType: o.salesOrderType ?? '',
      soldToParty: o.soldToParty ?? '',
      salesOrganization: o.salesOrganization ?? '',
      items: (o.item ?? []).map((it) => ({
        salesOrderItem: it.salesOrderItem ?? '',
        material: it.product ?? '',
        // requestedQuantity is an Edm.Decimal (BigNumber) - send it as a string
        requestedQuantity: it.requestedQuantity?.toString() ?? '',
        requestedQuantityUnit: it.requestedQuantitySapUnit ?? it.requestedQuantityIsoUnit ?? '',
      })),
    }));
  };

  private createSalesOrder = async (req: cds.Request): Promise<SalesOrderView> => {
    const cfg = loadS4Config();
    const input = parseSalesOrder(req.data.order);

    const service = salesOrderService();
    const api = service.salesOrderApi;

    // Map the validated input items to S/4HANA SalesOrderItem entities.
    // Note the S/4 field names: material -> product, unit -> requestedQuantityIsoUnit
    // (S/4 expects the ISO unit code, e.g. "PC", here — not the SAP-internal code).
    // Do not send salesOrderItem: S/4 rejects external item numbering through
    // this channel ("External numbering is not supported"), so let it auto-number.
    const items = input.items.map((it) =>
      service.salesOrderItemApi
        .entityBuilder()
        .product(it.material)
        .requestedQuantity(new BigNumber(it.requestedQuantity))
        .requestedQuantityIsoUnit(it.requestedQuantityUnit)
        .build()
    );

    const newOrder = api.entityBuilder()
      .salesOrderType(input.salesOrderType)
      .salesOrganization(input.salesOrganization)
      .distributionChannel(input.distributionChannel)
      .organizationDivision(input.organizationDivision)
      .salesDistrict(input.salesDistrict)
      .soldToParty(input.soldToParty)
      .item(items)
      .build();

    // The SDK converts the camelCase entity to PascalCase OData on the wire,
    // so log the target URL; the real diagnostic is the S/4 error body below.
    console.log('[createSalesOrder] →', cfg.url + '/SalesOrder');

    try {
      const created = await api.requestBuilder()
        .create(newOrder)
        .execute({ url: cfg.url, username: cfg.username, password: cfg.password });

      return {
        salesOrder: created.salesOrder,
        salesOrderType: created.salesOrderType ?? '',
        soldToParty: created.soldToParty ?? '',
        salesOrganization: created.salesOrganization ?? '',
        // S/4 does not echo the created items on this response, so return what we sent
        items: input.items.map((it) => ({
          salesOrderItem: it.salesOrderItem ?? '',
          material: it.material ?? '',
          requestedQuantity: it.requestedQuantity ?? '',
          requestedQuantityUnit: it.requestedQuantityUnit ?? '',
        })),
      };
    } catch (err: any) {
      // Surface the real S/4 response instead of a generic 500.
      const status = err?.response?.status ?? err?.status;
      const body = err?.response?.data ?? err?.rootCause?.response?.data;
      console.error('[createSalesOrder] S/4 error status:', status);
      console.error('[createSalesOrder] S/4 error body:', JSON.stringify(body, null, 2));
      req.reject(status ?? 500, body?.error?.message ?? err?.message ?? 'S/4 call failed');
    }
  };
}