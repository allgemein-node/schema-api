import {ClassType} from '../Constants';
import {IClassRef} from '../../api/IClassRef';

export interface IAbstractOptions {

  /**
   * target option
   */
  target?: Function | ClassType<any>;

  /**
   * metadata type of this options
   */
  metaType?: string;


  /**
   * namespace for this object
   */
  namespace?: string;

  /**
   * default key definitions
   */
  [k: string]: any;
}
