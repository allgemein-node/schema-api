import {
  first,
  has,
  isEmpty,
  isFunction,
  isString,
  isUndefined,
  kebabCase,
  snakeCase,
  get,
  isBoolean,
  isObjectLike
} from 'lodash';
import {ClassUtils, NotYetImplementedError} from '@allgemein/base';
import {SchemaUtils} from './SchemaUtils';
import {
  __CLASS__,
  __NS__,
  C_PROP_NAME,
  DEFAULT_NAMESPACE,
  GLOBAL_NAMESPACE,
  METADATA_TYPE,
  METATYPE_CLASS_REF,
  METATYPE_ENTITY, METATYPE_NAMESPACE,
  METATYPE_PROPERTY,
  XS_ID_SEPARATOR
} from './Constants';
import {LookupRegistry} from './LookupRegistry';
import {IClassRef} from '../api/IClassRef';
import {IEntityRef} from '../api/IEntityRef';
import {IPropertyRef} from '../api/IPropertyRef';
import {IBuildOptions} from '../api/IBuildOptions';
import {RegistryFactory} from './registry/RegistryFactory';
import {AbstractRef} from './AbstractRef';
import {MetadataRegistry} from "./registry/MetadataRegistry";

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
export class ClassRef extends AbstractRef implements IClassRef {

  static __inc: number = 0;

  private readonly idx: number;

  /**
   * Original reference to the class function or the given class name as string
   */
  originalValue: string | Function;

  private _cacheEntity: IEntityRef;

  private _isPlaceholder: boolean = false;

  private _isAnonymous: boolean = false;

  extends: IClassRef[] = [];

  constructor(klass: string | Function, namespace: string = DEFAULT_NAMESPACE) {
    super(METATYPE_CLASS_REF, ClassRef.getClassName(klass), null, namespace);
    this._isAnonymous = isFunction(klass) && klass.name === 'anonymous';

    this.idx = ClassRef.__inc++;
    if (isString(klass)) {
      this.originalValue = klass;
      this._isPlaceholder = true;
    } else {
      this.originalValue = ClassUtils.getFunction(klass);
    }
  }


  isPlaceholder() {
    return this._isPlaceholder;
  }


  isAnonymous() {
    return this._isAnonymous;
  }

  getClassRefFor(object: string | Function | IClassRef, type: METADATA_TYPE): IClassRef {
    return ClassRef.get(<string | Function>object, this.namespace, type == METATYPE_PROPERTY);
  }

  static getClassName(k: any) {
    if (k[__CLASS__]) {
      return k[__CLASS__];
    }
    return ClassUtils.getClassName(k);
  }


  updateClass(cls: Function) {
    this.originalValue = ClassUtils.getFunction(cls);
    this._isPlaceholder = false;
  }


  get className() {
    return this.name;
  }

  get storingName() {
    let name = this.getOptions(C_PROP_NAME, this.className);
    return snakeCase(name);
  }

  set storingName(v: string) {
    this.setOption(C_PROP_NAME, v);
  }

  /**
   * Check if name is passed by options
   */
  hasName() {
    return this.hasOption(C_PROP_NAME);
  }

  /**
   * Return the namespace for/of this class
   */
  getNamespace() {
    return this.namespace;
  }

  /**
   * TODO implement
   *
   * @param namespace
   */
  switchNamespace(namespace: string) {
    // this.getRegistry().remove(METATYPE_CLASS_REF, (x: IClassRef) => x.getClass() === this.getClass());
    // this.namespace = namespace;
    // this.getRegistry().add(METATYPE_CLASS_REF, this);
  }

  isOf(instance: any): boolean {
    const name = ClassRef.getClassName(instance);
    // if(name)
    if (name && name === this.name) {
      return true;
    } else if (has(instance, __CLASS__) && instance[__CLASS__] === this.name) {
      return true;
    } else {
      return this.getPropertyRefs()
        .map(x => has(instance, x.name))
        .reduce((previousValue, currentValue) => previousValue && currentValue, true);
    }
    return false;
  }


  get machineName() {
    return snakeCase(this.className);
  }


