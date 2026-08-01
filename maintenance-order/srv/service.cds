// Service definition replicated from the supplied MaintenanceOrderService $metadata.xml
// Every entity set in the source metadata is annotated Insertable/Updatable/Deletable = false,
// so every entity here is exposed @readonly to match.
// Watermark: Anubhav Trainings — https://anubhavtrainings.com
using { maintenanceorder as db } from '../db/schema';

type ComponentDeepInput {
  ID          : String;
  quantity    : Decimal;
  material_ID : String;
}

type OperationDeepInput {
  ID           : String;
  code         : String;
  type         : String;
  description  : String;
  status       : String;
  durationTime : Decimal;
  durationUnit : String;
  equipment_ID : String;
  component    : many ComponentDeepInput;
}

type MaintenanceOrderDeepInput {
  ID                 : String;
  number             : String;
  description        : String;
  status             : String;
  scheduledStartDate : DateTime;
  scheduledEndDate   : DateTime;
  assignedWorkCenter : String;
  operation          : many OperationDeepInput;
}

type OrderCostResult {
  ID            : String;
  number        : String;
  description   : String;
  totalQuantity : Decimal;
}

type UnfulfillableOrder {
  ID                  : String;
  number              : String;
  description         : String;
  materialCode        : String;
  materialDescription : String;
  availableQuantity   : Decimal;
  threshold           : Decimal;
}

@Core.Links: [{ rel: 'author', href: 'https://anubhavtrainings.com' }]
service MaintenanceOrderService {

  @readonly entity MaintenanceOrder as projection on db.MaintenanceOrder actions {
    // Adds a single Operation to this MaintenanceOrder.
    action addOperation(
      ID           : String,
      code         : String,
      type         : String,
      description  : String,
      status       : String,
      durationTime : Decimal,
      durationUnit : String,
      equipment_ID : String
    ) returns Operation;
  };
  @readonly entity Operation        as projection on db.Operation actions {
    // Adds a single Component to this Operation.
    action addComponent(
      ID          : String,
      quantity    : Decimal,
      material_ID : String
    ) returns Component;
  };
  @readonly entity Note             as projection on db.Note;
  @readonly entity Component        as projection on db.Component;
  @readonly entity Material         as projection on db.Material;
  @readonly entity MaterialStock    as projection on db.MaterialStock;
  @readonly entity StockLevel       as projection on db.StockLevel;
  @readonly entity Equipment        as projection on db.Equipment;

  // Creates a MaintenanceOrder with no children yet.
  action createMaintenanceOrder(
    ID                 : String,
    number             : String,
    description        : String,
    status             : String,
    scheduledStartDate : DateTime,
    scheduledEndDate   : DateTime,
    assignedWorkCenter : String
  ) returns MaintenanceOrder;

  // Creates a MaintenanceOrder together with its operations and their components
  // in a single deep insert.
  action createMaintenanceOrderDeep(order: MaintenanceOrderDeepInput) returns MaintenanceOrder;

  // Order ranked by total component quantity requested across all its operations —
  // used here as a proxy "cost" metric since the model carries no price/cost field.
  function mostExpensiveOrder() returns OrderCostResult;

  // Orders that cannot be fulfilled because at least one required component's
  // material has total available stock below the given threshold.
  function ordersUnfulfillable(threshold: Decimal) returns array of UnfulfillableOrder;

  // Fully computed, non-persisted entities — populated by custom handlers in service.js
  @readonly @cds.persistence.skip
  entity MaintenanceOrderDuration {
    key ID                : String;
        number            : String;
        virtual totalDuration : Decimal;
        virtual timeUnit      : String;
  }

  @readonly @cds.persistence.skip
  entity TotalMaintenanceOrderDuration {
    key ID                    : String;
        virtual totalDuration : Decimal;
        virtual timeUnit      : String;
  }
}

annotate MaintenanceOrderService.MaintenanceOrderDuration with {
  totalDuration @Core.Computed;
  timeUnit      @Core.Computed;
};

annotate MaintenanceOrderService.TotalMaintenanceOrderDuration with {
  totalDuration @Core.Computed;
  timeUnit      @Core.Computed;
};

annotate MaintenanceOrderService.MaterialStock with {
  stockTotal @Core.Computed;
};
