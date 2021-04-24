import * as _ from 'lodash';
import {AnnotationsHelper} from '../../lib/AnnotationsHelper';
import {DefaultValidator} from '../../lib/validation/DefaultValidator';
import {IValidateOptions} from '../../lib/validation/IValidateOptions';

export interface IMinLengthOptions extends IValidateOptions {
  minLength?: number,
  message?: string
}

export function MinLength(value: number, options?: IMinLengthOptions) {
  return function (source: any, propertyName: string) {
    const opts: any = {
      minLength: value
    };
    if (options) {
      _.assign(opts, {validateOptions: {minLength: {}}});
      _.assign(opts.validateOptions.minLength, options);
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
    name: 'minLength',
    fn: (value: string, opts?: IMinLengthOptions) => {
      if (_.isString(value)) {
        return value.length >= opts.minLength;
      }
      return true;
    },
    defaultOptions: {
      message: 'Length of property "%propertyName" must be greeter then %options.minLength.'
    },
    involveOnOptionKey: 'minLength'
  }
);
