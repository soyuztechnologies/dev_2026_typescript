// Custom handlers for the computed / non-persisted entities of MaintenanceOrderService.
// Watermark: Anubhav Trainings — https://anubhavtrainings.com
import cds from '@sap/cds';

export default cds.service.impl(async function () {
  const { MaintenanceOrder, Operation, Component, Material, StockLevel,
          MaintenanceOrderDuration, TotalMaintenanceOrderDuration, MaterialStock } = this.entities;

  this.on('createMaintenanceOrder', async req => {
    const order = { status: 'CRTD', ...req.data };
    await INSERT.into(MaintenanceOrder).entries(order);
    return SELECT.one.from(MaintenanceOrder, order.ID);
  });

  this.on('addOperation', MaintenanceOrder, async req => {
    const orderID = req.params[0].ID ?? req.params[0];
    const operation = { status: 'CRTD', ...req.data, maintenanceOrder_ID: orderID };
    await INSERT.into(Operation).entries(operation);
    return SELECT.one.from(Operation, operation.ID);
  });

  this.on('addComponent', Operation, async req => {
    const operationID = req.params[0].ID ?? req.params[0];
    const component = { ...req.data, operation_ID: operationID };
    await INSERT.into(Component).entries(component);
    return SELECT.one.from(Component, component.ID);
  });

  this.on('createMaintenanceOrderDeep', async req => {
    // MaintenanceOrder.operation and Operation.component are plain Associations
    // (not Compositions), so the framework's automatic deep-insert propagation
    // doesn't apply here — the nested rows are cascaded into their own tables by hand.
    const { operation = [], ...order } = req.data.order;
    order.status = order.status || 'CRTD';
    await INSERT.into(MaintenanceOrder).entries(order);

    for (const op of operation) {
      const { component = [], ...opRest } = op;
      const opEntry = { status: 'CRTD', ...opRest, maintenanceOrder_ID: order.ID };
      await INSERT.into(Operation).entries(opEntry);

      for (const comp of component) {
        await INSERT.into(Component).entries({ ...comp, operation_ID: opEntry.ID });
      }
    }

    return SELECT.one.from(MaintenanceOrder, order.ID);
  });

  this.on('mostExpensiveOrder', async () => {
    const orders = await SELECT.from(MaintenanceOrder).columns('ID', 'number', 'description');
    const operations = await SELECT.from(Operation).columns('ID', 'maintenanceOrder_ID');
    const components = await SELECT.from(Component).columns('quantity', 'operation_ID');

    const costByOrder = orders.map(order => {
      const opIDs = operations.filter(op => op.maintenanceOrder_ID === order.ID).map(op => op.ID);
      const totalQuantity = components
        .filter(c => opIDs.includes(c.operation_ID))
        .reduce((sum, c) => sum + Number(c.quantity || 0), 0);
      return { ...order, totalQuantity };
    });

    return costByOrder.reduce((max, curr) => (curr.totalQuantity > (max?.totalQuantity ?? -1) ? curr : max), null);
  });

  this.on('ordersUnfulfillable', async req => {
    const { threshold } = req.data;

    const orders = await SELECT.from(MaintenanceOrder).columns('ID', 'number', 'description');
    const operations = await SELECT.from(Operation).columns('ID', 'maintenanceOrder_ID');
    const components = await SELECT.from(Component).columns('quantity', 'operation_ID', 'material_ID');
    const materials = await SELECT.from(Material).columns('ID', 'materialCode', 'materialDescription');
    const stockLevels = await SELECT.from(StockLevel).columns('material_ID', 'availableQuantity');

    const stockByMaterial = id =>
      stockLevels.filter(s => s.material_ID === id).reduce((sum, s) => sum + Number(s.availableQuantity || 0), 0);

    const result = [];
    for (const order of orders) {
      const opIDs = operations.filter(op => op.maintenanceOrder_ID === order.ID).map(op => op.ID);
      const orderComponents = components.filter(c => opIDs.includes(c.operation_ID));

      for (const comp of orderComponents) {
        const available = stockByMaterial(comp.material_ID);
        if (available < threshold) {
          const material = materials.find(m => m.ID === comp.material_ID);
          result.push({
            ...order,
            materialCode: material?.materialCode,
            materialDescription: material?.materialDescription,
            availableQuantity: available,
            threshold
          });
          break;
        }
      }
    }
    return result;
  });

  this.on('READ', MaintenanceOrderDuration, async () => {
    const orders = await SELECT.from(MaintenanceOrder).columns('ID', 'number');
    const operations = await SELECT.from(Operation).columns('maintenanceOrder_ID', 'durationTime', 'durationUnit');

    return orders.map(order => {
      const ops = operations.filter(op => op.maintenanceOrder_ID === order.ID);
      const totalDuration = ops.reduce((sum, op) => sum + Number(op.durationTime || 0), 0);
      const timeUnit = ops[0]?.durationUnit || 'H';
      return { ID: order.ID, number: order.number, totalDuration, timeUnit };
    });
  });

  this.on('READ', TotalMaintenanceOrderDuration, async () => {
    const operations = await SELECT.from(Operation).columns('durationTime', 'durationUnit');
    const totalDuration = operations.reduce((sum, op) => sum + Number(op.durationTime || 0), 0);
    const timeUnit = operations[0]?.durationUnit || 'H';
    return [{ ID: 'TOTAL', totalDuration, timeUnit }];
  });

  this.after('READ', MaterialStock, async (rows) => {
    const list = Array.isArray(rows) ? rows : [rows];
    if (!list.length) return;

    const materials = await SELECT.from(Material).columns('ID', 'materialCode');
    const stockLevels = await SELECT.from(StockLevel).columns('material_ID', 'availableQuantity');

    for (const row of list) {
      if (!row) continue;
      const material = materials.find(m => m.materialCode === row.materialCode);
      row.stockTotal = material
        ? stockLevels
            .filter(s => s.material_ID === material.ID)
            .reduce((sum, s) => sum + Number(s.availableQuantity || 0), 0)
        : 0;
    }
  });
});
