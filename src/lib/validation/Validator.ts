import {isEmpty} from 'lodash';
import {IValidationError} from './IValidationError';
import {IClassRef} from '../../api/IClassRef';
import {IEntityRef} from '../../api/IEntityRef';
import {DefaultValidator} from './DefaultValidator';


export type validate_function = (instance: any, ref?: IClassRef | IEntityRef) => Promise<IValidationError[]>;

/**
 * Abstraction for defualt validator functions
 */
export class Validator {

  private static fn: validate_function[] = [
    DefaultValidator.validate.bind(DefaultValidator)
  ];

  static add(fn: validate_function) {
    this.fn.push(fn);
  }

  static reset() {
    this.fn = [];
  }

  static async validate(instance: any, ref?: IClassRef | IEntityRef): Promise<IValidationError[]> {
    if (isEmpty(this.fn)) {
      return [];
    }
    const data = await Promise.all(this.fn.map(x => x(instance, ref)));
    return [].concat(...data);
  }
}
