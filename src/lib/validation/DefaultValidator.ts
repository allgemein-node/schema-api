import {assign, clone, defaults, get, intersection, isArray, isObjectLike, keys, merge, set, uniq} from 'lodash';

import {IClassRef} from '../../api/IClassRef';
import {IEntityRef, isEntityRef} from '../../api/IEntityRef';
import {ClassUtils, MetadataStorage, NotYetImplementedError} from '@allgemein/base';
import {IValidationError} from './IValidationError';
import {ClassRef} from '../ClassRef';
import {IPropertyExtentions} from '../../api/IPropertyExtentions';
import {XS_ANNOTATION_OPTIONS_CACHE} from '../Constants';
import {MetadataRegistry} from '../registry/MetadataRegistry';
import {IValidator} from './IValidator';


export interface IValidatorEntry {
  target: Function,
  property?: string,
  options?: any[],
  handles?: IValidator[]
}


export class DefaultValidator {

  private static validators: IValidator[] = [];

  private static lookupKeys = ['format', 'validate'];


  static define(validator: IValidator) {
    this.validators.push(validator);
    if (validator.involveOnOptionKey) {
      this.lookupKeys.unshift(validator.involveOnOptionKey);
      this.lookupKeys = uniq(this.lookupKeys);
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
    //     x.object === classRef.getClass() && (has(x.options, 'format') || has(x.options, 'format'))
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

        let instanceOptions = clone(toValidateEntry.options[handle.name]);
        if (handle.defaultOptions) {
          defaults(instanceOptions, handle.defaultOptions);
        }

        if (!(await handle.fn(value, instanceOptions))) {
          const error: IValidationError = {
            metaType: toValidateEntry.property ? 'property' : 'entity',
            property: toValidateEntry.property,
            value: value,
            constraints: {}
          };
          classErrors.push(error);

          let msg = get(instanceOptions, 'message', null);
          if (msg) {
            msg = msg.replace('%propertyName', error.property).replace('%value', value);
            keys(instanceOptions).forEach(k => {
              let v = instanceOptions[k];
              if (isObjectLike(v) || isArray(v)) {
                v = JSON.stringify(v);
              }
              msg = msg.replace('%options.' + k, v);
            });
            error.constraints[handle.name] = msg;
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
  //   if (isEmpty(handleKeys)) {
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
    const entriesSecond = MetadataRegistry.$().getCached().filter(x =>
      x.target === fn && intersection(this.lookupKeys, keys(x)).length > 0
    );

    for (const e of entriesSecond) {
      const handlesAndOptions = this.extractValidationInfox(e);
      const validationEntry: IValidatorEntry = {
        target: fn,
      };
      assign(validationEntry, handlesAndOptions);
      if (e.propertyName) {
        validationEntry.property = e.propertyName;
      }
      entries.push(validationEntry);
    }


    const entriesFirst: IPropertyExtentions[] = MetadataStorage
      .key(XS_ANNOTATION_OPTIONS_CACHE)
      .filter((x: IPropertyExtentions) =>
        x.object === fn && intersection(this.lookupKeys, keys(x.options)).length > 0
      );

    for (const e of entriesFirst) {
      const alreadyAsProperty = entries.find(x => x.property === e.property) as IValidatorEntry;
      const handlesAndOptions = this.extractValidationInfox(e.options);
      if (alreadyAsProperty) {
        for (let i = 0; i < handlesAndOptions.handles.length; i++) {
          const handle = handlesAndOptions.handles[i];
          if (alreadyAsProperty.handles.find(x => x.name === handle.name)) {
            // ignore double declarations
            continue;
          }
          alreadyAsProperty.handles.push(handle);
          set(alreadyAsProperty.options, handle.name, get(handlesAndOptions.options, handle.name, {}));
        }
      } else {
        const validationEntry: IValidatorEntry = {
          target: fn,
        };
        assign(validationEntry, handlesAndOptions);
        if (e.property) {
          validationEntry.property = e.property;
        }
        entries.push(validationEntry);
      }
    }
    return entries;
  }


  private static extractValidationInfox(entryOptions: any) {
    const intersect = intersection(this.lookupKeys, keys(entryOptions));
    const handles: any[] = [];
    const options = {};
    for (const k of intersect) {
      const isLookupKey = ['validate', 'format'].includes(k);
      const valueForKey = get(entryOptions, k, null);
      const handle = this.validators.find(x => x.name === valueForKey || x.involveOnOptionKey === k);
      if (handle) {
        const handleAlreadySet = handles.find(x => x.name === handle.name);
        if (!handleAlreadySet) {
          handles.push(handle);
        }

        let v = clone(get(entryOptions, 'validateOptions.' + handle.name, {}));
        if (!isLookupKey) {
          // pass additional value
          v[handle.involveOnOptionKey] = get(entryOptions, handle.involveOnOptionKey, null);
        }

        if (v) {
          if (!options[handle.name]) {
            options[handle.name] = {};
          }
          merge(options[handle.name], v);
        }
      }
    }
    return {
      handles: handles,
      options: options
    };
  }

}
