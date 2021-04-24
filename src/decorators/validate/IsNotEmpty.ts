import * as _ from 'lodash';
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
      _.assign(opts, {validateOptions: {isNotEmpty: {}}});
      _.assign(opts.validateOptions.isNotEmpty, options);
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
    fn: (value: string, opts?: any) => {
      return !_.isEmpty(value);
    },
    defaultOptions: {
      message: 'Property "%propertyName" must be set and be not empty.'
    }
  }
);
