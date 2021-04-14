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

}
