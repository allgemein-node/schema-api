//
import {assign, get, isArray, isEmpty, isFunction, isNull, isSet, isUndefined} from 'lodash';
import {NotYetImplementedError} from '@allgemein/base/browser';
import {C_PROP_NAME, OPT_CREAT_AND_COPY} from './Constants';
import {IClassRef, isClassRef} from '../api/IClassRef';
import {IEntityRef, isEntityRef} from '../api/IEntityRef';
import {IBuildOptions} from '../api/IBuildOptions';

let anonId = 0;

export class SchemaUtils {

  /**
   * convert an json entry to an instance of given entityRef type
   *
   * - with options can be set pre/post processing for build
   *   - beforeBuild - preprocess of an object
   *   - afterBuild - postprocess of an object
   *   - createAndCopy - if true the only the instance is created, all properties are passed by assign
   *
   * @param entityRef
   * @param data
   * @param options: IBuildOptions
   *
   */
  static transform<T>(entityRef: IEntityRef | IClassRef, data: any, options: IBuildOptions = {}): T {
    let object: T = entityRef.create(!isUndefined(options.skipClassNamespaceInfo) ? !options.skipClassNamespaceInfo : true);
    if (options.beforeBuild) {
      options.beforeBuild(entityRef, data, object, options);
    }

    if (!get(options, OPT_CREAT_AND_COPY, false)) {

      for (let p of entityRef.getPropertyRefs()) {
        if ((isNull(data[p.name]) || isUndefined(data[p.name]))) {
          //object[p.name] = null;
          continue;
        }
        if (p.isReference()) {
          let ref = p.getTargetRef();
          if (p.isCollection() || isArray(data[p.name])) {
            object[p.name] = [];
            for (let i = 0; i < data[p.name].length; i++) {
              object[p.name][i] = ref.build(data[p.name][i], options);
            }
          } else {
            object[p.name] = ref.build(data[p.name], options);
          }
        } else {
          if (p.isCollection() && (isArray(data[p.name]) || isSet(data[p.name]))) {
            object[p.name] = [];
            for (let i = 0; i < data[p.name].length; i++) {
              let v = data[p.name][i];
              if (v) {
                object[p.name][i] = p.convert(v, options);
              } else {
                object[p.name][i] = null;
              }
            }
          } else if (p.isCollection() && !(isArray(data[p.name]) || isSet(data[p.name]))) {
            throw new NotYetImplementedError();
          } else {
            object[p.name] = p.convert(data[p.name], options);
          }
        }
      }
    } else {
      assign(object, data);
    }

    if (options.afterBuild) {
      options.afterBuild(entityRef, data, object, options);
    }
    return object;

  }

  /**
   * Create a class of given name
   *
   * @param str
   */
  static clazz(str: string): Function {
    const X = this.clazzAnonymous();
    Object.defineProperty(X, C_PROP_NAME, {value: str});
    return X;
  }

  /**
   * Create a class of given name
   *
   * @param str
   */
  static clazzAnonymous(): Function {
    const X = new Function();
    Object.defineProperty(X, 'anonId', {value: anonId++});
    return X;
  }

  /**
   * Return inherited class if present else null will be delivered
   *
   * @param klass
   */
  static getInherited(klass: Function) {
    const proto = Reflect.getPrototypeOf(klass) as any;
    if (proto.name && !isEmpty(proto.name) && proto.name !== Object.name && proto.name !== klass.name) {
      return proto;
    }
    return null;
  }


  static getFunction(klass: any) {
    if (isEntityRef(klass)) {
      return klass.getClassRef().getClass(true);
    } else if (isClassRef(klass)) {
      return klass.getClass(true);
    } else if (isFunction(klass)) {
      return klass;
    }
    throw new Error('no class found in ' + klass);
  }


  static normValue(value: any) {
    return JSON.parse(JSON.stringify(value));
  }

  //
  //
  // static interprete(value: string) {
  //   // json
  //   // date
  //   // number
  //   //
  // }
  //

}
