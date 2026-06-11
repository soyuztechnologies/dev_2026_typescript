using { cuid, managed } from '@sap/cds/common';

namespace anubhav.trainings;

entity Material : cuid, managed {
  materialName : String(40);
  materialType : String(20);
  baseUnit     : String(3);
  plant        : Association to Plant;
}

entity Plant : cuid, managed {
  plantName       : String(40);
  storageLocation : String(10);
  country         : String(3);
  city            : String(40);
}