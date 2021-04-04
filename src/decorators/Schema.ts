import {ISchemaOptions} from '../lib/options/ISchemaOptions';
import {METATYPE_SCHEMA} from '../lib/Constants';
import {MetadataRegistry} from '../lib/registry/MetadataRegistry';


export function Schema(options: ISchemaOptions) {
  return function (object: Function) {
    options.target = object;
    MetadataRegistry.$().add(METATYPE_SCHEMA, options);
  };
}

