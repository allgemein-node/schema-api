import {IObjectOptions} from '../lib/options/IObjectOptions';
import {METATYPE_OBJECT} from '../lib/Constants';
import {MetadataRegistry} from '../lib/registry/MetadataRegistry';


export function Embeddable(options: IObjectOptions = {}) {
  return function (object: Function) {
    options.target = object;
    MetadataRegistry.$().add(METATYPE_OBJECT, options);
  };
}

