import {isEmpty} from 'lodash';
import {IValidationError} from './IValidationError';
import {IClassRef} from '../../api/IClassRef';
import {IEntityRef} from '../../api/IEntityRef';
import {DefaultValidator} from './DefaultValidator';
import {IValidatorEntry} from './IValidatorEntry';


export type validate_function = (instance: any, ref?: IClassRef | IEntityRef) => Promise<IValidationError[]>;
export type validate_info_function = (ref?: Function | IClassRef | IEntityRef) => Promise<IValidatorEntry[]>;

/**
 * Abstraction for defualt validator functions
 */
export class Validator {

  private static fn: validate_function[] = [
    DefaultValidator.validate.bind(DefaultValidator)
  ];

  private static info: validate_info_function[] = [
    DefaultValidator.validationInfo.bind(DefaultValidator)
  ];

  static add(fn: validate_function, fnInfo: validate_info_function) {
    this.fn.push(fn);
    this.info.push(fnInfo);
  }

  static reset() {
    this.fn = [];
    this.info = [];
  }

  static async getValidationEntries(fn: Function | IClassRef | IEntityRef) {
    if (isEmpty(this.info)) {
      return [];
    }
    const data = await Promise.all(this.info.map(x => x(fn)));
    return [].concat(...data);
  }

  static async validate(instance: any, ref?: IClassRef | IEntityRef): Promise<IValidationError[]> {
    if (isEmpty(this.fn)) {
      return [];
    }
    const data = await Promise.all(this.fn.map(x => x(instance, ref)));
    return [].concat(...data);
  }
}
