import * as _ from 'lodash';
import {AnnotationsHelper} from '../../lib/AnnotationsHelper';
import {DefaultValidator} from '../../lib/validation/DefaultValidator';
import {IValidateOptions} from '../../lib/validation/IValidateOptions';

export interface IRegexOptions extends IValidateOptions {
  source?: string;
  message?: string;
  flags?: string;
}

export function Regex(regex: string | RegExp, options?: IRegexOptions) {
  return function (source: any, propertyName: string) {
    const opts: any = {
      format: 'regex',
      validateOptions: {
        regex: {
          source: _.isString(regex) ? regex : regex.source,
          flags: _.isString(regex) ? regex : regex.flags,
        }
      }
    };
    if (options) {
      _.assign(opts.validateOptions.regex, options);
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
      if (_.isUndefined(value)) {
        return true;
      }
      if (_.isString(value)) {
        const r = new RegExp(options.source, options.flags);
        if (r.test(value)) {
          return true;
        }
      }
      return false;
    },
    defaultOptions: {
      message: 'Value of property "%propertyName" doesn\'t match the regular expression "%options.source".'
    }
  }
);
