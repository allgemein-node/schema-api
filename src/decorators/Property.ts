
import 'reflect-metadata';
import * as _ from 'lodash';
import {ClassUtils, MetaArgs} from 'commons-base/browser';
import {IPropertyOptions} from '../lib/options/IPropertyOptions';
import {
  JS_DATA_TYPES,
  JS_PRIMATIVE_TYPES,
  METADATA_PROPERTY_KEY,
  METADATA_SCHEMA_KEY
} from '../libs/schema_api/Constants';

export function Property(typeOrOptions: IPropertyOptions | Function | string = null) {
  return function (source: any, propertyName: string) {
    let options: IPropertyOptions = {};
    // source = ClassUtils.getFunction(source);

    if (_.isString(typeOrOptions)) {
      options.type = <JS_DATA_TYPES>typeOrOptions;
    } else if (_.isFunction(typeOrOptions)) {
      const name = ClassUtils.getClassName(typeOrOptions);
      if (name === '' || name === 'Function') {
        options.type = typeOrOptions();
      } else {
        options.type = typeOrOptions;
      }
    } else if (!_.isEmpty(typeOrOptions)) {
      options = <IPropertyOptions>typeOrOptions;
    }

    // deprecated
    if (options.targetClass && !options.type) {
      options.type = options.targetClass;
    }

    options.sourceClass = source.constructor;
    options.propertyName = propertyName;

    if (_.isEmpty(options.type)) {
      const reflectMetadataType = Reflect && Reflect.getMetadata ? Reflect.getMetadata('design:type', source, propertyName) : undefined;
      if (reflectMetadataType) {
        const className = ClassUtils.getClassName(reflectMetadataType);
        if (JS_PRIMATIVE_TYPES.includes(className.toLowerCase() as any)) {
          options.type = className.toLowerCase();
        } else if (className === 'Array') {
          options.cardinality = 0;
        } else {
          options.type = reflectMetadataType;
        }
      } else {
        options.type = 'string';
      }
    }

    MetaArgs.key(METADATA_PROPERTY_KEY).push(options);
  };
}
