import {ClassType} from '../Constants';

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

  [k: string]: any;
}
