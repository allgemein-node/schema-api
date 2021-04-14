import * as _ from 'lodash';
import {DEFAULT_NAMESPACE, METADATA_AND_BIND_TYPE, METATYPE_ENTITY, METATYPE_PROPERTY} from './Constants';
import {ClassRef} from './ClassRef';
import {AnnotationsHelper} from './AnnotationsHelper';
import {IBaseRef} from '../api/IBaseRef';
import {IClassRef} from '../api/IClassRef';
import {RegistryFactory} from './registry/RegistryFactory';


export abstract class AbstractRef<OPTS> implements IBaseRef {

  readonly metaType: METADATA_AND_BIND_TYPE;

  private namespace: string = DEFAULT_NAMESPACE;

  options: OPTS = <any>{};

  readonly name: string;

  readonly object: IClassRef;


  constructor(type: METADATA_AND_BIND_TYPE,
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
        AnnotationsHelper.merge(this.object, this.options);
        break;
      case METATYPE_PROPERTY:
        AnnotationsHelper.merge(this.object, this.options, this.name);
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


  setOptions(opts: any) {
    if (opts && !_.isEmpty(_.keys(opts))) {
      if (!_.isEmpty(_.keys(this.options))) {
        this.options = _.merge(this.options, opts);
      } else {
        this.options = opts;
      }
    }
  }


  setOption(key: string, value: any) {
    if (!this.options) {
      this.options = <any>{};
    }
    _.set(<any>this.options, key, value);
  }


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


  getOptions(key: string = null, defaultValue: any = null): any | OPTS {
    if (key) {
      return _.get(this.options, key, defaultValue);
    }
    return this.options;
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



