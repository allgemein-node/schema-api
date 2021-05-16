import {isFunction, isString} from 'lodash';

import {IPropertyOptions} from '../lib/options/IPropertyOptions';
import {MetadataRegistry} from '../lib/registry/MetadataRegistry';
import {METATYPE_PROPERTY} from '../lib/Constants';


export function PropertyOf(propertyName: string, entityOrOptions: IPropertyOptions | string | Function, options: IPropertyOptions = null) {
  return function (object: any) {
    if (!options) {
      options = {};
    }

    if (isString(entityOrOptions) || isFunction(entityOrOptions)) {
      options.target = entityOrOptions;
    } else {
      options = <IPropertyOptions>entityOrOptions;
    }

    options.appended = true;
    options.type = object;
    if (propertyName) {
      options.propertyName = propertyName;
    }
    MetadataRegistry.$().add(METATYPE_PROPERTY, options);
  };
}
