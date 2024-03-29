export {IBaseRef} from './api/IBaseRef';
export {IBuildOptions} from './api/IBuildOptions';
export {IClassRef, isClassRef} from './api/IClassRef';
export {IEntityRef, isEntityRef} from './api/IEntityRef';
export {ILookupRegistry, isLookupRegistry} from './api/ILookupRegistry';
export {IPropertyExtentions} from './api/IPropertyExtentions';
export {IPropertyRef, isPropertyRef} from './api/IPropertyRef';
export {ISchemaRef} from './api/ISchemaRef';
export {
  IJsonSchema,
  supportsJsonSchemaExport,
  supportsJsonSchema,
  supportsJsonSchemaImport
} from './api/IJsonSchema';

export {Entity} from './decorators/Entity';
export {Property} from './decorators/Property';
export {Embeddable} from './decorators/Embeddable';
export {PropertyOf} from './decorators/PropertyOf';
export {Schema} from './decorators/Schema';
export {Namespace} from './decorators/Namespace';

export {
  Hostname,
  HOSTNAME_RFC1034_REGEX,
  IHostnameOptions,
  HOSTNAME_RFC952_REGEX
} from './decorators/validate/Hostname';

export {Ip4, IP4_REGEX, IIp4Options} from './decorators/validate/Ip4';
export {Ip6, IP6_REGEX, IIp6Options} from './decorators/validate/Ip6';
export {IsEmail, MAIL_REGEX, IIsEmailOptions} from './decorators/validate/IsEmail';
export {Regex, IRegexOptions} from './decorators/validate/Regex';
export {Required, IRequiredOptions} from './decorators/validate/Required';
export {MinLength, IMinLengthOptions} from './decorators/validate/MinLength';
export {MaxLength, IMaxLengthOptions} from './decorators/validate/MaxLength';
export {IsNotEmpty, IIsNotEmptyOptions} from './decorators/validate/IsNotEmpty';

export {AbstractRef} from './lib/AbstractRef';
export {AbstractRegistry} from './lib/registry/AbstractRegistry';

export {AnnotationsHelper} from './lib/AnnotationsHelper';
export {ClassRef} from './lib/ClassRef';
export * from './lib/Constants';

export {DataContainer} from './lib/DataContainer';
export {DRAFT_07} from './lib/json-schema/Constants';
export {IJsonSchemaSerializeOptions} from './lib/json-schema/IJsonSchemaSerializeOptions';
export {IJsonSchemaSerializer} from './lib/json-schema/IJsonSchemaSerializer';
export {IJsonSchemaUnserializeOptions} from './lib/json-schema/IJsonSchemaUnserializeOptions';
export {IJsonSchemaUnserializer} from './lib/json-schema/IJsonSchemaUnserializer';
export {IParseOptions} from './lib/json-schema/IParseOptions';
export {JsonSchema} from './lib/json-schema/JsonSchema';

export {
  IJsonSchema7,
  IJsonSchema7Definition,
  hasClassInDefinition,
  hasClassPropertiesInDefinition,
  IJsonSchema7TypeName,
  JSON_SCHEMA_7_TYPES
} from './lib/json-schema/JsonSchema7';

export {JsonSchema7Serializer} from './lib/json-schema/JsonSchema7Serializer';
export {JsonSchema7Unserializer} from './lib/json-schema/JsonSchema7Unserializer';
export {LookupRegistry} from './lib/LookupRegistry';
export {INamedOptions} from './lib/options/INamedOptions';
export {IAbstractOptions} from './lib/options/IAbstractOptions';
export {IAttributeOptions} from './lib/options/IAttributeOptions';
export {IEntityOptions} from './lib/options/IEntityOptions';
export {IObjectOptions} from './lib/options/IObjectOptions';
export {IPropertyOptions} from './lib/options/IPropertyOptions';
export {ISchemaOptions} from './lib/options/ISchemaOptions';

export {DefaultEntityRef} from './lib/registry/DefaultEntityRef';
export {DefaultNamespacedRegistry} from './lib/registry/DefaultNamespacedRegistry';
export {DefaultPropertyRef} from './lib/registry/DefaultPropertyRef';
export {MetadataRegistry} from './lib/registry/MetadataRegistry';
export {RegistryFactory} from './lib/registry/RegistryFactory';
export {Binding} from './lib/registry/Binding';
export {SchemaRef} from './lib/SchemaRef';
export {SchemaUtils} from './lib/SchemaUtils';
export {DefaultValidator} from './lib/validation/DefaultValidator';
export {IValidateOptions} from './lib/validation/IValidateOptions';
export {IValidatorEntry} from './lib/validation/IValidatorEntry';
export {IValidationError} from './lib/validation/IValidationError';
export {IValidationMessage} from './lib/validation/IValidationMessage';
export {IValidationResult} from './lib/validation/IValidationResult';
export {IValidator} from './lib/validation/IValidator';
export {Validator, validate_function} from './lib/validation/Validator';
export {getClassName} from './lib/functions';
