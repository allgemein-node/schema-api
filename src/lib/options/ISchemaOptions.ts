import {IAbstractOptions} from './IAbstractOptions';
import {INamedOptions} from "./INamedOptions";

export interface ISchemaOptions extends IAbstractOptions, INamedOptions {

  /**
   * Inherited fromAn name of the schema must exists
   */
  name: string;

}
