import {assign, get, has, isEmpty, keys, set, snakeCase} from 'lodash';
import {DEFAULT_NAMESPACE, JS_DATA_TYPES, METADATA_TYPE, METATYPE_PROPERTY, METATYPE_SCHEMA,} from './Constants';
import {IBaseRef} from '../api/IBaseRef';
import {IClassRef, isClassRef} from '../api/IClassRef';
import {MetadataRegistry} from './registry/MetadataRegistry';
import {ILookupRegistry} from '../api/ILookupRegistry';


export abstract class AbstractRef implements IBaseRef {

  readonly metaType: METADATA_TYPE;

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

  abstract getClassRefFor(object: string | Function | IClassRef, type: METADATA_TYPE): IClassRef;

  getNamespace() {
    return this.namespace;
  }

  abstract getRegistry(): ILookupRegistry;

  getSourceRef() {
    return this.object;
  }

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

  // getOptions(key: string = null, defaultValue: any = null): any | OPTS {
  //   if (key) {
  //     return get(this.options, key, defaultValue);
  //   }
  //   return this.options;
  // }
  //
  // setOptions(opts: any) {
  //   if (opts && !isEmpty(keys(opts))) {
  //     if (!isEmpty(keys(this.options))) {
  //       this.options = merge(this.options, opts);
  //     } else {
  //       this.options = opts;
  //     }
  //   }
  // }
  //
  //
  // setOption(key: string, value: any) {
  //   if (!this.options) {
  //     this.options = <any>{};
  //   }
  //   set(<any>this.options, key, value);
  // }


  getClassRef() {
    return this.object;
  }


  getClass(create: boolean = false) {
    return this.getClassRef().getClass(create);
  }


  get machineName() {
    return snakeCase(this.name);
  }


  get originalName() {
    if(this.object){
      return this.object.name;
    }
    return null;
  }

  get storingName() {
    let name = null;
    if (this.name !== this.originalName) {
      name = this.name;
    } else {
      name = snakeCase(this.name);
    }
    return name;
  }


  abstract id(): string;


  /**
   * Return supported primative data types
   */
  getSupportedDataTypes() {
    return JS_DATA_TYPES;
  }


  // toJson() {
  //   let options = cloneDeep(this.getOptions());
  //   let o: any = {
  //     id: this.id(),
  //     name: this.name,
  //     type: this.metaType,
  //     machineName: this.machineName,
  //     options: options
  //   };
  //   return o;
  // }

}



