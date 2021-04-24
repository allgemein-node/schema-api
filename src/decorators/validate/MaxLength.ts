import * as _ from 'lodash';
import {AnnotationsHelper} from '../../lib/AnnotationsHelper';
import {DefaultValidator} from '../../lib/validation/DefaultValidator';
import {IValidateOptions} from '../../lib/validation/IValidateOptions';

export interface IMaxLengthOptions extends IValidateOptions {
  maxLength?: number,
  message?: string
}

export function MaxLength(value: number, options?: IMaxLengthOptions) {
  return function (source: any, propertyName: string) {
    const opts: any = {
      maxLength: value
    };
    if (options) {
      _.assign(opts, {validateOptions: {maxLength: {}}});
      _.assign(opts.validateOptions.maxLength, options);
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
    name: 'maxLength',
    fn: (value: string, opts?: IMaxLengthOptions) => {
      if (_.isString(value)) {
        return value.length <= opts.maxLength;
      }
      return true;
    },
    defaultOptions: {
      message: 'Length of property "%propertyName" must be greeter then %options.maxLength.'
    },
    involveOnOptionKey: 'maxLength'
  }
);
