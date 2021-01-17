import * as _ from 'lodash';
import {XS_DEFAULT, XS_TYPE, XS_TYPE_ENTITY, XS_TYPE_PROPERTY} from "./Constants";
import {ClassRef} from "./ClassRef";
import {LookupRegistry} from "./LookupRegistry";
import {IBaseRef} from "./IBaseRef";
import {AnnotationsHelper} from "./AnnotationsHelper";
import {IClassRef} from './IClassRef';


export abstract class AbstractRef implements IBaseRef {

  private readonly _baseType: XS_TYPE;

  private _context: string = XS_DEFAULT;

  private _options: any = {};

  readonly name: string;

  readonly object: IClassRef;


  constructor(type: XS_TYPE, name: string, object: IClassRef | Function | string = null, context: string = XS_DEFAULT) {
    this._context = context;
    this._baseType = type;
    this.name = name;
    if (object instanceof ClassRef) {
      this.object = object;
    } else {
      this.object = object ? ClassRef.get(object, this._context, type == XS_TYPE_PROPERTY) : null;
    }
    switch (type) {
      case XS_TYPE_ENTITY:
        AnnotationsHelper.merge(this.object, this._options);
        break;
      case XS_TYPE_PROPERTY:
        AnnotationsHelper.merge(this.object, this._options, this.name);
        break;
    }
  }


  getLookupRegistry() {
    return LookupRegistry.$(this._context)
  }


  getSourceRef() {
    return this.object;
  }


  setOptions(opts: any) {
    if (opts && !_.isEmpty(_.keys(opts))) {
      if (!_.isEmpty(_.keys(this._options))) {
        this._options = _.merge(this._options, opts);
      } else {
        this._options = opts;
      }
    }
  }


  setOption(key: string, value: any) {
    if (!this._options) {
      this._options = {};
    }
    _.set(this._options, key, value);
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


  get baseType() {
    return this._baseType;
  }


  getOptions(key: string = null, defaultValue: any = null) {
    if (key) {
      return _.get(this._options, key, defaultValue);
    }
    return this._options;
  }


  abstract id(): string;


  toJson() {
    let options = _.cloneDeep(this.getOptions());
    let o: any = {
      id: this.id(),
      name: this.name,
      type: this.baseType,
      machineName: this.machineName,
      options: options
    };
    return o;
  }

}



