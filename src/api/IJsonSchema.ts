import {IJsonSchemaSerializeOptions} from '../lib/json-schema/IJsonSchemaSerializeOptions';
import {IClassRef} from './IClassRef';
import {IEntityRef} from './IEntityRef';
import {IJsonSchemaUnserializeOptions} from '../lib/json-schema/IJsonSchemaUnserializeOptions';


export function supportsJsonSchemaExport(x: any): x is IJsonSchema {
  if (x.toJsonSchema) {
    return true;
  }
  return false;
}

export function supportsJsonSchemaImport(x: any): x is IJsonSchema {
  if (x.fromJsonSchema) {
    return true;
  }
  return false;
}


export function supportsJsonSchema(x: any): x is IJsonSchema {
  if (supportsJsonSchemaExport(x) && supportsJsonSchemaImport(x)) {
    return true;
  }
  return false;
}


export interface IJsonSchema {

  toJsonSchema?(options?: IJsonSchemaSerializeOptions): Promise<any>;

  fromJsonSchema?(data: any, options?: IJsonSchemaUnserializeOptions): Promise<IClassRef | IEntityRef | (IClassRef | IEntityRef)[]>;

}
