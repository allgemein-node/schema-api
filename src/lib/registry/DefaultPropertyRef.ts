import {get, has, isArray, isBoolean, isFunction, isNumber, isObjectLike, isString, isUndefined} from 'lodash';

import {IPropertyRef} from '../../api/IPropertyRef';
import {AbstractRef} from '../AbstractRef';
import {IBuildOptions} from '../../api/IBuildOptions';
import {IClassRef, isClassRef} from '../../api/IClassRef';
import {
  DEFAULT_NAMESPACE,
  IMinMax,
  JS_DATA_TYPES,
  METADATA_TYPE,
  METATYPE_PROPERTY,
  XS_ID_SEPARATOR
} from '../Constants';
import {IPropertyOptions} from '../options/IPropertyOptions';
import {ClassRef} from '../ClassRef';
import {NotYetImplementedError} from '@allgemein/base/browser';
import {AnnotationsHelper} from '../AnnotationsHelper';
import {ILookupRegistry} from '../../api/ILookupRegistry';
import {RegistryFactory} from './RegistryFactory';


export class DefaultPropertyRef extends AbstractRef implements IPropertyRef {

  cardinality: IMinMax | number = 1;

  reference: boolean = undefined;

  targetRef: IClassRef;

  constructor(options: IPropertyOptions = {}) {
    super(METATYPE_PROPERTY, options.propertyName, options.target, options.namespace ? options.namespace : DEFAULT_NAMESPACE);
    AnnotationsHelper.merge(this.object, options, this.name);
    this.setOptions(options);
    this.cardinality = has(options, 'cardinality') ? options.cardinality : 1;
  }


  getRegistry(): ILookupRegistry {
    return RegistryFactory.get(this.namespace);
  }

  /**
   * TODO
   */
  convert(data: any, options?: IBuildOptions): any {
    const sourceType = this.getType();
    if (!sourceType || !isString(sourceType)) {
      return data;
    }

    const jsType = sourceType.toLowerCase();
    const [baseType, variant] = jsType.split(':');

    switch (baseType) {
      case 'datetime':
      case 'timestamp':
      case 'date':
        return new Date(data);

      case 'time':
      case 'text':
      case 'string':
        if (isString(data)) {
          return data;
        } else if (isArray(data) && data.length === 1) {
          return data[0];
        } else if (data) {
          return JSON.stringify(data);
        } else {
          return null;
        }
        break;

      case 'boolean':

        if (isBoolean(data)) {
          return data;
        } else if (isNumber(data)) {
          return data > 0;
        } else if (isString(data)) {
          if (data.toLowerCase() === 'true' || data.toLowerCase() === '1') {
            return true;
          }
          return false;
        }
        break;

      case 'double':
      case 'number':
        if (isString(data)) {
          if (/^\d+\.|\,\d+$/.test(data)) {
            return parseFloat(data.replace(',', '.'));
          } else if (/^\d+$/.test(data)) {
            return parseInt(data, 0);
          } else {
          }
        } else if (isNumber(data)) {
          return data;
        } else if (isBoolean(data)) {
          return data ? 1 : 0;
        } else {
          // Pass to exception
        }
        break;


      case 'byte':
      case 'json':
      case 'object':
      case 'array':
        return data;
    }

    throw new NotYetImplementedError('value "' + data + '" of type ' + (typeof data) + ' column type=' + jsType);
  }


  get(instance: any): any {
    return get(instance, this.name, null);
  }


  getTargetRef(): IClassRef {
    this.checkReference();
    return this.targetRef;
  }

  getType(): string {
    return this.getOptions('type');
  }


  /**
   * TODO
   */
  id(): string {
    return [this.getClassRef().id(), this.name].join(XS_ID_SEPARATOR);
  }

  /**
   * check if property parameter is an array
   */
  isCollection(): boolean {
    if (isObjectLike(this.cardinality) &&
      (<IMinMax>this.cardinality).min >= 0 &&
      (<IMinMax>this.cardinality).max >= 0) {
      return true;
    }
    return this.cardinality !== 1;
  }

  /**
   * TODO
   */
  isIdentifier(): boolean {
    return false;
  }

  /**
   * Returns info if property parameter results are in classspace
   */
  isReference(): boolean {
    this.checkReference();
    return this.reference;
  }

  private checkReference() {
    if (isUndefined(this.reference)) {
      this.reference = false;
      const type = this.getType();
      if (!isString(type) && isClassRef(type)) {
        this.targetRef = type;
        this.reference = true;
      } else if (isFunction(type) ||
        (isString(type) && !JS_DATA_TYPES.find(t => (new RegExp('^' + t + ':?')).test((<string>type).toLowerCase())))) {
        // try get existing class
        const exists = ClassRef.get(type, this.getClassRef().getNamespace());
        if (exists) {
          this.targetRef = exists;
          this.reference = true;
        }
      }
    }
    return this.reference;
  }

  getClassRefFor(object: string | Function | IClassRef, type: METADATA_TYPE): IClassRef {
    return this.getRegistry().getClassRefFor(object, this.metaType);
  }


}
