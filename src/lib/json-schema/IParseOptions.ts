import {IClassRef} from '../../api/IClassRef';
import {METADATA_TYPE} from '../Constants';


export interface IParseOptions {
  isRoot?: boolean;
  ref?: IClassRef;
  className?: string;
  isProperty?: boolean;
  propertyName?: string;
  metaType?: METADATA_TYPE;
  sourceRef?: IClassRef;
  ignoreDeclared?: boolean;
  asArray?: boolean;
  $ref?: string;

}

export const PARSE_OPTIONS_KEYS: (keyof IParseOptions)[] = ['isRoot', 'className', 'ignoreDeclared'];
