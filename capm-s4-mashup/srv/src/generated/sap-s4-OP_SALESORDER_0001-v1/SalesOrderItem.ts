/*
 * Copyright (c) 2026 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import {
  Entity,
  DefaultDeSerializers,
  DeSerializers,
  DeserializedType
} from '@sap-cloud-sdk/odata-v4';
import { Sap_Message } from './Sap_Message';
import type { SalesOrderItemApi } from './SalesOrderItemApi';
import {
  SalesOrderItemPartner,
  SalesOrderItemPartnerType
} from './SalesOrderItemPartner';
import {
  SalesOrderItemPricingElement,
  SalesOrderItemPricingElementType
} from './SalesOrderItemPricingElement';
import {
  SalesOrderItemText,
  SalesOrderItemTextType
} from './SalesOrderItemText';
import { SalesOrder, SalesOrderType } from './SalesOrder';
import {
  SalesOrderScheduleLine,
  SalesOrderScheduleLineType
} from './SalesOrderScheduleLine';
import {
  VariantConfiguration,
  VariantConfigurationType
} from './VariantConfiguration';

/**
 * This class represents the entity "SalesOrderItem" of service "com.sap.gateway.srvd_a2x.api_salesorder.v0001".
 */
export class SalesOrderItem<T extends DeSerializers = DefaultDeSerializers>
  extends Entity
  implements SalesOrderItemType<T>
{
  /**
   * Technical entity name for SalesOrderItem.
   */
  static override _entityName = 'SalesOrderItem';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/';
  /**
   * All key fields of the SalesOrderItem entity.
   */
  static _keys = ['SalesOrder', 'SalesOrderItem'];
  /**
   * Sales Order.
   * Maximum length: 10.
   */
  declare salesOrder: DeserializedType<T, 'Edm.String'>;
  /**
   * Sales Order Item.
   * Maximum length: 6.
   */
  declare salesOrderItem: DeserializedType<T, 'Edm.String'>;
  /**
   * Higher Level Item.
   * Maximum length: 6.
   * @nullable
   */
  declare higherLevelItem?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Sales Order Item Category.
   * Maximum length: 4.
   */
  declare salesOrderItemCategory: DeserializedType<T, 'Edm.String'>;
  /**
   * Sales Order Item Text.
   * Maximum length: 40.
   */
  declare salesOrderItemText: DeserializedType<T, 'Edm.String'>;
  /**
   * Product.
   * Maximum length: 40.
   */
  declare product: DeserializedType<T, 'Edm.String'>;
  /**
   * Originally Requested Material.
   * Maximum length: 40.
   */
  declare originallyRequestedMaterial: DeserializedType<T, 'Edm.String'>;
  /**
   * Product Group.
   * Maximum length: 9.
   */
  declare productGroup: DeserializedType<T, 'Edm.String'>;
  /**
   * Material By Customer.
   * Maximum length: 35.
   */
  declare materialByCustomer: DeserializedType<T, 'Edm.String'>;
  /**
   * International Article Number.
   * Maximum length: 18.
   */
  declare internationalArticleNumber: DeserializedType<T, 'Edm.String'>;
  /**
   * Purchase Order By Ship To Party.
   * Maximum length: 35.
   */
  declare purchaseOrderByShipToParty: DeserializedType<T, 'Edm.String'>;
  /**
   * Purchase Order By Customer.
   * Maximum length: 35.
   */
  declare purchaseOrderByCustomer: DeserializedType<T, 'Edm.String'>;
  /**
   * Confd Deliv Qty In Order Qty Unit.
   */
  declare confdDelivQtyInOrderQtyUnit: DeserializedType<T, 'Edm.Decimal'>;
  /**
   * Order Quantity Sap Unit.
   * Maximum length: 3.
   */
  declare orderQuantitySapUnit: DeserializedType<T, 'Edm.String'>;
  /**
   * Order Quantity Iso Unit.
   * Maximum length: 3.
   */
  declare orderQuantityIsoUnit: DeserializedType<T, 'Edm.String'>;
  /**
   * Requested Quantity.
   */
  declare requestedQuantity: DeserializedType<T, 'Edm.Decimal'>;
  /**
   * Requested Quantity Sap Unit.
   * Maximum length: 3.
   */
  declare requestedQuantitySapUnit: DeserializedType<T, 'Edm.String'>;
  /**
   * Requested Quantity Iso Unit.
   * Maximum length: 3.
   */
  declare requestedQuantityIsoUnit: DeserializedType<T, 'Edm.String'>;
  /**
   * Reference Sd Document.
   * Maximum length: 10.
   */
  declare referenceSdDocument: DeserializedType<T, 'Edm.String'>;
  /**
   * Reference Sd Document Item.
   * Maximum length: 6.
   */
  declare referenceSdDocumentItem: DeserializedType<T, 'Edm.String'>;
  /**
   * Reference Sd Document Category.
   * Maximum length: 4.
   */
  declare referenceSdDocumentCategory: DeserializedType<T, 'Edm.String'>;
  /**
   * Business Solution Order Item.
   * Maximum length: 6.
   * @nullable
   */
  declare businessSolutionOrderItem?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Item Gross Weight.
   */
  declare itemGrossWeight: DeserializedType<T, 'Edm.Decimal'>;
  /**
   * Item Net Weight.
   */
  declare itemNetWeight: DeserializedType<T, 'Edm.Decimal'>;
  /**
   * Item Weight Sap Unit.
   * Maximum length: 3.
   */
  declare itemWeightSapUnit: DeserializedType<T, 'Edm.String'>;
  /**
   * Item Weight Iso Unit.
   * Maximum length: 3.
   */
  declare itemWeightIsoUnit: DeserializedType<T, 'Edm.String'>;
  /**
   * Item Volume.
   */
  declare itemVolume: DeserializedType<T, 'Edm.Decimal'>;
  /**
   * Item Volume Sap Unit.
   * Maximum length: 3.
   */
  declare itemVolumeSapUnit: DeserializedType<T, 'Edm.String'>;
  /**
   * Item Volume Iso Unit.
   * Maximum length: 3.
   */
  declare itemVolumeIsoUnit: DeserializedType<T, 'Edm.String'>;
  /**
   * Requested Delivery Date.
   * @nullable
   */
  declare requestedDeliveryDate?: DeserializedType<T, 'Edm.Date'> | null;
  /**
   * Confirmed Delivery Date.
   * @nullable
   */
  declare confirmedDeliveryDate?: DeserializedType<T, 'Edm.Date'> | null;
  /**
   * Pricing Date.
   * @nullable
   */
  declare pricingDate?: DeserializedType<T, 'Edm.Date'> | null;
  /**
   * Services Rendered Date.
   * @nullable
   */
  declare servicesRenderedDate?: DeserializedType<T, 'Edm.Date'> | null;
  /**
   * Billing Document Date.
   * @nullable
   */
  declare billingDocumentDate?: DeserializedType<T, 'Edm.Date'> | null;
  /**
   * Net Amount.
   */
  declare netAmount: DeserializedType<T, 'Edm.Decimal'>;
  /**
   * Transaction Currency.
   * Maximum length: 3.
   */
  declare transactionCurrency: DeserializedType<T, 'Edm.String'>;
  /**
   * Tax Amount.
   */
  declare taxAmount: DeserializedType<T, 'Edm.Decimal'>;
  /**
   * Customer Group.
   * Maximum length: 2.
   */
  declare customerGroup: DeserializedType<T, 'Edm.String'>;
  /**
   * Batch.
   * Maximum length: 10.
   */
  declare batch: DeserializedType<T, 'Edm.String'>;
  /**
   * Plant.
   * Maximum length: 4.
   */
  declare plant: DeserializedType<T, 'Edm.String'>;
  /**
   * Storage Location.
   * Maximum length: 4.
   */
  declare storageLocation: DeserializedType<T, 'Edm.String'>;
  /**
   * Shipping Point.
   * Maximum length: 4.
   */
  declare shippingPoint: DeserializedType<T, 'Edm.String'>;
  /**
   * Shipping Type.
   * Maximum length: 2.
   */
  declare shippingType: DeserializedType<T, 'Edm.String'>;
  /**
   * Route.
   * Maximum length: 6.
   */
  declare route: DeserializedType<T, 'Edm.String'>;
  /**
   * Proposed Delivery Route.
   * Maximum length: 6.
   */
  declare proposedDeliveryRoute: DeserializedType<T, 'Edm.String'>;
  /**
   * Delivery Priority.
   * Maximum length: 2.
   */
  declare deliveryPriority: DeserializedType<T, 'Edm.String'>;
  /**
   * Partial Delivery Is Allowed.
   * Maximum length: 1.
   */
  declare partialDeliveryIsAllowed: DeserializedType<T, 'Edm.String'>;
  /**
   * Max Nmbr Of Partial Delivery.
   */
  declare maxNmbrOfPartialDelivery: DeserializedType<T, 'Edm.Decimal'>;
  /**
   * Delivery Date Type Rule.
   * Maximum length: 1.
   */
  declare deliveryDateTypeRule: DeserializedType<T, 'Edm.String'>;
  /**
   * Receiving Point.
   * Maximum length: 25.
   */
  declare receivingPoint: DeserializedType<T, 'Edm.String'>;
  /**
   * Delivery Group.
   * Maximum length: 3.
   */
  declare deliveryGroup: DeserializedType<T, 'Edm.String'>;
  /**
   * Means Of Transport Type.
   * Maximum length: 4.
   */
  declare meansOfTransportType: DeserializedType<T, 'Edm.String'>;
  /**
   * Means Of Transport Ref Material.
   * Maximum length: 40.
   */
  declare meansOfTransportRefMaterial: DeserializedType<T, 'Edm.String'>;
  /**
   * Special Processing Code.
   * Maximum length: 4.
   */
  declare specialProcessingCode: DeserializedType<T, 'Edm.String'>;
  /**
   * Incoterms Classification.
   * Maximum length: 3.
   */
  declare incotermsClassification: DeserializedType<T, 'Edm.String'>;
  /**
   * Incoterms Location 1.
   * Maximum length: 70.
   */
  declare incotermsLocation1: DeserializedType<T, 'Edm.String'>;
  /**
   * Incoterms Location 2.
   * Maximum length: 70.
   */
  declare incotermsLocation2: DeserializedType<T, 'Edm.String'>;
  /**
   * Incoterms Version.
   * Maximum length: 4.
   */
  declare incotermsVersion: DeserializedType<T, 'Edm.String'>;
  /**
   * Customer Payment Terms.
   * Maximum length: 4.
   */
  declare customerPaymentTerms: DeserializedType<T, 'Edm.String'>;
  /**
   * Fixed Value Date.
   * @nullable
   */
  declare fixedValueDate?: DeserializedType<T, 'Edm.Date'> | null;
  /**
   * Customer Price Group.
   * Maximum length: 2.
   */
  declare customerPriceGroup: DeserializedType<T, 'Edm.String'>;
  /**
   * Material Pricing Group.
   * Maximum length: 2.
   */
  declare materialPricingGroup: DeserializedType<T, 'Edm.String'>;
  /**
   * Business Area.
   * Maximum length: 4.
   */
  declare businessArea: DeserializedType<T, 'Edm.String'>;
  /**
   * Profit Center.
   * Maximum length: 10.
   */
  declare profitCenter: DeserializedType<T, 'Edm.String'>;
  /**
   * Matl Account Assignment Group.
   * Maximum length: 2.
   */
  declare matlAccountAssignmentGroup: DeserializedType<T, 'Edm.String'>;
  /**
   * Wbs Element External Id.
   * Maximum length: 24.
   */
  declare wbsElementExternalId: DeserializedType<T, 'Edm.String'>;
  /**
   * Item Billing Block Reason.
   * Maximum length: 2.
   */
  declare itemBillingBlockReason: DeserializedType<T, 'Edm.String'>;
  /**
   * Sales Document Rjcn Reason.
   * Maximum length: 2.
   */
  declare salesDocumentRjcnReason: DeserializedType<T, 'Edm.String'>;
  /**
   * Product Configuration.
   * Maximum length: 18.
   */
  declare productConfiguration: DeserializedType<T, 'Edm.String'>;
  /**
   * Sd Process Status.
   * Maximum length: 1.
   */
  declare sdProcessStatus: DeserializedType<T, 'Edm.String'>;
  /**
   * Sd Document Rejection Status.
   * Maximum length: 1.
   */
  declare sdDocumentRejectionStatus: DeserializedType<T, 'Edm.String'>;
  /**
   * Delivery Status.
   * Maximum length: 1.
   */
  declare deliveryStatus: DeserializedType<T, 'Edm.String'>;
  /**
   * Billing Block Status.
   * Maximum length: 1.
   */
  declare billingBlockStatus: DeserializedType<T, 'Edm.String'>;
  /**
   * Item General Incompletion Status.
   * Maximum length: 1.
   */
  declare itemGeneralIncompletionStatus: DeserializedType<T, 'Edm.String'>;
  /**
   * Delivery Block Status.
   * Maximum length: 1.
   */
  declare deliveryBlockStatus: DeserializedType<T, 'Edm.String'>;
  /**
   * Sls Order Item Down Payment Status.
   * Maximum length: 1.
   */
  declare slsOrderItemDownPaymentStatus: DeserializedType<T, 'Edm.String'>;
  /**
   * Order Related Billing Status.
   * Maximum length: 1.
   */
  declare orderRelatedBillingStatus: DeserializedType<T, 'Edm.String'>;
  /**
   * Chml Cmplnc Status.
   * Maximum length: 1.
   */
  declare chmlCmplncStatus: DeserializedType<T, 'Edm.String'>;
  /**
   * Dangerous Goods Status.
   * Maximum length: 1.
   */
  declare dangerousGoodsStatus: DeserializedType<T, 'Edm.String'>;
  /**
   * Safety Data Sheet Status.
   * Maximum length: 1.
   */
  declare safetyDataSheetStatus: DeserializedType<T, 'Edm.String'>;
  /**
   * Trd Cmplnc Embargo Sts.
   * Maximum length: 1.
   */
  declare trdCmplncEmbargoSts: DeserializedType<T, 'Edm.String'>;
  /**
   * Trd Cmplnc Snctnd List Chk Sts.
   * Maximum length: 1.
   */
  declare trdCmplncSnctndListChkSts: DeserializedType<T, 'Edm.String'>;
  /**
   * Ovrl Trd Cmplnc Legal Ctrl Chk Sts.
   * Maximum length: 1.
   */
  declare ovrlTrdCmplncLegalCtrlChkSts: DeserializedType<T, 'Edm.String'>;
  /**
   * Sap Messages.
   */
  declare sapMessages: Sap_Message<T>[];
  /**
   * One-to-many navigation property to the {@link SalesOrderItemPartner} entity.
   */
  declare itemPartner: SalesOrderItemPartner<T>[];
  /**
   * One-to-many navigation property to the {@link SalesOrderItemPricingElement} entity.
   */
  declare itemPricingElement: SalesOrderItemPricingElement<T>[];
  /**
   * One-to-many navigation property to the {@link SalesOrderItemText} entity.
   */
  declare itemText: SalesOrderItemText<T>[];
  /**
   * One-to-one navigation property to the {@link SalesOrder} entity.
   */
  declare salesOrder_1?: SalesOrder<T> | null;
  /**
   * One-to-many navigation property to the {@link SalesOrderScheduleLine} entity.
   */
  declare scheduleLine: SalesOrderScheduleLine<T>[];
  /**
   * One-to-one navigation property to the {@link VariantConfiguration} entity.
   */
  declare variantConfiguration?: VariantConfiguration<T> | null;

  constructor(_entityApi: SalesOrderItemApi<T>) {
    super(_entityApi);
  }
}

