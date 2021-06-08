import {IValidator} from './IValidator';

export interface IValidatorEntry {
  target: Function,
  property?: string,
  options?: any[],
  handles?: IValidator[]
}
