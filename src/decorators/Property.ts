import 'reflect-metadata';
import * as _ from 'lodash';
import {ClassUtils} from '@allgemein/base/browser';
import {IPropertyOptions} from '../lib/options/IPropertyOptions';
import {JS_DATA_TYPES, JS_PRIMATIVE_TYPES, METATYPE_PROPERTY, REFLECT_DESIGN_TYPE, T_STRING} from '../lib/Constants';
import {MetadataRegistry} from '../lib/registry/MetadataRegistry';

export function Property(typeOrOptions: IPropertyOptions | Function | string = null) {
  return function (source: any, propertyName: string) {

    let options: IPropertyOptions = {
      type: undefined
    };


    if (_.isString(typeOrOptions)) {
      options.type = <JS_DATA_TYPES>typeOrOptions;
    } else if (_.isFunction(typeOrOptions)) {
      const name = ClassUtils.getClassName(typeOrOptions);
      if ([Function.name, '', 'type'].includes(name)) {
        options.type = typeOrOptions();
      } else {
        options.type = typeOrOptions;
      }
    } else if (typeOrOptions && _.isObjectLike(typeOrOptions)) {
      _.assign(options, typeOrOptions);
      if (options.type && _.isFunction(options.type)) {
        const name = ClassUtils.getClassName(options.type);
        if ([Function.name, '', 'type'].includes(name)) {
          options.type = options.type();
        }
      }
    }

    options.target = source.constructor;
    options.propertyName = propertyName;

    if (!options.type) {
      const reflectMetadataType = Reflect && Reflect.getMetadata ? Reflect.getMetadata(REFLECT_DESIGN_TYPE, source, propertyName) : undefined;
      if (reflectMetadataType) {
        const className = ClassUtils.getClassName(reflectMetadataType);
        if (JS_PRIMATIVE_TYPES.includes(className.toLowerCase() as any)) {
          options.type = className.toLowerCase();
        } else if (className === Array.name) {
          options.type = 'object'
          options.cardinality = 0;
        } else {
          options.type = reflectMetadataType;
        }
      } else {
        options.type = T_STRING;
      }
    }

    MetadataRegistry.$().add(METATYPE_PROPERTY, options);

  };
}
