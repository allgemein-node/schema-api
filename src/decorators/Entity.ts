// import {EntityRegistry} from '../EntityRegistry';
// import {IEntity} from '../registry/IEntity';


import {IEntityOptions} from '../lib/options/IEntityOptions';
import {MetaArgs} from '@allgemein/base/browser';
import {METADATA_PROPERTY_KEY} from '..';

export function Entity(options: IEntityOptions = {}) {
  return function (object: Function) {
    //
    // const xsDef = EntityRegistry.createEntity(object, options);
    // EntityRegistry.register(xsDef);
    options.sourceClass = object;
    MetaArgs.key(METADATA_PROPERTY_KEY).push(options);


  };
}

