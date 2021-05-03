import {assign, isArray, isEmpty, isNull, isString, isUndefined} from 'lodash';
import {AnnotationsHelper} from '../../lib/AnnotationsHelper';
import {DefaultValidator} from '../../lib/validation/DefaultValidator';

export interface IIsNotEmptyOptions {
  message?: string
}

export function IsNotEmpty(options?: IIsNotEmptyOptions) {
  return function (source: any, propertyName: string) {
    const opts: any = {
      validate: 'isNotEmpty'
    };
    if (options) {
      assign(opts, {validateOptions: {isNotEmpty: {}}});
      assign(opts.validateOptions.isNotEmpty, options);
    }

    AnnotationsHelper.forPropertyOn(
      source.constructor,
      propertyName,
      opts,
      'merge'
    );
  };
}

DefaultValidator.define({
    name: 'isNotEmpty',
    fn: (value: any, opts?: any) => {
      let res = !(isUndefined(value) || isNull(value));
      if (res) {
        if (isString(value) || isArray(value)) {
          return !isEmpty(value);
        }
      }
      return res;
    },
    defaultOptions: {
      message: 'Property "%propertyName" must be set and be not empty.'
    }
  }
);
