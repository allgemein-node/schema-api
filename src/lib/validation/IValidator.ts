import {IValidatorEntry} from './IValidatorEntry';

export interface IValidator {

  name: string;

  fn: (value: any, options: IValidatorEntry, instance?: any) => boolean;

  defaultOptions?: {
    message?: string
  };

  involveOnOptionKey?: string

}
