import {ISchemaOptions} from '../lib/options/ISchemaOptions';
import {EntityMetadataRegistry} from '../lib/EntityMetadataRegistry';


export function Schema(options: ISchemaOptions) {
  return function (object: Function) {
    options.target = object;
    EntityMetadataRegistry.$().add('schema', options);
  };
}

