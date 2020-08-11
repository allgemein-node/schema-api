// import {EntityRegistry} from '../EntityRegistry';
// import {IEntity} from '../registry/IEntity';


import {IEntityOptions} from '../lib/options/IEntityOptions';
import {METADATA_ENTITY_KEY, METADATA_PROPERTY_KEY} from '..';
import {MetadataStorage} from '@allgemein/base/libs/MetadataStorage';

export function Entity(options: IEntityOptions = {}) {
  return function (object: Function) {
    options.sourceClass = object;
    MetadataStorage.key(METADATA_ENTITY_KEY).push(options);
  };
}

