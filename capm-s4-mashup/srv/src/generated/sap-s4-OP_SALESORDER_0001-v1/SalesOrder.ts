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
import type { SalesOrderApi } from './SalesOrderApi';
import { SalesOrderItem, SalesOrderItemType } from './SalesOrderItem';
import { SalesOrderPartner, SalesOrderPartnerType } from './SalesOrderPartner';
import {
  SalesOrderPricingElement,
  SalesOrderPricingElementType
} from './SalesOrderPricingElement';
import { SalesOrderText, SalesOrderTextType } from './SalesOrderText';

/**
 * This class represents the entity "SalesOrder" of service "com.sap.gateway.srvd_a2x.api_salesorder.v0001".
 */
export class SalesOrder<T extends DeSerializers = DefaultDeSerializers>
  extends Entity
  implements SalesOrderType<T>
{
  /**
   * Technical entity name for SalesOrder.
   */
  static override _entityName = 'SalesOrder';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/';
  /**
   * All key fields of the SalesOrder entity.
   */
  static _keys = ['SalesOrder'];
  /**
   * Sales Order.
   * Maximum length: 10.
   */
  declare salesOrder: DeserializedType<T, 'Edm.String'>;
  /**
   * Sales Order Type.
   * Maximum length: 4.
   */
  declare salesOrderType: DeserializedType<T, 'Edm.String'>;
  /**
   * Sales Order Processing Type.
   * Maximum length: 1.
   */
  declare salesOrderProcessingType: DeserializedType<T, 'Edm.String'>;
  /**
   * Sold To Party.
   * Maximum length: 10.
   */
  declare soldToParty: DeserializedType<T, 'Edm.String'>;
  /**
   * Sales Organization.
   * Maximum length: 4.
   */
  declare salesOrganization: DeserializedType<T, 'Edm.String'>;
  /**
   * Distribution Channel.
   * Maximum length: 2.
   */
  declare distributionChannel: DeserializedType<T, 'Edm.String'>;
  /**
   * Reference Distribution Channel.
   * Maximum length: 2.
   */
  declare referenceDistributionChannel: DeserializedType<T, 'Edm.String'>;
  /**
   * Organization Division.
   * Maximum length: 2.
   */
  declare organizationDivision: DeserializedType<T, 'Edm.String'>;
  /**
   * Sales Office.
   * Maximum length: 4.
   */
  declare salesOffice: DeserializedType<T, 'Edm.String'>;
  /**
   * Sales Group.
   * Maximum length: 3.
   */
  declare salesGroup: DeserializedType<T, 'Edm.String'>;
  /**
   * Sales District.
   * Maximum length: 6.
   */
  declare salesDistrict: DeserializedType<T, 'Edm.String'>;
  /**
   * Created By User.
   * Maximum length: 12.
   */
  declare createdByUser: DeserializedType<T, 'Edm.String'>;
  /**
   * Creation Date.
   * @nullable
   */
  declare creationDate?: DeserializedType<T, 'Edm.Date'> | null;
  /**
   * Creation Time.
   */
  declare creationTime: DeserializedType<T, 'Edm.TimeOfDay'>;
  /**
   * Last Change Date Time.
   * @nullable
   */
  declare lastChangeDateTime?: DeserializedType<T, 'Edm.DateTimeOffset'> | null;
  /**
   * Last Changed By User.
   * Maximum length: 12.
   */
  declare lastChangedByUser: DeserializedType<T, 'Edm.String'>;
  /**
   * Purchase Order By Customer.
   * Maximum length: 35.
   */
  declare purchaseOrderByCustomer: DeserializedType<T, 'Edm.String'>;
  /**
   * Purchase Order By Ship To Party.
   * Maximum length: 35.
   */
  declare purchaseOrderByShipToParty: DeserializedType<T, 'Edm.String'>;
  /**
   * Customer Purchase Order Type.
   * Maximum length: 4.
   */
  declare customerPurchaseOrderType: DeserializedType<T, 'Edm.String'>;
  /**
   * Customer Purchase Order Date.
   * @nullable
   */
  declare customerPurchaseOrderDate?: DeserializedType<T, 'Edm.Date'> | null;
  /**
   * Business Solution Order.
   * Maximum length: 10.
   */
  declare businessSolutionOrder: DeserializedType<T, 'Edm.String'>;
  /**
   * Reference Sd Document.
   * Maximum length: 10.
   */
  declare referenceSdDocument: DeserializedType<T, 'Edm.String'>;
  /**
   * Reference Sd Document Category.
   * Maximum length: 4.
   */
  declare referenceSdDocumentCategory: DeserializedType<T, 'Edm.String'>;
  /**
   * Sd Document Reason.
   * Maximum length: 3.
   */
  declare sdDocumentReason: DeserializedType<T, 'Edm.String'>;
  /**
   * Sales Order Date.
   * @nullable
   */
  declare salesOrderDate?: DeserializedType<T, 'Edm.Date'> | null;
  /**
   * Requested Delivery Date.
   * @nullable
   */
  declare requestedDeliveryDate?: DeserializedType<T, 'Edm.Date'> | null;
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
   * Proposed Billing Document Type.
   * Maximum length: 4.
   */
  declare proposedBillingDocumentType: DeserializedType<T, 'Edm.String'>;
  /**
   * Total Net Amount.
   */
  declare totalNetAmount: DeserializedType<T, 'Edm.Decimal'>;
  /**
   * Transaction Currency.
   * Maximum length: 3.
   */
  declare transactionCurrency: DeserializedType<T, 'Edm.String'>;
  /**
   * Delivery Date Type Rule.
   * Maximum length: 1.
   */
  declare deliveryDateTypeRule: DeserializedType<T, 'Edm.String'>;
  /**
   * Shipping Condition.
   * Maximum length: 2.
   */
  declare shippingCondition: DeserializedType<T, 'Edm.String'>;
  /**
   * Complete Delivery Is Defined.
   */
  declare completeDeliveryIsDefined: DeserializedType<T, 'Edm.Boolean'>;
  /**
   * Sls Doc Is Rlvt For Proof Of Deliv.
   */
  declare slsDocIsRlvtForProofOfDeliv: DeserializedType<T, 'Edm.Boolean'>;
  /**
   * Shipping Type.
   * Maximum length: 2.
   */
  declare shippingType: DeserializedType<T, 'Edm.String'>;
  /**
   * Receiving Point.
   * Maximum length: 25.
   */
  declare receivingPoint: DeserializedType<T, 'Edm.String'>;
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
   * Incoterms Version.
   * Maximum length: 4.
   */
  declare incotermsVersion: DeserializedType<T, 'Edm.String'>;
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
   * Sd Pricing Procedure.
   * Maximum length: 6.
   */
  declare sdPricingProcedure: DeserializedType<T, 'Edm.String'>;
  /**
   * Customer Price Group.
   * Maximum length: 2.
   */
  declare customerPriceGroup: DeserializedType<T, 'Edm.String'>;
  /**
   * Price List Type.
   * Maximum length: 2.
   */
  declare priceListType: DeserializedType<T, 'Edm.String'>;
  /**
   * Fixed Value Date.
   * @nullable
   */
  declare fixedValueDate?: DeserializedType<T, 'Edm.Date'> | null;
  /**
   * Tax Departure Country.
   * Maximum length: 3.
   */
  declare taxDepartureCountry: DeserializedType<T, 'Edm.String'>;
  /**
   * Vat Registration Country.
   * Maximum length: 3.
   */
  declare vatRegistrationCountry: DeserializedType<T, 'Edm.String'>;
  /**
   * Is Eu Triangular Deal.
   */
  declare isEuTriangularDeal: DeserializedType<T, 'Edm.Boolean'>;
  /**
   * Customer Payment Terms.
   * Maximum length: 4.
   */
  declare customerPaymentTerms: DeserializedType<T, 'Edm.String'>;
  /**
   * Payment Method.
   * Maximum length: 1.
   */
  declare paymentMethod: DeserializedType<T, 'Edm.String'>;
  /**
   * Billing Company Code.
   * Maximum length: 4.
   */
  declare billingCompanyCode: DeserializedType<T, 'Edm.String'>;
  /**
   * Controlling Area.
   * Maximum length: 4.
   */
  declare controllingArea: DeserializedType<T, 'Edm.String'>;
  /**
   * Customer Account Assignment Group.
   * Maximum length: 2.
   */
  declare customerAccountAssignmentGroup: DeserializedType<T, 'Edm.String'>;
  /**
   * Assignment Reference.
   * Maximum length: 18.
   */
  declare assignmentReference: DeserializedType<T, 'Edm.String'>;
  /**
   * Accounting Doc External Reference.
   * Maximum length: 16.
   */
  declare accountingDocExternalReference: DeserializedType<T, 'Edm.String'>;
  /**
   * Customer Credit Account.
   * Maximum length: 10.
   */
  declare customerCreditAccount: DeserializedType<T, 'Edm.String'>;
  /**
   * Header Billing Block Reason.
   * Maximum length: 2.
   */
  declare headerBillingBlockReason: DeserializedType<T, 'Edm.String'>;
  /**
   * Delivery Block Reason.
   * Maximum length: 2.
   */
  declare deliveryBlockReason: DeserializedType<T, 'Edm.String'>;
  /**
   * Sales Order Approval Reason.
   * Maximum length: 4.
   */
  declare salesOrderApprovalReason: DeserializedType<T, 'Edm.String'>;
  /**
   * Customer Group.
   * Maximum length: 2.
   */
  declare customerGroup: DeserializedType<T, 'Edm.String'>;
  /**
   * Additional Customer Group 1.
   * Maximum length: 3.
   */
  declare additionalCustomerGroup1: DeserializedType<T, 'Edm.String'>;
  /**
   * Additional Customer Group 2.
   * Maximum length: 3.
   */
  declare additionalCustomerGroup2: DeserializedType<T, 'Edm.String'>;
  /**
   * Additional Customer Group 3.
   * Maximum length: 3.
   */
  declare additionalCustomerGroup3: DeserializedType<T, 'Edm.String'>;
  /**
   * Additional Customer Group 4.
   * Maximum length: 3.
   */
  declare additionalCustomerGroup4: DeserializedType<T, 'Edm.String'>;
  /**
   * Additional Customer Group 5.
   * Maximum length: 3.
   */
  declare additionalCustomerGroup5: DeserializedType<T, 'Edm.String'>;
  /**
   * Overall Sd Process Status.
   * Maximum length: 1.
   */
  declare overallSdProcessStatus: DeserializedType<T, 'Edm.String'>;
  /**
   * Overall Delivery Block Status.
   * Maximum length: 1.
   */
  declare overallDeliveryBlockStatus: DeserializedType<T, 'Edm.String'>;
  /**
   * Overall Billing Block Status.
   * Maximum length: 1.
   */
  declare overallBillingBlockStatus: DeserializedType<T, 'Edm.String'>;
  /**
   * Overall Delivery Status.
   * Maximum length: 1.
   */
  declare overallDeliveryStatus: DeserializedType<T, 'Edm.String'>;
  /**
   * Total Credit Check Status.
   * Maximum length: 1.
   */
  declare totalCreditCheckStatus: DeserializedType<T, 'Edm.String'>;
  /**
   * Overall Sd Document Rejection Sts.
   * Maximum length: 1.
   */
  declare overallSdDocumentRejectionSts: DeserializedType<T, 'Edm.String'>;
  /**
   * Total Block Status.
   * Maximum length: 1.
   */
  declare totalBlockStatus: DeserializedType<T, 'Edm.String'>;
  /**
   * Hdr General Incompletion Status.
   * Maximum length: 1.
   */
  declare hdrGeneralIncompletionStatus: DeserializedType<T, 'Edm.String'>;
  /**
   * Ovrl Itm General Incompletion Sts.
   * Maximum length: 1.
   */
  declare ovrlItmGeneralIncompletionSts: DeserializedType<T, 'Edm.String'>;
  /**
   * Overall Sd Doc Reference Status.
   * Maximum length: 1.
   */
  declare overallSdDocReferenceStatus: DeserializedType<T, 'Edm.String'>;
  /**
   * Sales Doc Approval Status.
   * Maximum length: 1.
   */
  declare salesDocApprovalStatus: DeserializedType<T, 'Edm.String'>;
  /**
   * Overall Chml Cmplnc Status.
   * Maximum length: 1.
   */
  declare overallChmlCmplncStatus: DeserializedType<T, 'Edm.String'>;
  /**
   * Overall Dangerous Goods Status.
   * Maximum length: 1.
   */
  declare overallDangerousGoodsStatus: DeserializedType<T, 'Edm.String'>;
  /**
   * Overall Safety Data Sheet Status.
   * Maximum length: 1.
   */
  declare overallSafetyDataSheetStatus: DeserializedType<T, 'Edm.String'>;
  /**
   * Overall Trd Cmplnc Embargo Sts.
   * Maximum length: 1.
   */
  declare overallTrdCmplncEmbargoSts: DeserializedType<T, 'Edm.String'>;
  /**
   * Ovrl Trd Cmplnc Snctnd List Chk Sts.
   * Maximum length: 1.
   */
  declare ovrlTrdCmplncSnctndListChkSts: DeserializedType<T, 'Edm.String'>;
  /**
   * Ovrl Trd Cmplnc Legal Ctrl Chk Sts.
   * Maximum length: 1.
   */
  declare ovrlTrdCmplncLegalCtrlChkSts: DeserializedType<T, 'Edm.String'>;
  /**
   * Sales Order Down Payment Status.
   * Maximum length: 1.
   */
  declare salesOrderDownPaymentStatus: DeserializedType<T, 'Edm.String'>;
  /**
   * Overall Ord Reltd Billg Status.
   * Maximum length: 1.
   */
  declare overallOrdReltdBillgStatus: DeserializedType<T, 'Edm.String'>;
  /**
   * Sap Messages.
   */
  declare sapMessages: Sap_Message<T>[];
  /**
   * One-to-many navigation property to the {@link SalesOrderItem} entity.
   */
  declare item: SalesOrderItem<T>[];
  /**
   * One-to-many navigation property to the {@link SalesOrderPartner} entity.
   */
  declare partner: SalesOrderPartner<T>[];
  /**
   * One-to-many navigation property to the {@link SalesOrderPricingElement} entity.
   */
  declare pricingElement: SalesOrderPricingElement<T>[];
  /**
   * One-to-many navigation property to the {@link SalesOrderText} entity.
   */
  declare text: SalesOrderText<T>[];

  constructor(_entityApi: SalesOrderApi<T>) {
    super(_entityApi);
  }
}

