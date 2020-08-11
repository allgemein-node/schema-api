import {IEntityRef} from "./IEntityRef";
import {IClassRef} from "./IClassRef";
import * as _ from "lodash";
import {NotYetImplementedError} from "@allgemein/base/browser";
import {IBuildOptions} from "./IBuildOptions";

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
  static transform(entityRef: IEntityRef | IClassRef, data: any, options: IBuildOptions = {}) {
    let object = entityRef.create();
    if (options.beforeBuild) {
      options.beforeBuild(entityRef, data, object, options)
    }

    if (!_.get(options, 'createAndCopy', false)) {

      for (let p of entityRef.getPropertyRefs()) {
        if ((_.isNull(data[p.name]) || _.isUndefined(data[p.name]))) {
          //object[p.name] = null;
          continue;
        }
        if (p.isReference()) {
          let ref = p.isEntityReference() ? p.getEntityRef() : p.getTargetRef();
          if (p.isCollection() || _.isArray(data[p.name])) {
            object[p.name] = [];
            for (let i = 0; i < data[p.name].length; i++) {
              object[p.name][i] = ref.build(data[p.name][i], options);
            }
          } else {
            object[p.name] = ref.build(data[p.name], options);
          }
        } else {
          if (p.isCollection() && (_.isArray(data[p.name]) || _.isSet(data[p.name]))) {
            object[p.name] = [];
            for (let i = 0; i < data[p.name].length; i++) {
              let v = data[p.name][i];
              if (v) {
                object[p.name][i] = p.convert(v, options);
              } else {
                object[p.name][i] = null;
              }
            }
          } else if (p.isCollection() && !(_.isArray(data[p.name]) || _.isSet(data[p.name]))) {
            throw new NotYetImplementedError();
          } else {
            object[p.name] = p.convert(data[p.name], options);
          }
        }
      }
    } else {
      _.assign(object, data);
    }

    if (options.afterBuild) {
      options.afterBuild(entityRef, data, object, options)
    }
    return object;

  }

  /**
   * Create a class of given name
   *
   * @param str
   */
  static clazz(str: string): Function {
    function X() {
    }

    Object.defineProperty(X, 'name', {value: str});
    return X;
  }


  static interprete(value: string) {
    // json
    // date
    // number
    //
  }


}
