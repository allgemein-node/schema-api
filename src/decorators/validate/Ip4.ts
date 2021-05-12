import {AnnotationsHelper} from '../../lib/AnnotationsHelper';
import {DefaultValidator} from '../../lib/validation/DefaultValidator';
import {IValidateOptions} from '../../lib/validation/IValidateOptions';
import {assign, isNull, isString, isUndefined} from 'lodash';


export interface IIp4Options extends IValidateOptions {
  required?: boolean;
}

export function Ip4(options?: IIp4Options) {
  return function (source: any, propertyName: string) {
    const opts: any = {
      format: 'ip4'
    };
    if (options) {
      assign(opts, {validateOptions: {ip4: {}}});
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

export const IP4_REGEX = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;


DefaultValidator.define({
    name: 'ip4',
    fn: (value: string, options?: IIp4Options) => {
      if (isUndefined(value) || isNull(value) || !isString(value)) {
        // if (!get(options, 'required', false)) {
        //   return true;
        // }
        return false;
      }
      return IP4_REGEX.test(value);
    },
    defaultOptions: {
      message: 'Value of property "%propertyName" must be a valid ip4 address.'
    }
  }
);
