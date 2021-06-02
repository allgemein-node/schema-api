import {IJsonSchemaSerializeOptions} from '../lib/json-schema/IJsonSchemaSerializeOptions';
import {IClassRef} from './IClassRef';
import {IEntityRef} from './IEntityRef';
import {IJsonSchemaUnserializeOptions} from '../lib/json-schema/IJsonSchemaUnserializeOptions';
import {ISerializeOptions} from '../lib/serializer/ISerializeOptions';
import {IUnserializeOptions} from '../lib/serializer/IUnserializeOptions';


export function supportsSerialize(x: any): x is ISerializeSupport {
  if (x.serialize) {
    return true;
  }
  return false;
}

export function supportsUnserialize(x: any): x is ISerializeSupport {
  if (x.unserialize) {
    return true;
  }
  return false;
}


export function supportsSerialization(x: any): x is ISerializeSupport {
  if (supportsSerialize(x) && supportsUnserialize(x)) {
    return true;
  }
  return false;
}


export interface ISerializeSupport {

  serialize?(options?: ISerializeOptions): Promise<any>;

  unserialize?(data: any, options?: IUnserializeOptions): Promise<IClassRef | IEntityRef | (IClassRef | IEntityRef)[]>;

}
