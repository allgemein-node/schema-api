import * as _ from 'lodash';
import {AnnotationsHelper} from '../../lib/AnnotationsHelper';
import {DefaultValidator} from '../../lib/validation/DefaultValidator';
import {IValidateOptions} from '../../lib/validation/IValidateOptions';

export interface IIsEmailOptions extends IValidateOptions {
  required?: boolean;
}

export function IsEmail(options: IIsEmailOptions = null) {
  return function (source: any, propertyName: string) {
    const opts: any = {
      format: 'email',
      validateOptions: {email: {}}
    };
    if (options) {
      opts.validateOptions = {email: options};
    }
    AnnotationsHelper.forPropertyOn(
      source.constructor,
      propertyName,
      opts,
      'merge'
    );
  };
}

const MAIL_REGEX = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;


DefaultValidator.define({
    name: 'email',
    fn: (value: string, options: IIsEmailOptions) => {
      if (_.isUndefined(value) || _.isNull(value)) {
        if (!_.get(options, 'required', false)) {
          return true;
        }
        return false;
      }
      return MAIL_REGEX.test(value);
    },
    defaultOptions: {
      message: 'Value of property "%propertyName" must be a valid email.'
    }
  }
);
