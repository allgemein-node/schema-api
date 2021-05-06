import {IObjectOptions} from '../lib/options/IObjectOptions';
import {METATYPE_EMBEDDABLE} from '../lib/Constants';
import {MetadataRegistry} from '../lib/registry/MetadataRegistry';


export function Embeddable(options: IObjectOptions = {}) {
  return function (object: Function) {
    options.target = object;
    MetadataRegistry.$().add(METATYPE_EMBEDDABLE, options);
  };
}

