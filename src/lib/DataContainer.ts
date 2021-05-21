import {find, get, has, isBoolean, isEmpty, isFunction, keys, remove, set} from 'lodash';


import {STATE_KEY} from './Constants';
import {IValidationError} from './validation/IValidationError';
import {IValidationResult} from './validation/IValidationResult';
import {ILookupRegistry} from '../api/ILookupRegistry';
import {IEntityRef} from '../api/IEntityRef';
import {IClassRef} from '../api/IClassRef';
import {IValidationMessage} from './validation/IValidationMessage';
import {Validator} from './validation/Validator';
import {ClassRef} from './ClassRef';
import {ClassUtils} from '@allgemein/base';

/**
 * Container for validation of object
 */
export class DataContainer<T> {

  static keys: string[] = [
    'isValidated',
    'isSuccess',
    'isSuccessValidated',
    'errors'
  ];

  isValidated: boolean;

  isSuccess: boolean;

  isSuccessValidated: boolean;

  errors: IValidationError[] = [];

  validation: { [k: string]: IValidationResult } = {};

  instance: T;

  ref: IEntityRef | IClassRef;


  constructor(instance: T, registry?: ILookupRegistry | IEntityRef | IClassRef) {
    this.instance = instance;
    if (registry) {
      this.ref = isFunction((<ILookupRegistry>registry).getEntityRefFor) ?
        (<ILookupRegistry>registry).getEntityRefFor(instance as any) : registry as IEntityRef;
    } else {
      const clazz = ClassUtils.getFunction(instance as any);
      this.ref = ClassRef.get(clazz) as IClassRef;
    }
    if (!this.ref) {
      throw new Error('none definition found for instance ' + JSON.stringify(instance));
    }

    const properties = this.ref.getPropertyRefs();
    for (const property of properties) {
      this.validation[property.name] = {
        key: property.name,
        valid: false,
        checked: false,
        messages: []
      };
    }
    ;
  }


  addError(e: IValidationError) {
    if (!has(e, 'type')) {
      e.type = 'error';
    }
    this.errors.push(e);
  }


  hasErrors() {
    return this.errors.length > 0;
  }


  checked(str: string) {
    if (this.validation[str]) {
      return this.validation[str].checked;
    }
    return false;
  }


  value(str: string) {
    const wrap = {};
    Object.defineProperty(wrap, str, {
      get: () => {
        return this.instance[str];
      },
      set: (y: any) => {
        this.instance[str] = y;
      }
    });
    return wrap[str];
  }


  valid(str: string) {
    if (this.validation[str]) {
      return this.validation[str].valid;
    }
    return false;
  }


  messages(str: string): IValidationMessage[] {
    if (this.validation[str] && this.validation[str].messages) {
      return this.validation[str].messages;
    }
    return [];

  }


  async validate(): Promise<boolean> {
    this.isValidated = true;
    remove(this.errors, error => error.type === 'validate');
    let results: IValidationError[] = [];
    try {
      results = <IValidationError[]>await Validator.validate(this.instance as any, this.ref);
    } catch (e) {
      console.error(e);
    }

    results.map(r => this.errors.push({
      property: r.property,
      value: r.value,
      constraints: r.constraints,
      type: 'validate'
    }));
    this.isSuccessValidated = true;
    keys(this.validation).forEach(key => {
      if (this.validation[key]) {
        const valid = this.validation[key];
        const found = find(this.errors, {property: key});
        valid.messages = [];
        if (found) {
          valid.valid = false;
          Object.keys(found.constraints).forEach(c => {
            valid.messages.push({type: c, content: found.constraints[c]});
          });
        } else {
          valid.valid = true;
        }
        this.isSuccessValidated = this.isSuccessValidated && valid.valid;
        valid.checked = true;
      }
    });

    return this.isSuccessValidated;
  }


  applyState() {
    const $state: any = {};
    DataContainer.keys.forEach(k => {
      const value = get(this, k, null);

      if (isBoolean(value) || !isEmpty(value)) {
        set($state, k, value);
      }
    });

    set(<any>this.instance, STATE_KEY, $state);
  }


  resetErrors() {
    this.errors = [];
  }
}