export interface SalesOrderItemType<
  T extends DeSerializers = DefaultDeSerializers
> {
  salesOrder: DeserializedType<T, 'Edm.String'>;
  salesOrderItem: DeserializedType<T, 'Edm.String'>;
  higherLevelItem?: DeserializedType<T, 'Edm.String'> | null;
  salesOrderItemCategory: DeserializedType<T, 'Edm.String'>;
  salesOrderItemText: DeserializedType<T, 'Edm.String'>;
  product: DeserializedType<T, 'Edm.String'>;
  originallyRequestedMaterial: DeserializedType<T, 'Edm.String'>;
  productGroup: DeserializedType<T, 'Edm.String'>;
  materialByCustomer: DeserializedType<T, 'Edm.String'>;
  internationalArticleNumber: DeserializedType<T, 'Edm.String'>;
  purchaseOrderByShipToParty: DeserializedType<T, 'Edm.String'>;
  purchaseOrderByCustomer: DeserializedType<T, 'Edm.String'>;
  confdDelivQtyInOrderQtyUnit: DeserializedType<T, 'Edm.Decimal'>;
  orderQuantitySapUnit: DeserializedType<T, 'Edm.String'>;
  orderQuantityIsoUnit: DeserializedType<T, 'Edm.String'>;
  requestedQuantity: DeserializedType<T, 'Edm.Decimal'>;
  requestedQuantitySapUnit: DeserializedType<T, 'Edm.String'>;
  requestedQuantityIsoUnit: DeserializedType<T, 'Edm.String'>;
  referenceSdDocument: DeserializedType<T, 'Edm.String'>;
  referenceSdDocumentItem: DeserializedType<T, 'Edm.String'>;
  referenceSdDocumentCategory: DeserializedType<T, 'Edm.String'>;
  businessSolutionOrderItem?: DeserializedType<T, 'Edm.String'> | null;
  itemGrossWeight: DeserializedType<T, 'Edm.Decimal'>;
  itemNetWeight: DeserializedType<T, 'Edm.Decimal'>;
  itemWeightSapUnit: DeserializedType<T, 'Edm.String'>;
  itemWeightIsoUnit: DeserializedType<T, 'Edm.String'>;
  itemVolume: DeserializedType<T, 'Edm.Decimal'>;
  itemVolumeSapUnit: DeserializedType<T, 'Edm.String'>;
  itemVolumeIsoUnit: DeserializedType<T, 'Edm.String'>;
  requestedDeliveryDate?: DeserializedType<T, 'Edm.Date'> | null;
  confirmedDeliveryDate?: DeserializedType<T, 'Edm.Date'> | null;
  pricingDate?: DeserializedType<T, 'Edm.Date'> | null;
  servicesRenderedDate?: DeserializedType<T, 'Edm.Date'> | null;
  billingDocumentDate?: DeserializedType<T, 'Edm.Date'> | null;
  netAmount: DeserializedType<T, 'Edm.Decimal'>;
  transactionCurrency: DeserializedType<T, 'Edm.String'>;
  taxAmount: DeserializedType<T, 'Edm.Decimal'>;
  customerGroup: DeserializedType<T, 'Edm.String'>;
  batch: DeserializedType<T, 'Edm.String'>;
  plant: DeserializedType<T, 'Edm.String'>;
  storageLocation: DeserializedType<T, 'Edm.String'>;
  shippingPoint: DeserializedType<T, 'Edm.String'>;
  shippingType: DeserializedType<T, 'Edm.String'>;
  route: DeserializedType<T, 'Edm.String'>;
  proposedDeliveryRoute: DeserializedType<T, 'Edm.String'>;
  deliveryPriority: DeserializedType<T, 'Edm.String'>;
  partialDeliveryIsAllowed: DeserializedType<T, 'Edm.String'>;
  maxNmbrOfPartialDelivery: DeserializedType<T, 'Edm.Decimal'>;
  deliveryDateTypeRule: DeserializedType<T, 'Edm.String'>;
  receivingPoint: DeserializedType<T, 'Edm.String'>;
  deliveryGroup: DeserializedType<T, 'Edm.String'>;
  meansOfTransportType: DeserializedType<T, 'Edm.String'>;
  meansOfTransportRefMaterial: DeserializedType<T, 'Edm.String'>;
  specialProcessingCode: DeserializedType<T, 'Edm.String'>;
  incotermsClassification: DeserializedType<T, 'Edm.String'>;
  incotermsLocation1: DeserializedType<T, 'Edm.String'>;
  incotermsLocation2: DeserializedType<T, 'Edm.String'>;
  incotermsVersion: DeserializedType<T, 'Edm.String'>;
  customerPaymentTerms: DeserializedType<T, 'Edm.String'>;
  fixedValueDate?: DeserializedType<T, 'Edm.Date'> | null;
  customerPriceGroup: DeserializedType<T, 'Edm.String'>;
  materialPricingGroup: DeserializedType<T, 'Edm.String'>;
  businessArea: DeserializedType<T, 'Edm.String'>;
  profitCenter: DeserializedType<T, 'Edm.String'>;
  matlAccountAssignmentGroup: DeserializedType<T, 'Edm.String'>;
  wbsElementExternalId: DeserializedType<T, 'Edm.String'>;
  itemBillingBlockReason: DeserializedType<T, 'Edm.String'>;
  salesDocumentRjcnReason: DeserializedType<T, 'Edm.String'>;
  productConfiguration: DeserializedType<T, 'Edm.String'>;
  sdProcessStatus: DeserializedType<T, 'Edm.String'>;
  sdDocumentRejectionStatus: DeserializedType<T, 'Edm.String'>;
  deliveryStatus: DeserializedType<T, 'Edm.String'>;
  billingBlockStatus: DeserializedType<T, 'Edm.String'>;
  itemGeneralIncompletionStatus: DeserializedType<T, 'Edm.String'>;
  deliveryBlockStatus: DeserializedType<T, 'Edm.String'>;
  slsOrderItemDownPaymentStatus: DeserializedType<T, 'Edm.String'>;
  orderRelatedBillingStatus: DeserializedType<T, 'Edm.String'>;
  chmlCmplncStatus: DeserializedType<T, 'Edm.String'>;
  dangerousGoodsStatus: DeserializedType<T, 'Edm.String'>;
  safetyDataSheetStatus: DeserializedType<T, 'Edm.String'>;
  trdCmplncEmbargoSts: DeserializedType<T, 'Edm.String'>;
  trdCmplncSnctndListChkSts: DeserializedType<T, 'Edm.String'>;
  ovrlTrdCmplncLegalCtrlChkSts: DeserializedType<T, 'Edm.String'>;
  sapMessages: Sap_Message<T>[];
  itemPartner: SalesOrderItemPartnerType<T>[];
  itemPricingElement: SalesOrderItemPricingElementType<T>[];
  itemText: SalesOrderItemTextType<T>[];
  salesOrder_1?: SalesOrderType<T> | null;
  scheduleLine: SalesOrderScheduleLineType<T>[];
  variantConfiguration?: VariantConfigurationType<T> | null;
}
