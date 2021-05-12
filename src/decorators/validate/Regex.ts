import {assign, isEmpty, isNull, isString, isUndefined} from 'lodash';

import {AnnotationsHelper} from '../../lib/AnnotationsHelper';
import {DefaultValidator} from '../../lib/validation/DefaultValidator';
import {IValidateOptions} from '../../lib/validation/IValidateOptions';

export interface IRegexOptions extends IValidateOptions {
  pattern?: string;
  message?: string;
  flags?: string;
}

export function Regex(regex: string | RegExp, options?: IRegexOptions) {
  return function (source: any, propertyName: string) {
    const opts: any = {
      pattern: isString(regex) ? regex : regex.source,
    };
    if (!isString(regex) && !isEmpty(regex.flags)) {
      opts.validateOptions = {
        regex: {
          flags: regex.flags,
        }
      };
    }
    if (options) {
      assign(opts.validateOptions.regex, options);
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
    name: 'regex',
    fn: (value: string, options: IRegexOptions) => {
      // if (isUndefined(value) || isNull(value)) {
      //   return true;
      // }
      if (isString(value)) {
        const r = new RegExp(options.pattern, options.flags);
        if (r.test(value)) {
          return true;
        }
      }
      return false;
    },
    defaultOptions: {
      message: 'Value of property "%propertyName" doesn\'t match the regular expression "%options.pattern".'
    },
    involveOnOptionKey: 'pattern'
  }
);
