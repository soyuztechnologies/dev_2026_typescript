// Domain model replicated from the supplied MaintenanceOrderService $metadata.xml
// Watermark: Anubhav Trainings — https://anubhavtrainings.com
namespace maintenanceorder;

entity MaintenanceOrder {
  key ID                 : String;
      number              : String;
      description         : localized String;
      status              : String;
      scheduledStartDate  : DateTime;
      scheduledEndDate    : DateTime;
      assignedWorkCenter  : String;
      operation           : Association to many Operation on operation.maintenanceOrder = $self;
}

entity Operation {
  key ID           : String;
      code         : String;
      type         : localized String;
      description  : localized String;
      status       : String;
      durationTime : Decimal;
      durationUnit : String;

      maintenanceOrder : Association to MaintenanceOrder;
      note             : Association to many Note on note.operation = $self;
      component        : Association to many Component on component.operation = $self;
      equipment        : Association to Equipment;
      operation        : Association to Operation;
      subOperation     : Composition of many Operation on subOperation.operation = $self;
}

entity Note {
  key ID        : String;
      content   : String;
      operation : Association to Operation;
}

entity Component {
  key ID        : String;
      quantity  : Decimal;
      material  : Association to Material;
      operation : Association to Operation;
}

entity Material {
  key ID                  : String;
      materialCode        : String;
      materialDescription : localized String;
      component           : Association to many Component on component.material = $self;
      stockLevel          : Composition of many StockLevel on stockLevel.material = $self;
}

// Read-only aggregated stock view, mirrored from the source service.
// materialCode is used to correlate back to Material since the source
// metadata exposes no foreign key on this entity.
entity MaterialStock {
  key ID                  : String;
      materialCode        : String;
      materialDescription : String;
      material            : Association to Material;
      component           : Association to many Component on component.material = material;
      stockLevel          : Association to many StockLevel on stockLevel.material = material;
      virtual stockTotal  : Decimal;
}

entity StockLevel {
  key ID                : String;
      warehouse         : String;
      availableQuantity : Decimal;
      center            : String;
      material          : Association to Material;
}

entity Equipment {
  key ID                  : String;
      code                : String;
      description         : localized String;
      location            : String;
      locationDescription : localized String;
}
