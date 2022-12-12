import {ClassType} from '../Constants';
import {IClassRef} from '../../api/IClassRef';

export interface IAbstractOptions {

  /**
   * target option
   */
  target?: Function | ClassType<any> | string;

  /**
   * metadata type of this options
   */
  metaType?: string;


  /**
   * namespace for this object
   */
  namespace?: string;


  /**
   * skip namespace check and pass value
   */
  skipNsCheck?: boolean;

  /**
   * if namespace is wrong then either throw error or ignore wrong entry
   */
  failedNsCheckMode?: 'throw' | 'ignore';

  /**
   * default key definitions
   */
  [k: string]: any;
}
