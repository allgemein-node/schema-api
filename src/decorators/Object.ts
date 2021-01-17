import {IObjectOptions} from '../lib/options/IObjectOptions';
import {EntityMetadataRegistry} from '../lib/EntityMetadataRegistry';


export function Object(options: IObjectOptions = {}) {
  return function (object: Function) {
    options.target = object;
    EntityMetadataRegistry.$().add('object', options);
  };
}

