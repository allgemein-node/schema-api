import {IPropertyRefMetadata} from "./IPropertyRefMetadata";

export interface IClassRefMetadata {

  schema?: string;

  className?: string,

  isEntity?: boolean,

  options?: any,

  properties?: IPropertyRefMetadata[]

}