export interface SalesOrderType<
  T extends DeSerializers = DefaultDeSerializers
> {
  salesOrder: DeserializedType<T, 'Edm.String'>;
  salesOrderType: DeserializedType<T, 'Edm.String'>;
  salesOrderProcessingType: DeserializedType<T, 'Edm.String'>;
  soldToParty: DeserializedType<T, 'Edm.String'>;
  salesOrganization: DeserializedType<T, 'Edm.String'>;
  distributionChannel: DeserializedType<T, 'Edm.String'>;
  referenceDistributionChannel: DeserializedType<T, 'Edm.String'>;
  organizationDivision: DeserializedType<T, 'Edm.String'>;
  salesOffice: DeserializedType<T, 'Edm.String'>;
  salesGroup: DeserializedType<T, 'Edm.String'>;
  salesDistrict: DeserializedType<T, 'Edm.String'>;
  createdByUser: DeserializedType<T, 'Edm.String'>;
  creationDate?: DeserializedType<T, 'Edm.Date'> | null;
  creationTime: DeserializedType<T, 'Edm.TimeOfDay'>;
  lastChangeDateTime?: DeserializedType<T, 'Edm.DateTimeOffset'> | null;
  lastChangedByUser: DeserializedType<T, 'Edm.String'>;
  purchaseOrderByCustomer: DeserializedType<T, 'Edm.String'>;
  purchaseOrderByShipToParty: DeserializedType<T, 'Edm.String'>;
  customerPurchaseOrderType: DeserializedType<T, 'Edm.String'>;
  customerPurchaseOrderDate?: DeserializedType<T, 'Edm.Date'> | null;
  businessSolutionOrder: DeserializedType<T, 'Edm.String'>;
  referenceSdDocument: DeserializedType<T, 'Edm.String'>;
  referenceSdDocumentCategory: DeserializedType<T, 'Edm.String'>;
  sdDocumentReason: DeserializedType<T, 'Edm.String'>;
  salesOrderDate?: DeserializedType<T, 'Edm.Date'> | null;
  requestedDeliveryDate?: DeserializedType<T, 'Edm.Date'> | null;
  pricingDate?: DeserializedType<T, 'Edm.Date'> | null;
  servicesRenderedDate?: DeserializedType<T, 'Edm.Date'> | null;
  billingDocumentDate?: DeserializedType<T, 'Edm.Date'> | null;
  proposedBillingDocumentType: DeserializedType<T, 'Edm.String'>;
  totalNetAmount: DeserializedType<T, 'Edm.Decimal'>;
  transactionCurrency: DeserializedType<T, 'Edm.String'>;
  deliveryDateTypeRule: DeserializedType<T, 'Edm.String'>;
  shippingCondition: DeserializedType<T, 'Edm.String'>;
  completeDeliveryIsDefined: DeserializedType<T, 'Edm.Boolean'>;
  slsDocIsRlvtForProofOfDeliv: DeserializedType<T, 'Edm.Boolean'>;
  shippingType: DeserializedType<T, 'Edm.String'>;
  receivingPoint: DeserializedType<T, 'Edm.String'>;
  meansOfTransportType: DeserializedType<T, 'Edm.String'>;
  meansOfTransportRefMaterial: DeserializedType<T, 'Edm.String'>;
  specialProcessingCode: DeserializedType<T, 'Edm.String'>;
  incotermsClassification: DeserializedType<T, 'Edm.String'>;
  incotermsVersion: DeserializedType<T, 'Edm.String'>;
  incotermsLocation1: DeserializedType<T, 'Edm.String'>;
  incotermsLocation2: DeserializedType<T, 'Edm.String'>;
  sdPricingProcedure: DeserializedType<T, 'Edm.String'>;
  customerPriceGroup: DeserializedType<T, 'Edm.String'>;
  priceListType: DeserializedType<T, 'Edm.String'>;
  fixedValueDate?: DeserializedType<T, 'Edm.Date'> | null;
  taxDepartureCountry: DeserializedType<T, 'Edm.String'>;
  vatRegistrationCountry: DeserializedType<T, 'Edm.String'>;
  isEuTriangularDeal: DeserializedType<T, 'Edm.Boolean'>;
  customerPaymentTerms: DeserializedType<T, 'Edm.String'>;
  paymentMethod: DeserializedType<T, 'Edm.String'>;
  billingCompanyCode: DeserializedType<T, 'Edm.String'>;
  controllingArea: DeserializedType<T, 'Edm.String'>;
  customerAccountAssignmentGroup: DeserializedType<T, 'Edm.String'>;
  assignmentReference: DeserializedType<T, 'Edm.String'>;
  accountingDocExternalReference: DeserializedType<T, 'Edm.String'>;
  customerCreditAccount: DeserializedType<T, 'Edm.String'>;
  headerBillingBlockReason: DeserializedType<T, 'Edm.String'>;
  deliveryBlockReason: DeserializedType<T, 'Edm.String'>;
  salesOrderApprovalReason: DeserializedType<T, 'Edm.String'>;
  customerGroup: DeserializedType<T, 'Edm.String'>;
  additionalCustomerGroup1: DeserializedType<T, 'Edm.String'>;
  additionalCustomerGroup2: DeserializedType<T, 'Edm.String'>;
  additionalCustomerGroup3: DeserializedType<T, 'Edm.String'>;
  additionalCustomerGroup4: DeserializedType<T, 'Edm.String'>;
  additionalCustomerGroup5: DeserializedType<T, 'Edm.String'>;
  overallSdProcessStatus: DeserializedType<T, 'Edm.String'>;
  overallDeliveryBlockStatus: DeserializedType<T, 'Edm.String'>;
  overallBillingBlockStatus: DeserializedType<T, 'Edm.String'>;
  overallDeliveryStatus: DeserializedType<T, 'Edm.String'>;
  totalCreditCheckStatus: DeserializedType<T, 'Edm.String'>;
  overallSdDocumentRejectionSts: DeserializedType<T, 'Edm.String'>;
  totalBlockStatus: DeserializedType<T, 'Edm.String'>;
  hdrGeneralIncompletionStatus: DeserializedType<T, 'Edm.String'>;
  ovrlItmGeneralIncompletionSts: DeserializedType<T, 'Edm.String'>;
  overallSdDocReferenceStatus: DeserializedType<T, 'Edm.String'>;
  salesDocApprovalStatus: DeserializedType<T, 'Edm.String'>;
  overallChmlCmplncStatus: DeserializedType<T, 'Edm.String'>;
  overallDangerousGoodsStatus: DeserializedType<T, 'Edm.String'>;
  overallSafetyDataSheetStatus: DeserializedType<T, 'Edm.String'>;
  overallTrdCmplncEmbargoSts: DeserializedType<T, 'Edm.String'>;
  ovrlTrdCmplncSnctndListChkSts: DeserializedType<T, 'Edm.String'>;
  ovrlTrdCmplncLegalCtrlChkSts: DeserializedType<T, 'Edm.String'>;
  salesOrderDownPaymentStatus: DeserializedType<T, 'Edm.String'>;
  overallOrdReltdBillgStatus: DeserializedType<T, 'Edm.String'>;
  sapMessages: Sap_Message<T>[];
  item: SalesOrderItemType<T>[];
  partner: SalesOrderPartnerType<T>[];
  pricingElement: SalesOrderPricingElementType<T>[];
  text: SalesOrderTextType<T>[];
}
