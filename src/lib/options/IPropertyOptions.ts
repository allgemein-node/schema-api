import {JS_DATA_TYPES} from '../../lib/Constants';
import {IAbstractOptions} from './IAbstractOptions';

export interface IPropertyOptions extends IAbstractOptions {

  propertyName?: string;

  cardinality?: number | { min: number, max: number };

  format?: string;

  type?: JS_DATA_TYPES | any;

  /**
   * Mark if value is representation of unique identifier
   */
  identifier?: boolean;

  /**
   * Generate automatically values for identifier
   */
  generated?: boolean;
}
