import {isFunction, isString} from 'lodash';

import {IPropertyOptions} from '../lib/options/IPropertyOptions';


export function PropertyOf(propertyName: string, entityOrOptions: IPropertyOptions | string | Function, options: IPropertyOptions = null) {
  return function (object: any) {
    if (!options) {
      options = {propertyName: null, sourceClass: null};
    }

    if (isString(entityOrOptions) || isFunction(entityOrOptions)) {
      options.sourceClass = entityOrOptions;
    } else {
      options = <IPropertyOptions>entityOrOptions;
    }

    options.propertyClass = object;
    if (propertyName) {
      options.propertyName = propertyName;
    }

    // const xsDef = EntityRegistry.createProperty(options);
    // EntityRegistry.register(xsDef);
  };
}
