import * as _ from 'lodash';
import {IPropertyRef} from '../../api/IPropertyRef';
import {AbstractRef} from '../AbstractRef';
import {IBuildOptions} from '../../api/IBuildOptions';
import {IClassRef, isClassRef} from '../../api/IClassRef';
import {DEFAULT_NAMESPACE, IMinMax, JS_DATA_TYPES, METATYPE_PROPERTY} from '../Constants';
import {IPropertyOptions} from '../options/IPropertyOptions';
import {ClassRef} from '../ClassRef';


export class DefaultPropertyRef extends AbstractRef<IPropertyOptions> implements IPropertyRef {

  cardinality: IMinMax | number = 1;

  reference: boolean = undefined;

  targetRef: IClassRef;

  constructor(options: IPropertyOptions = {}) {
    super(METATYPE_PROPERTY, options.propertyName, options.target, options.namespace ? options.namespace : DEFAULT_NAMESPACE);
    this.setOptions(options);
    this.cardinality = _.has(options, 'cardinality') ? options.cardinality : 1;
  }

  /**
   * TODO
   */
  convert(i: any, options?: IBuildOptions): any {
  }

  get(instance: any): any {
    return _.get(instance, this.name);
  }


  getTargetRef(): IClassRef {
    this.checkReference();
    return this.targetRef;
  }

  getType(): string {
    return this.options.type;
  }


  /**
   * TODO
   */
  id(): string {
    return '';
  }

  /**
   * check if property parameter is an array
   */
  isCollection(): boolean {
    if (_.isObjectLike(this.cardinality) &&
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
    if (_.isUndefined(this.reference)) {
      this.reference = false;
      const type = this.getType();
      if (!_.isString(type) && isClassRef(type)) {
        this.targetRef = type;
        this.reference = true;
      } else if (_.isFunction(type) ||
        (_.isString(type) && !JS_DATA_TYPES.includes(<any>type))) {
        // try get existing
        const exists = ClassRef.get(type, this.getClassRef().getNamespace());
        if (exists) {
          this.targetRef = exists;
          this.reference = true;
        }
      }
    }
    return this.reference;
  }


}
