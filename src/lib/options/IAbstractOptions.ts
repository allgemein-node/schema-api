export interface IAbstractOptions {

  /**
   * target option
   */
  target?: Function;

  /**
   * context of this options
   */
  $type?: string;

  [k: string]: any;
}
