import {IEntityOptions} from '../lib/options/IEntityOptions';
import {EntityMetadataRegistry} from '../lib/EntityMetadataRegistry';

export function Entity(options: IEntityOptions = {}) {
  return function (object: Function) {
    options.target = object;
    EntityMetadataRegistry.$().add('entity', options);
  };
}

