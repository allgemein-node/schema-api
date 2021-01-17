import {JS_DATA_TYPES} from '../../lib/Constants';
import {IAbstractOptions} from './IAbstractOptions';

export interface IPropertyOptions extends IAbstractOptions {

  propertyName?: string;

  type?: JS_DATA_TYPES | any;
}
