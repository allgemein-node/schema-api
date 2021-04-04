import * as _ from 'lodash';
import {ClassUtils, NotYetImplementedError} from '@allgemein/base/browser';
import {SchemaUtils} from './SchemaUtils';
import {
  __CLASS__,
  __NS__,
  C_PROP_NAME,
  DEFAULT_NAMESPACE,
  GLOBAL_NAMESPACE,
  METATYPE_CLASS_REF,
  METATYPE_ENTITY,
  XS_ID_SEPARATOR
} from './Constants';
import {LookupRegistry} from './LookupRegistry';
import {IClassRef} from '../api/IClassRef';
import {IEntityRef} from '../api/IEntityRef';
import {IPropertyRef} from '../api/IPropertyRef';
import {IBuildOptions} from '../api/IBuildOptions';
import {RegistryFactory} from './registry/RegistryFactory';

/**
 * Reflective reference to a class function
 *
 * There can exist multiple ClassRef depending of context for a single class function.
 * The context is defined by the lookup registry.
 * It can be also a placeholder, for a dummy or later loaded class.
 *
 * This is a default implementation for IClassRef
 *

 class can be in different namespaces
 */
export class ClassRef implements IClassRef {

  static __inc: number = 0;

  private namespace: string = DEFAULT_NAMESPACE;

  private readonly idx: number;

  /**
   * Original reference to the class function or the given class name as string
   */
  originalValue: string | Function;

  readonly className: string;

  private _cacheEntity: IEntityRef;

  private _options: any = {};

  isEntity: boolean = false;

  isPlaceholder: boolean = false;

  readonly metaType = METATYPE_CLASS_REF;

  extends: IClassRef[] = [];

  constructor(klass: string | Function, namespace: string = DEFAULT_NAMESPACE) {
    this.className = ClassRef.getClassName(klass);
    this.namespace = namespace;
    if (_.isString(klass)) {
      this.originalValue = klass;
      this.isPlaceholder = true;
    } else {
      this.originalValue = ClassUtils.getFunction(klass);
    }
    this.idx = ClassRef.__inc++;

  }


  static getClassName(k: any) {
    if (k[__CLASS__]) {
      return k[__CLASS__];
    }
    return ClassUtils.getClassName(k);
  }


  updateClass(cls: Function) {
    this.originalValue = ClassUtils.getFunction(cls);
    this.isPlaceholder = false;
  }

  getOptions(key?: string): any {
    if (key) {
      return _.get(this._options, key);
    }
    return this._options;
  }

  setOptions(options: any) {
    if (options && !_.isEmpty(_.keys(options))) {
      this._options = options;
    }
  }

  setOption(key: string, value: any) {
    if (!this._options) {
      this._options = {};
    }
    _.set(this._options, key, value);
  }

  get name() {
    return this.className;
  }


  get storingName() {
    let name = _.get(this._options, C_PROP_NAME, this.className);
    return _.snakeCase(name);
  }

  set storingName(v: string) {
    _.set(this._options, C_PROP_NAME, v);
  }

  /**
   * Check if name is passed by options
   */
  hasName() {
    return _.has(this._options, C_PROP_NAME);
  }

  /**
   * Return the namespace for/of this class
   */
  getNamespace() {
    return this.namespace;
  }


  switchNamespace(namespace: string) {
    this.getRegistry().remove(METATYPE_CLASS_REF, (x: IClassRef) => x.getClass() === this.getClass());
    this.namespace = namespace;
    this.getRegistry().add(METATYPE_CLASS_REF, this);
  }


  get machineName() {
    return _.snakeCase(this.className);
  }


  getClass(create: boolean = false): Function {
    if (_.isFunction(this.originalValue)) {
      return this.originalValue;
    } else if (_.isString(this.originalValue) && this.isPlaceholder) {
      if (create) {
        this.originalValue = SchemaUtils.clazz(this.originalValue);
        return this.originalValue;
      }
    }
    throw new NotYetImplementedError('getClass for ' + this.originalValue);
  }


  static find(klass: string | Function, namespace: string = DEFAULT_NAMESPACE): ClassRef {
    let name = ClassRef.getClassName(klass);
    let classRef = null;
    if (namespace === GLOBAL_NAMESPACE) {
      classRef = LookupRegistry.find<ClassRef>(METATYPE_CLASS_REF, (c: ClassRef) => c.className == name);
    } else {
      classRef = LookupRegistry.$(namespace).find<ClassRef>(METATYPE_CLASS_REF, (c: ClassRef) => c.className == name);
    }
    return classRef;
  }


  /**
   * get all class refs for some class name
   *
   * @param klass
   */
  static getAllByClassName(klass: any): ClassRef[] {
    let name = ClassRef.getClassName(klass);
    return LookupRegistry.filter<ClassRef>(METATYPE_CLASS_REF, (c: ClassRef) => c.className == name);
  }


