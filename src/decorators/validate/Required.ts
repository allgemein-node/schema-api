import {assign, isNull, isUndefined} from 'lodash';

import {AnnotationsHelper} from '../../lib/AnnotationsHelper';
import {DefaultValidator} from '../../lib/validation/DefaultValidator';

export interface IRequiredOptions {
  message?: string
}

export function Required(options?: IRequiredOptions) {
  return function (source: any, propertyName: string) {
    const opts: any = {
      required: true
    };
    if (options) {
      assign(opts, {validateOptions: {required: {}}});
      assign(opts.validateOptions.required, options);
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
    name: 'required',
    fn: (value: string, opts?: any) => {
      if (isUndefined(value) || isNull(value)) {
        return false;
      }
      return true;
    },
    defaultOptions: {
      message: 'Property "%propertyName" is required.'
    },
    involveOnOptionKey: 'required'
  }
);
