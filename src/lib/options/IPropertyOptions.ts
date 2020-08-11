import {JS_DATA_TYPES} from '../..';

export interface IPropertyOptions {

  sourceClass?: Function;

  propertyName?: string;

  type?: JS_DATA_TYPES | any;

  [k: string]: any;
}
