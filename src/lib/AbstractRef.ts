import {assign, get, has, isEmpty, keys, set, snakeCase} from 'lodash';
import {
  C_INTERNAL_NAME,
  C_NAME,
  DEFAULT_NAMESPACE,
  JS_DATA_TYPES,
  METADATA_TYPE,
  METATYPE_PROPERTY,
  METATYPE_SCHEMA,
} from './Constants';
import {IBaseRef} from '../api/IBaseRef';
import {IClassRef, isClassRef} from '../api/IClassRef';
import {MetadataRegistry} from './registry/MetadataRegistry';
import {ILookupRegistry} from '../api/ILookupRegistry';


export abstract class AbstractRef implements IBaseRef {

  /**
   * Type of this entry
   */
  readonly metaType: METADATA_TYPE;

  /**
   * Namespace better registry of this entry
   */
  namespace: string = DEFAULT_NAMESPACE;

  private _cachedOptions: any;

  readonly name: string;

  readonly object: IClassRef;


  constructor(type: METADATA_TYPE,
              name: string,
              object: IClassRef | Function | string = null,
              namespace: string = DEFAULT_NAMESPACE) {
    this.namespace = namespace;
    this.metaType = type;
    this.name = name;
    if (isClassRef(object)) {
      this.object = object;
    } else {
      this.object = object ? this.getClassRefFor(object, type) : null;
    }
  }


  getNamespace() {
    return this.namespace;
  }


  getSourceRef() {
    return this.object;
  }

  abstract getClassRefFor(object: string | Function | IClassRef, type: METADATA_TYPE): IClassRef;

  abstract getRegistry(): ILookupRegistry;

  protected getOptionsEntry() {
    if (!this._cachedOptions) {
      if (this.metaType === METATYPE_PROPERTY) {
        this._cachedOptions = MetadataRegistry.$().findCached(this.metaType, (x: any) =>
          x.target === this.getClass(true) &&
          x.propertyName === this.name &&
          x.namespace === this.getNamespace()
        );
        if (!this._cachedOptions) {
          this._cachedOptions = {target: this.getClass(true), propertyName: this.name, namespace: this.getNamespace()};
          MetadataRegistry.$().addCached(this.metaType, this._cachedOptions);
        }
      } else if (this.metaType === METATYPE_SCHEMA) {
        this._cachedOptions = MetadataRegistry.$().findCached(this.metaType, (x: any) =>
          x.name === this.name &&
          x.namespace === this.getNamespace()
        );
        if (!this._cachedOptions) {
          this._cachedOptions = {name: this.name, namespace: this.getNamespace()};
          MetadataRegistry.$().addCached(this.metaType, this._cachedOptions);
        }
      } else {
        this._cachedOptions = MetadataRegistry.$().findCached(this.metaType, (x: any) =>
          x.target === this.getClass(true) &&
          x.namespace === this.getNamespace()
        );
        if (!this._cachedOptions) {
          this._cachedOptions = {target: this.getClass(true), namespace: this.getNamespace()};
          MetadataRegistry.$().addCached(this.metaType, this._cachedOptions);
        }
      }
    }
    return this._cachedOptions;
  }

  getOptions(key?: string, defaultValue: any = null): any {
    if (key) {
      return get(this.getOptionsEntry(), key, defaultValue);
    }
    return this.getOptionsEntry();
  }

  setOptions(options: any) {
    if (options && !isEmpty(keys(options))) {
      const opts = this.getOptionsEntry();
      // if same object cause taken from MetadataRegistry then ignore setting
      if (opts !== options) {
        for (const k of keys(opts)) {
          delete opts[k];
        }
        assign(opts, options);
      }
    }
  }

  setOption(key: string, value: any) {
    const opts = this.getOptionsEntry();
    set(opts, key, value);
  }

  hasOption(key: string) {
    const opts = this.getOptionsEntry();
    return has(opts, key);
  }

  /**
   * Return class ref
   */
  getClassRef(): IClassRef {
    return this.object;
  }


  /**
   * Get class for the entry
   *
   * @param create: create anonymous placeholder if no class exists
   */
  getClass(create: boolean = false): Function {
    return this.getClassRef().getClass(create);
  }


  /**
   * Return the name of the class ref, if not exits then return null
   */
  get originalName() {
    if (this.object) {
      return this.object.name;
    }
    return null;
  }


  /**
   * Return internal name (same as calling storingName)
   */
  get internalName(): string {
    return this.storingName;
  }


  /**
   * Return internal name, check if internalName is set else check if name options is present
   *
   */
  get storingName() {
    let name = this.getOptions(C_INTERNAL_NAME, null);
    if (name) {
      return name;
    }
    if (this.metaType === METATYPE_PROPERTY) {
      name = this.getOptions(C_NAME, null);
      if (!name) {
        name = snakeCase(this.name);
      }
    } else {
      if (this.name !== this.originalName) {
        name = this.name;
      } else {
        name = snakeCase(this.name);
      }
    }
    return name;
  }


  abstract id(): string;


  /**
   * Return supported primitive data types
   */
  getSupportedDataTypes() {
    return JS_DATA_TYPES;
  }


}



