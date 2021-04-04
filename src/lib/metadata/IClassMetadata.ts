import {IPropertyMetadata} from './IPropertyMetadata';

export interface IClassMetadata {

  className?: string,

  inherits?: string,

  options?: any;

  properties?: { [propertyName: string]: IPropertyMetadata };

}
