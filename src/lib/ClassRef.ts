import * as _ from 'lodash';
import {ClassUtils, NotYetImplementedError} from '@allgemein/base/browser';
import {SchemaUtils} from './SchemaUtils';
import {
  XS_DEFAULT,
  XS_DEFAULT_SCHEMA,
  XS_GLOBALLY,
  XS_ID_SEPARATOR, XS_TYPE_BINDING_SCHEMA_CLASS_REF,
  XS_TYPE_CLASS_REF,
  XS_TYPE_ENTITY,
  XS_TYPE_PROPERTY,
  XS_TYPE_SCHEMA
} from './Constants';
import {LookupRegistry} from './LookupRegistry';
import {Binding} from './Binding';
import {IEntityRef} from './IEntityRef';
import {IPropertyRef} from './IPropertyRef';
import {IClassRef} from './IClassRef';
import {IBuildOptions} from './IBuildOptions';
import {IClassRefMetadata} from './metadata/IClassRefMetadata';
import {ISchemaRef} from './ISchemaRef';

/**
 * Reflective reference to a class function
 *
 * There can exist multiple ClassRef depending of context for a single class function.
 * The context is defined by the lookup registry.
 * It can be also a placeholder, for a dummy or later loaded class.
 *
 * This is a default implementation for IClassRef
 *
 */
export class ClassRef implements IClassRef {

  static __inc: number = 0;

  private context: string = XS_DEFAULT;

  private readonly idx: number;

  // schema: string = XS_DEFAULT_SCHEMA;

  /**
   * Original reference to the class function or the given class name as string
   */
  originalValue: string | Function;

  readonly className: string;

  private _cacheEntity: IEntityRef;

  private _options: any = {};

  isEntity: boolean = false;

  isPlaceholder: boolean = false;

  readonly baseType = XS_TYPE_CLASS_REF;

  constructor(klass: string | Function) {
    this.className = ClassUtils.getClassName(klass);
    if (_.isString(klass)) {
      this.originalValue = klass;
      this.isPlaceholder = true;
    } else {
      this.originalValue = ClassUtils.getFunction(klass);
    }
    this.idx = ClassRef.__inc++;

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
    let name = _.get(this._options, 'name', this.className);
    return _.snakeCase(name);
  }

  set storingName(v: string) {
    _.set(this._options, 'name', v);
  }

  hasName() {
    return _.has(this._options, 'name');
  }

  setSchemas(s: string[]) {
    s.forEach((s: string) => {
      this.setSchema(s);
    });
  }

  setSchema(s: string) {
    const schema = this.getLookupRegistry().find(XS_TYPE_SCHEMA, (x: ISchemaRef) => x.name === s);
    if(!schema){

    }
    const binding = Binding.create(XS_TYPE_SCHEMA, schema, XS_TYPE_CLASS_REF, this);
    this.getLookupRegistry().find()
    this.schema = s;
  }

  getSchema(): string {
    return this.schema;
  }

  inMultipleSchemas() {
    return this.schema.length > 1;
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


  static find(klass: string | Function, registryName: string = XS_DEFAULT): ClassRef {
    let name = ClassUtils.getClassName(klass);
    let classRef = null;
    if (registryName === XS_GLOBALLY) {
      classRef = LookupRegistry.find<ClassRef>(XS_TYPE_CLASS_REF, (c: ClassRef) => c.className == name);
    } else {
      classRef = LookupRegistry.$(registryName).find<ClassRef>(XS_TYPE_CLASS_REF, (c: ClassRef) => c.className == name);
    }
    return classRef;
  }

  /**
   * get all class refs for some class name
   *
   * @param klass
   */
  static getAllByClassName(klass: any): ClassRef[] {
    let name = ClassUtils.getClassName(klass);
    return LookupRegistry.filter<ClassRef>(XS_TYPE_CLASS_REF, (c: ClassRef) => c.className == name);
  }

  /**
   * filter function for classrefs
   *
   * @param klass
   */
  static filter(fn: (c: ClassRef) => boolean): ClassRef[] {
    return LookupRegistry.filter<ClassRef>(XS_TYPE_CLASS_REF, fn);
  }


  static checkIfFunctionCallback(klass: string | Function) {
    if (_.isFunction(klass)) {
      // maybe function which return type like () => type
      let name = ClassUtils.getClassName(klass);

      if (_.isEmpty(name)) {
        let fn = null;
        try {
          //fn = klass();
        } catch (e) {

        }
        if (fn) {
          let name = ClassUtils.getClassName(fn);
          if (!_.isEmpty(name)) {
            klass = fn;
          }
        }
      }
    }
    return klass;
  }


  static get(klass: string | Function | IClassRef, registryName: string = XS_DEFAULT, resolve: boolean = false): ClassRef {
    if (resolve) {
      klass = this.checkIfFunctionCallback(klass);
    }
    let classRef = this.find(klass, registryName);
    if (classRef) {
      if (classRef.isPlaceholder && _.isFunction(klass)) {
        classRef.updateClass(klass);
      }
      return classRef;
    }

    if (registryName === XS_GLOBALLY) {
      registryName = XS_DEFAULT;
    }

    classRef = new ClassRef(klass);
    classRef.context = registryName;
    let binding = Binding.create(XS_TYPE_SCHEMA, XS_DEFAULT_SCHEMA, XS_TYPE_CLASS_REF, classRef);
    LookupRegistry.$(registryName).add(binding.bindingType, binding);
    return LookupRegistry.$(registryName).add(XS_TYPE_CLASS_REF, classRef);
  }


  /**
   * return global class reference
   *
   * @param klass
   * @param resolve
   */
  static getGlobal(klass: string | Function, resolve: boolean = false): ClassRef {
    return this.get(klass, XS_GLOBALLY, resolve);
  }


  getLookupRegistry() {
    return LookupRegistry.$(this.context);
  }


  getEntityRef(): IEntityRef {
    if (!this._cacheEntity) {
      this._cacheEntity = this.getLookupRegistry().find(XS_TYPE_ENTITY, (x: IEntityRef) => x.getClassRef().id() === this.id());
    }
    return this._cacheEntity;
  }


  create<T>(): T {
    return this.new();
  }


  new<T>(): T {
    let klass = this.getClass();
    let instance = Reflect.construct(klass, []);
    Reflect.defineProperty(instance, 'xs:registry', {value: this.context});
    Reflect.defineProperty(instance, 'xs:schema', {value: this.getSchema()});
    Reflect.defineProperty(instance, 'xs:name', {value: this.className});
    return instance;
  }


  getPropertyRefs(): IPropertyRef[] {
    return this.getLookupRegistry().filter(XS_TYPE_PROPERTY, (e: IPropertyRef) => e.getSourceRef() === this);
  }

  getPropertyRef(name: string): IPropertyRef {
    return this.getLookupRegistry().find(XS_TYPE_PROPERTY, (e: IPropertyRef) => e.getSourceRef() === this && e.name === name);
  }

  id() {
    return [this.schema, this.name].join(XS_ID_SEPARATOR);
  }

  build<T>(data: any, options: IBuildOptions = {}): T {
    return <T>SchemaUtils.transform(this, data, options);
  }

  /**
   *
   * @param follow
   */
  toJson(follow?: boolean): IClassRefMetadata {
    let meta: IClassRefMetadata = {
      schema: this.getSchema(),
      className: this.name,
      isEntity: this.isEntity,
      options: this._options,
    };

    if (!this.isEntity && follow) {
      meta.properties = [];
      this.getPropertyRefs().forEach(prop => {
        meta.properties.push(prop.toJson());
      });
    }

    return meta;
  }
}
