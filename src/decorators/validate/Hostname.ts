import * as _ from 'lodash';
import {AnnotationsHelper} from '../../lib/AnnotationsHelper';
import {DefaultValidator} from '../../lib/validation/DefaultValidator';
import {IValidateOptions} from '../../lib/validation/IValidateOptions';

export interface IHostnameOptions extends IValidateOptions {
  required?: boolean;
}

export function Hostname(options?: IHostnameOptions) {
  return function (source: any, propertyName: string) {
    const opts: any = {
      format: 'hostname',

    };

    if (options) {
      _.assign(opts, {validateOptions: {hostname: {}}});
      _.assign(opts.validateOptions.hostname, options);
    }

    AnnotationsHelper.forPropertyOn(
      source.constructor,
      propertyName,
      opts,
      'merge'
    );
  };
}

export const HOSTNAME_RFC952_REGEX = /^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$/;
export const HOSTNAME_RFC1034_REGEX = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;

DefaultValidator.define({
    name: 'hostname',
    fn: (value: string, options?: IHostnameOptions) => {
      if (_.isUndefined(value) || _.isNull(value)) {
        if (!_.get(options, 'required', false)) {
          return true;
        }
        return false;
      }
      return HOSTNAME_RFC952_REGEX.test(value);
    },
    defaultOptions: {
      message: 'Value of property "%propertyName" must be a valid hostname.'
    }
  }
);
