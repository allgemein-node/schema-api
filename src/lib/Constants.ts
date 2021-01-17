export const XS_DEFAULT = 'default';

// export const XS_GLOBAL = 'default';
export const XS_GLOBALLY = '__global__';

export const XS_DEFAULT_CLASSES = 'default_class_ref';

export const XS_TYPE_SCHEMA = 'schema';
export const XS_TYPE_ENTITY = 'entity';
export const XS_TYPE_CLASS_REF = 'class_ref';
export const XS_TYPE_PROPERTY = 'property';
export const XS_TYPE_BINDING_SCHEMA_ENTITY = 'schema_entity';
export const XS_TYPE_BINDING_SCHEMA_CLASS_REF = 'schema_class_ref';

export type METADATA_TYPE =
  'schema'
  | 'object'
  | 'entity'
  | 'property'
  | 'class_ref';


export type XS_TYPE =
  'schema'
  | 'entity'
  | 'property'
  | 'class_ref'
  | 'schema_entity'
  | 'entity_property'
  | 'property_entity'
  | 'schema_class_ref';

export type XS_DATA_TYPES = 'string' | 'number' | 'boolean' | 'entity' | 'array' | 'any' ;
export const XS_ID_SEPARATOR = '--';

export const XS_DEFAULT_SCHEMA = 'default';

// export const METADATA_SCHEMA_KEY = 'schema/annotations/schema';
// export const METADATA_ENTITY_KEY = 'schema/annotations/entity';
// export const METADATA_PROPERTY_KEY = 'schema/annotations/property';
// export const METADATA_OBJECT_KEY = 'schema/annotations/object';

export const METADATA_REGISTRY = 'metadata/registry';


export type ClassType<T> = { new(...args: any[]): T; };

export type JS_DATA_TYPES =
  'string'
  | 'text'
  | 'number'
  | 'boolean'
  | 'double'
  | 'json'
  | 'date'
  | 'time'
  | 'datetime'
  | 'timestamp'
  | 'byte'
  | 'object'
  | 'symbol'
  | 'null'
  | 'undefined'
  | 'bigint'
  ;

export const XS_ANNOTATION_OPTIONS_CACHE = 'anno_options_cache';

export const JS_DATA_TYPES: JS_DATA_TYPES[] = [
  'string'
  , 'text'
  , 'number'
  , 'boolean'
  , 'double'
  , 'json'
  , 'date'
  , 'time'
  , 'datetime'
  , 'timestamp'
  , 'byte'
  , 'object'
  , 'symbol'
  , 'null'
  , 'undefined'
  , 'bigint'
];

export const JS_PRIMATIVE_TYPES: JS_DATA_TYPES[] = [
  'string', 'number', 'boolean', 'object', 'symbol', 'date', 'null', 'undefined', 'bigint'
];
