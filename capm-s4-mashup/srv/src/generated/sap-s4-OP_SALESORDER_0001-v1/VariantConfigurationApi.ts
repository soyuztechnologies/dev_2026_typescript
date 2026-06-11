/*
 * Copyright (c) 2026 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { VariantConfiguration } from './VariantConfiguration';
import { VariantConfigurationRequestBuilder } from './VariantConfigurationRequestBuilder';
import {
  CustomField,
  defaultDeSerializers,
  DefaultDeSerializers,
  DeSerializers,
  AllFields,
  entityBuilder,
  EntityBuilderType,
  EntityApi,
  FieldBuilder,
  OrderableEdmTypeField
} from '@sap-cloud-sdk/odata-v4';
export class VariantConfigurationApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers
> implements EntityApi<VariantConfiguration<DeSerializersT>, DeSerializersT> {
  public deSerializers: DeSerializersT;

  private constructor(
    deSerializers: DeSerializersT = defaultDeSerializers as any
  ) {
    this.deSerializers = deSerializers;
  }

  /**
   * Do not use this method or the constructor directly.
   * Use the service function as described in the documentation to get an API instance.
   */
  public static _privateFactory<
    DeSerializersT extends DeSerializers = DefaultDeSerializers
  >(
    deSerializers: DeSerializersT = defaultDeSerializers as any
  ): VariantConfigurationApi<DeSerializersT> {
    return new VariantConfigurationApi(deSerializers);
  }

  private navigationPropertyFields!: {};

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }

  entityConstructor = VariantConfiguration;

  requestBuilder(): VariantConfigurationRequestBuilder<DeSerializersT> {
    return new VariantConfigurationRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    VariantConfiguration<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<VariantConfiguration<DeSerializersT>, DeSerializersT>(
      this
    );
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT
  ): CustomField<
    VariantConfiguration<DeSerializersT>,
    DeSerializersT,
    NullableT
  > {
    return new CustomField(
      fieldName,
      this.entityConstructor,
      this.deSerializers,
      isNullable
    ) as any;
  }

  private _fieldBuilder?: FieldBuilder<
    typeof VariantConfiguration,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        VariantConfiguration,
        this.deSerializers
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    VAR_CONFIGURATION_BUS_OBJECT_KEY: OrderableEdmTypeField<
      VariantConfiguration<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    VAR_CONFIGURATION_BUS_OBJECT_TYPE: OrderableEdmTypeField<
      VariantConfiguration<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    VAR_CONFIGN_STATUS: OrderableEdmTypeField<
      VariantConfiguration<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    ALL_FIELDS: AllFields<VariantConfiguration<DeSerializers>>;
  };

  get schema() {
    if (!this._schema) {
      const fieldBuilder = this.fieldBuilder;
      this._schema = {
        /**
         * Static representation of the {@link varConfigurationBusObjectKey} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        VAR_CONFIGURATION_BUS_OBJECT_KEY: fieldBuilder.buildEdmTypeField(
          'VarConfigurationBusObjectKey',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link varConfigurationBusObjectType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        VAR_CONFIGURATION_BUS_OBJECT_TYPE: fieldBuilder.buildEdmTypeField(
          'VarConfigurationBusObjectType',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link varConfignStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        VAR_CONFIGN_STATUS: fieldBuilder.buildEdmTypeField(
          'VarConfignStatus',
          'Edm.String',
          false
        ),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', VariantConfiguration)
      };
    }

    return this._schema;
  }
}
