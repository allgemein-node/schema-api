import {METADATA_TYPE} from '../Constants';
import {IAbstractOptions} from './IAbstractOptions';

export interface IAttributeOptions extends IAbstractOptions {
  targetTypes: (METADATA_TYPE | string)[];
  propertyName?: string;
  attributes: any;
}
