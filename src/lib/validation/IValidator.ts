import {IValidateOptions} from './IValidateOptions';

export interface IValidator {

  name: string;

  fn: (value: any, options: IValidateOptions, instance?: any) => boolean;

  defaultOptions?: {
    message?: string
  };

  involveOnOptionKey?: string

}