  /**
   * filter function for classrefs
   *
   * @param klass
   */
  static filter(fn: (c: ClassRef) => boolean): ClassRef[] {
    return LookupRegistry.filter<ClassRef>(METATYPE_CLASS_REF, fn);
  }


  static checkIfFunctionCallback(klass: string | Function) {
    if (_.isFunction(klass)) {
      // maybe function which return type like () => type
      let name = ClassRef.getClassName(klass);

      if (_.isEmpty(name)) {
        let fn = null;
        try {
          //fn = klass();
        } catch (e) {

        }
        if (fn) {
          let name = ClassRef.getClassName(fn);
          if (!_.isEmpty(name)) {
            klass = fn;
          }
        }
      }
    }
    return klass;
  }


  /**
   * check if class reference already exists for given string or Function, if not create a new one
   *
   * @param klass
   * @param namespace
   * @param resolve
   */
  static get(klass: string | Function, namespace: string = GLOBAL_NAMESPACE, resolve: boolean = false): ClassRef {
    if (resolve) {
      klass = this.checkIfFunctionCallback(klass);
    }
    let classRef = this.find(klass, namespace);
    if (classRef) {
      if (classRef.isPlaceholder && _.isFunction(klass)) {
        classRef.updateClass(klass);
      }
      return classRef;
    }

    if (namespace === GLOBAL_NAMESPACE) {
      namespace = DEFAULT_NAMESPACE;
    }
    return this.createRef(klass, namespace);
  }

  /**
   * Create a class ref.
   *
   * @param klass
   * @param namespace
   */
  static createRef(klass: Function | string, namespace: string = GLOBAL_NAMESPACE) {
    const classRef = new ClassRef(klass, namespace);
    if (_.isFunction(klass)) {
      const proto = SchemaUtils.getInherited(klass);
      if (proto) {
        // is extends
        // TODO how to handle cirlces
        const extendRef = ClassRef.get(proto, namespace);
        classRef.addExtend(extendRef);
      }
    }
    return classRef.getRegistry().add(METATYPE_CLASS_REF, classRef);
  }


  /**
   * return global class reference
   *
   * @param klass
   * @param resolve
   */
  static getGlobal(klass: string | Function, resolve: boolean = false): ClassRef {
    return this.get(klass, GLOBAL_NAMESPACE, resolve);
  }


  getRegistry() {
    return RegistryFactory.get(this.namespace);
  }


  getEntityRef(): IEntityRef {
    if (!this._cacheEntity) {
      this._cacheEntity = this.getRegistry().find(METATYPE_ENTITY, (x: IEntityRef) => x.getClassRef().id() === this.id());
    }
    return this._cacheEntity;
  }


  create<T>(addinfo: boolean = true): T {
    return this.new(addinfo);
  }


  new<T>(addinfo: boolean = true): T {
    let klass = this.getClass();
    let instance = Reflect.construct(klass, []);
    if (addinfo) {
      Reflect.defineProperty(instance, 'xs:namespace', {value: this.namespace});
      Reflect.defineProperty(instance, 'xs:name', {value: this.className});
      Reflect.defineProperty(instance, __NS__, {value: this.namespace});
      Reflect.defineProperty(instance, __CLASS__, {value: this.className});
    }
    return instance;
  }


  getPropertyRefs(): IPropertyRef[] {
    const inheritedProps = [].concat(...this.getExtends().map(x => x.getPropertyRefs()));
    const registeredProps = this.getRegistry().getPropertyRefs(this);
    inheritedProps.forEach(x => {
      if (!!registeredProps.find(z => x.name === z.name)) {
        registeredProps.push(x);
      }
    });
    return registeredProps;
  }


  getPropertyRef(name: string): IPropertyRef {
    let registeredProp = this.getRegistry().getPropertyRef(this, name);
    if (registeredProp) {
      return registeredProp;
    } else {
      for (const clsRef of this.getExtends()) {
        registeredProp = clsRef.getPropertyRef(name);
        if (registeredProp) {
          return registeredProp;
        }
      }
    }
    return null;
  }


  id() {
    return [this.namespace, this.className].map(x => _.snakeCase(x)).join(XS_ID_SEPARATOR);
  }


  build<T>(data: any, options: IBuildOptions = {}): T {
    return <T>SchemaUtils.transform(this, data, options);
  }

  /**
   * Return base inherited class for the underlying class
   * ```
   * class X exnteds Y { }
   * ```
   * Y would be returned.
   *
   */
  getExtend(): IClassRef {
    return !_.isEmpty(this.extends) ? _.first(this.extends) : null;
  }

  /**
   * Return all inherited classes for underlying class. Mostly added manually.
   *
   */
  getExtends(): IClassRef[] {
    return this.extends;
  }

  /**
   * Append extend class ref.
   * @param ref
   */
  addExtend(ref: IClassRef) {
    this.extends.push(ref);
  }

}
