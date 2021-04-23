import {AnnotationsHelper} from '../../lib/AnnotationsHelper';
import {DefaultValidator} from '../../lib/validation/DefaultValidator';
import {IValidateOptions} from '../../lib/validation/IValidateOptions';
import {assign, get, isNull, isUndefined} from 'lodash';
import * as _ from 'lodash';

export interface IIp6Options extends IValidateOptions {
  required?: boolean;
}

export function Ip6(options?: IIp6Options) {
  return function (source: any, propertyName: string) {
    const opts: any = {
      format: 'ip6'
    };
    if (options) {
      _.assign(opts, {validateOptions: {ip4: {}}});
      assign(opts.validateOptions.ip4, options);
    }

    AnnotationsHelper.forPropertyOn(
      source.constructor,
      propertyName,
      opts,
      'merge'
    );
  };
}

export const IP6_REGEX = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;


DefaultValidator.define({
    name: 'ip6',
    fn: (value: string, options?: IIp6Options) => {
      if (isUndefined(value) || isNull(value)) {
        if (!get(options, 'required', false)) {
          return true;
        }
        return false;
      }
      return IP6_REGEX.test(value);
    },
    defaultOptions: {
      message: 'Value of property "%propertyName" must be a valid ip6 address.'
    }
  }
);
