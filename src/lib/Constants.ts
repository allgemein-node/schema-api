import exp = require('constants');
import {INamedOptions} from "./options/INamedOptions";

export const DEFAULT_NAMESPACE = 'default';
export const GLOBAL_NAMESPACE = '__global__';


export const C_IDENTIFIER = 'identifier';
export const C_TYPE = 'type';
export const C_NAME = 'name';
export const C_INTERNAL_NAME = 'internalName';
export const C_APPENDED = 'appended';
export const C_CARDINALITY = 'cardinality';


export const XS_DEFAULT_CLASSES = 'default_class_ref';

export const REFLECT_DESIGN_TYPE = 'design:type';
export const METATYPE_SCHEMA = 'schema';
export const METATYPE_ENTITY = 'entity';
export const METATYPE_NAMESPACE = 'namespace';
export const METATYPE_CLASS_REF = 'class_ref';
export const METATYPE_PROPERTY = 'property';
export const METATYPE_EMBEDDABLE = 'object';

export type METADATA_TYPE =
  'schema'
  | 'object'
  | 'entity'
  | 'property'
  | 'class_ref'
  | 'namespace';


export const BINDING_SCHEMA_ENTITY = 'schema_entity';
export const BINDING_SCHEMA_CLASS_REF = 'schema_class_ref';

export type METADATA_AND_BIND_TYPE = METADATA_TYPE
  | 'schema_entity'
  | 'entity_property'
  | 'property_entity'
  | 'schema_class_ref';

export type XS_DATA_TYPES = 'string' | 'number' | 'boolean' | 'entity' | 'array' | 'any';
export const XS_ID_SEPARATOR = '--';

export const XS_DEFAULT_SCHEMA = 'default';


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
  | 'array'
  | 'symbol'
  | 'null'
  | 'undefined'
  | 'bigint'
  ;

export const XS_ANNOTATION_OPTIONS_CACHE = 'anno_options_cache';
// export const XS_ANNOTATION_OPTIONS_CACHE = 'anno_options_cache';

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
  'string',
  'number',
  'boolean',
  'object',
  'symbol',
  'date',
  'null',
  'undefined',
  'bigint'
];


export const C_EVENT_ADD = 'add';
export const C_EVENT_REMOVE = 'remove';
export const C_EVENT_UPDATE = 'update';
export const C_EVENT_DRAIN_FINISHED = 'drain_finished';

export const T_STRING = 'string';
export const T_ARRAY = 'array';
export const T_OBJECT = 'object';
export const T_BOOLEAN = 'boolean';

export const C_PROP_NAME = 'name';
export const __CLASS__ = '__CLASS__';
export const __NS__ = '__NS__';
export const OPT_CREAT_AND_COPY = 'createAndCopy';

export const STATE_KEY = '$state';

export const K_PATTERN_PROPERTY = 'patternProperty';
export const K_TRIGGERED = Symbol('_triggered_');

export type CLASS_TYPE = Function | ClassType<any>;
export type MERGE_TYPE = 'default' | 'assign' | 'merge';

export interface IMinMax {
  min: number;
  max: number;
}


export const DEFAULT_KEY_TO_SKIP = [C_TYPE, '$ref', 'target', 'propertyName', 'metaType', 'namespace', C_NAME];

/**
 * Entity option signals that entity is generate by an other
 */
export const K_ENTITY_BUILT = '_built_';

export const DEFINED_PROPS_TO_OPTS = [K_ENTITY_BUILT];