  getClass(create: boolean = false): Function {
    if (isFunction(this.originalValue)) {
      return this.originalValue;
    } else if (isString(this.originalValue) && this.isPlaceholder) {
      if (create) {
        this.originalValue = SchemaUtils.clazz(this.originalValue);
        return this.originalValue;
      }
    }
    throw new NotYetImplementedError('getClass for ' + this.originalValue);
  }


  static find(klass: string | Function, namespace: string = DEFAULT_NAMESPACE): ClassRef {
    const registry = namespace === GLOBAL_NAMESPACE ? LookupRegistry : LookupRegistry.$(namespace);
    let className = ClassRef.getClassName(klass);
    let classRef = null;
    if (isString(klass)) {
      classRef = registry.find<ClassRef>(METATYPE_CLASS_REF,
        (c: ClassRef) => c.className === className
      );
    } else {
      classRef = registry.find<ClassRef>(METATYPE_CLASS_REF,
        (c: ClassRef) =>
          c.getClass(true) === klass ||
          (c.isPlaceholder() && c.className === className)
      );
    }
    return classRef;
  }


  /**
   * get all class refs for some class name
   *
   * @param klass
   */
  static getAllByClassName(klass: any): IClassRef[] {
    let name = ClassRef.getClassName(klass);
    return LookupRegistry.filter<ClassRef>(METATYPE_CLASS_REF, (c: IClassRef) => c.name == name);
  }


  /**
   * filter function for classrefs
   *
   * @param klass
   */
  static filter(fn: (c: IClassRef) => boolean): IClassRef[] {
    return LookupRegistry.filter<IClassRef>(METATYPE_CLASS_REF, fn);
  }


  static checkIfFunctionCallback(klass: string | Function) {
    if (isFunction(klass)) {
      // maybe function which return type like () => type
      let name = ClassRef.getClassName(klass);

      if (isEmpty(name)) {
        let fn = null;
        try {
          fn = klass();
        } catch (e) {
        }
        if (fn) {
          let name = ClassRef.getClassName(fn);
          if (!isEmpty(name)) {
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
  static get(klass: string | Function,
             namespace: string = GLOBAL_NAMESPACE,
             options?: boolean | { resolve?: boolean, checkNamespace?: boolean }): ClassRef {
    const resolve = isBoolean(options) ? options : get(options || {}, 'resolve', false);
    if (resolve) {
      klass = this.checkIfFunctionCallback(klass);
    }

    const checkNs = isObjectLike(options) ? get(options || {}, 'checkNamespace', false) : false;
    const isAnonymous = isFunction(klass) && klass.name === 'anonymous';

    if (checkNs) {
      const ns = MetadataRegistry.$().getByContextAndTarget(METATYPE_NAMESPACE, isFunction(klass) ? klass.name : klass);
      if (ns.length > 0) {
        namespace = get(first(ns), 'attributes.' + METATYPE_NAMESPACE, namespace);
      }
    }

    let classRef = this.find(klass, namespace);
    if (classRef) {
      if (classRef.isPlaceholder && isFunction(klass) && !isAnonymous) {
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
    if (isFunction(klass)) {
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
    if (isUndefined(this._cacheEntity)) {
      this._cacheEntity = this.getRegistry().find(METATYPE_ENTITY, (x: IEntityRef) => x.getClassRef() === this);
    }
    return this._cacheEntity;
  }

  hasEntityRef() {
    return !!this.getEntityRef();
  }


  create<T>(addinfo: boolean = true): T {
    return this.new(addinfo);
  }


  new<T>(addinfo: boolean = true): T {
    let klass = this.getClass();
    let instance = Reflect.construct(klass, []);
    if (addinfo) {
      Reflect.defineProperty(instance, __NS__, {value: this.namespace, enumerable: true});
      Reflect.defineProperty(instance, __CLASS__, {value: this.className, enumerable: true});
    }
    return instance;
  }


  getPropertyRefs(): IPropertyRef[] {
    const inheritedProps = [].concat(...this.getExtends().map(x => x.getPropertyRefs()));
    const registeredProps = this.getRegistry().getPropertyRefs(this);
    inheritedProps.forEach((x: IPropertyRef) => {
      if (!registeredProps.find(z => x.name === z.name)) {
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
    return [this.namespace, this.className].map(x => kebabCase(x)).join(XS_ID_SEPARATOR);
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
    return !isEmpty(this.extends) ? first(this.extends) : null;
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
    return ref;
  }


}
