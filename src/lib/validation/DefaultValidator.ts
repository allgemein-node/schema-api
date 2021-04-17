import * as _ from 'lodash';
import {IClassRef} from '../../api/IClassRef';
import {IEntityRef, isEntityRef} from '../../api/IEntityRef';
import {ClassUtils} from '@allgemein/base';
import {NotYetImplementedError} from '@allgemein/base/browser';
import {IValidationError} from './IValidationError';
import {ClassRef} from '../ClassRef';
import {MetadataStorage} from '@allgemein/base/libs/MetadataStorage';
import {IPropertyExtentions} from '../../api/IPropertyExtentions';
import {XS_ANNOTATION_OPTIONS_CACHE} from '../Constants';
import {MetadataRegistry} from '../registry/MetadataRegistry';
import {IValidator} from './IValidator';


export interface IValidatorEntry {
  target: Function,
  property?: string,
  handles: IValidator[]
}


export class DefaultValidator {

  private static validators: IValidator[] = [];

  private static lookupKeys = ['format', 'validate'];


  static define(validator: IValidator) {
    this.validators.push(validator);
    if (validator.involveOnOptionKey) {
      this.lookupKeys.push(validator.involveOnOptionKey);
      this.lookupKeys = _.uniq(this.lookupKeys);
    }
  }


  static async validate(instance: any, ref?: IClassRef | IEntityRef): Promise<IValidationError[]> {
    let classRef: IClassRef = null;
    if (ref) {
      if (isEntityRef(ref)) {
        classRef = ref.getClassRef();
      } else {
        classRef = ref;
      }
    } else {
      const target = ClassUtils.getFunction(instance);
      if (!target) {
        throw new NotYetImplementedError();
      }
      classRef = ClassRef.get(target);
    }

    // const entries:IPropertyExtentions[] = MetadataStorage
    //   .key(XS_ANNOTATION_OPTIONS_CACHE)
    //   .filter((x:IPropertyExtentions) =>
    //     x.object === classRef.getClass() && (_.has(x.options, 'format') || _.has(x.options, 'format'))
    //   );
    const classErrors: IValidationError[] = [];
    const toValidateList = this.getValidationHandlesForFn(classRef.getClass());
    for (const toValidateEntry of toValidateList) {
      for (const handle of toValidateEntry.handles) {
        let value = null;
        let isPropertyCheck = toValidateEntry.property ? true : false;
        if (isPropertyCheck) {
          value = instance[toValidateEntry.property];
        } else {
          value = instance;
        }
        if (!(await handle.fn(value))) {
          const error: IValidationError = {
            metaType: toValidateEntry.property ? 'property' : 'entity',
            property: toValidateEntry.property,
            value: value,
            constraints: {}
          };
          classErrors.push(error);
          if (!isPropertyCheck) {
            let msg = _.get(handle.options, 'message', null);
            if (msg) {
              error.constraints[handle.name] = msg.replace('%propertyName', error.property).replace('%value', value);
            }
          } else if (isPropertyCheck) {
            let msg = _.get(handle.options, 'message', null);

            if (msg) {
              error.constraints[handle.name] = msg.replace('%propertyName', error.property).replace('%value', value);
            }
          }
        }

      }
    }


    // validate entity
    // const classErrors = await this.validateHandles(classRef, instance);
    // for (const ref of classRef.getPropertyRefs()) {
    //   if (ref.isReference()) {
    //     // TODO
    //   } else {
    //     classErrors.push(...await this.validateHandles(ref, ref.get(instance)));
    //   }
    // }

    return classErrors;
  }

  //
  //
  // static async validateHandles(ref: IBaseRef, value: any) {
  //   const handleKeys = this.getHandleKeys(ref);
  //   if (_.isEmpty(handleKeys)) {
  //     return [];
  //   }
  //   const handles = this.getHandles(handleKeys);
  //   const errors: IValidationError[] = [];
  //   for (const handle of handles) {
  //     if (handle) {
  //     }
  //   }
  //   return errors;
  // }
  //
  //
  // static getHandles(handleKeys: string[]): { name: string, fn: (value: any) => boolean, opts?: { message?: string } }[] {
  //   return [].concat(...handleKeys.map(k => this.validators.filter(y => y.name === k)));
  // }
  //

  static getValidationHandlesForFn(fn: Function) {
    const entries: IValidatorEntry[] = [];
    const entriesFirst: IPropertyExtentions[] = MetadataStorage
      .key(XS_ANNOTATION_OPTIONS_CACHE)
      .filter((x: IPropertyExtentions) =>
        x.object === fn && _.intersection(this.lookupKeys, _.keys(x.options)).length > 0
      );
    for (const e of entriesFirst) {
      const intersect = _.intersection(this.lookupKeys, _.keys(e.options));
      const handles = [];
      for (const k of intersect) {
        const valueForKey = _.get(e.options, k, null);
        const handle = this.validators.find(x => x.name === valueForKey || x.involveOnOptionKey === k);
        if (handle) {
          handles.push(handle);
        }
      }
      const entry: IValidatorEntry = {
        target: fn,
        handles: handles
      };
      if (e.property) {
        entry.property = e.property;
      }
      entries.push(entry);
    }

    const entriesSecond = MetadataRegistry.$().getMetadata().filter(x =>
      x.target === fn && _.intersection(this.lookupKeys, _.keys(x)).length > 0
    );

    for (const e of entriesSecond) {
      const intersect = _.intersection(this.lookupKeys, _.keys(e));
      const handles = [];
      for (const k of intersect) {
        const handle = this.validators.find(x => x.name === k || x.involveOnOptionKey === k);
        handles.push(handle);
      }
      const entry: IValidatorEntry = {
        target: fn,
        handles: handles
      };
      if (e.property) {
        entry.property = e.property;
      }
      entries.push(entry);
    }

    return entries;
  }

  //
  //
  // static getHandleKeys(ref: IBaseRef) {
  //   const format = ref.getOptions('format');
  //   const validate = ref.getOptions('validate');
  //   return this.extractHandleKeys([format, validate]);
  // }
  //
  // static extractHandleKeys(arr: any[]): string[] {
  //   const handles: string[] = [];
  //   for (const entry of arr) {
  //     if (entry) {
  //       if (_.isString(entry)) {
  //         handles.push(entry);
  //       } else if (_.isArray(entry)) {
  //         handles.push(...entry);
  //       }
  //     }
  //   }
  //   return handles;
  //
  // }
}
