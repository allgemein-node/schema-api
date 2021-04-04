import {IEntityOptions} from '../lib/options/IEntityOptions';
import {METATYPE_ENTITY} from '../lib/Constants';
import {MetadataRegistry} from '../lib/registry/MetadataRegistry';

export function Entity(options: IEntityOptions = {}) {
  return function (object: Function) {
    options.target = object;
    MetadataRegistry.$().add(METATYPE_ENTITY, options);
  };
}

