import {IPropertyRefMetadata} from "./IPropertyRefMetadata";


export interface IEntityRefMetadata {
  id?: string,
  name?: string,
  type?: string,
  machineName?: string,
  options?: any,
  schema?: string,
  properties?: IPropertyRefMetadata[]
}
