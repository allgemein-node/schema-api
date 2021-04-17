import * as _ from 'lodash';
import {
  DEFAULT_NAMESPACE,
  METADATA_AND_BIND_TYPE,
  METADATA_TYPE,
  METATYPE_ENTITY,
  METATYPE_PROPERTY
} from './Constants';
import {ClassRef} from './ClassRef';
import {AnnotationsHelper} from './AnnotationsHelper';
import {IBaseRef} from '../api/IBaseRef';
import {IClassRef} from '../api/IClassRef';
import {RegistryFactory} from './registry/RegistryFactory';
import {MetadataRegistry} from './registry/MetadataRegistry';


export abstract class AbstractRef<OPTS> implements IBaseRef {

  readonly metaType: METADATA_TYPE;

  namespace: string = DEFAULT_NAMESPACE;

  // options: OPTS = <any>{};
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
    if (object instanceof ClassRef) {
      this.object = object;
    } else {
      this.object = object ? this.getClassRefFor(object, type) : null;
    }
    switch (type) {
      case METATYPE_ENTITY:
        AnnotationsHelper.merge(this.object, this.getOptionsEntry());
        break;
      case METATYPE_PROPERTY:
        AnnotationsHelper.merge(this.object, this.getOptionsEntry(), this.name);
        break;
    }
  }

  getClassRefFor(object: string | Function | IClassRef, type: METADATA_AND_BIND_TYPE) {
    return ClassRef.get(<string | Function>object, this.namespace, type == METATYPE_PROPERTY);
  }

  getNamespace() {
    return this.namespace;
  }

  getRegistry() {
    return RegistryFactory.get(this.namespace);
  }

  getSourceRef() {
    return this.object;
  }

  private getOptionsEntry() {
    if (!this._cachedOptions) {
      if(this.metaType === 'property'){
        this._cachedOptions = MetadataRegistry.$().find(this.metaType, (x: any) => x.target === this.getClass(true) && x.propertyName === this.name);
        if (!this._cachedOptions) {
          this._cachedOptions = {target: this.getClass(true)};
          MetadataRegistry.$().add(this.metaType, this._cachedOptions);
        }
      }else{
        this._cachedOptions = MetadataRegistry.$().find(this.metaType, (x: any) => x.target === this.getClass(true));
        if (!this._cachedOptions) {
          this._cachedOptions = {target: this.getClass(true)};
          MetadataRegistry.$().add(this.metaType, this._cachedOptions);
        }
      }
    }
    return this._cachedOptions;
  }

  getOptions(key?: string, defaultValue: any = null): any {
    if (key) {
      return _.get(this.getOptionsEntry(), key, defaultValue);
    }
    return this.getOptionsEntry();
  }

  setOptions(options: any) {
    if (options && !_.isEmpty(_.keys(options))) {
      const opts = this.getOptionsEntry();
      for (const k of _.keys(opts)) {
        delete opts[k];
      }
      _.assign(opts, options);
    }
  }

  setOption(key: string, value: any) {
    const opts = this.getOptionsEntry();
    _.set(opts, key, value);
  }

  hasOption(key: string) {
    const opts = this.getOptionsEntry();
    return _.has(opts, key);
  }

  // getOptions(key: string = null, defaultValue: any = null): any | OPTS {
  //   if (key) {
  //     return _.get(this.options, key, defaultValue);
  //   }
  //   return this.options;
  // }
  //
  // setOptions(opts: any) {
  //   if (opts && !_.isEmpty(_.keys(opts))) {
  //     if (!_.isEmpty(_.keys(this.options))) {
  //       this.options = _.merge(this.options, opts);
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
  //   _.set(<any>this.options, key, value);
  // }


  getClassRef() {
    return this.object;
  }


  getClass(create: boolean = false) {
    return this.getClassRef().getClass(create);
  }


  get machineName() {
    return _.snakeCase(this.name);
  }


  get storingName() {
    let name = this.getOptions('name');
    if (!name) {
      name = _.snakeCase(this.name);
    }
    return name;
  }


  abstract id(): string;


  // toJson() {
  //   let options = _.cloneDeep(this.getOptions());
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



