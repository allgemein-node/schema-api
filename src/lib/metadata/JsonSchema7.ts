import {JSONSchema7} from 'json-schema';
import {IClassRef} from '../../api/IClassRef';
import {IEntityRef} from '../../api/IEntityRef';

export interface IJsonSchema7 extends JSONSchema7 {
  $target?: Function | IClassRef | IEntityRef;
  definitions?: {
    [key: string]: IJsonSchema7Definition;
  };
}


export type IJsonSchema7Definition = IJsonSchema7 | boolean;


export type IJsonSchema7TypeName =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'object'
  | 'array'
  | 'null';

export const JSON_SCHEMA_7_TYPES: IJsonSchema7TypeName[] = [
  'string'
  , 'number'
  , 'integer'
  , 'boolean'
  , 'object'
  , 'array'
  , 'null'
];


export function hasClassInDefinition(name: string, def: IJsonSchema7) {
  return def && def.definitions && def.definitions[name];
}

export function hasClassPropertiesInDefinition(name: string, def: IJsonSchema7) {
  return hasClassInDefinition(name, def) && (def.definitions[name] as IJsonSchema7).properties;
}
