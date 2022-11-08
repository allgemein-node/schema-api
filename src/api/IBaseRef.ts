import {METADATA_TYPE} from '../lib/Constants';
import {ILookupRegistry} from './ILookupRegistry';
import {INamedOptions} from "../lib/options/INamedOptions";


export interface IBaseRef {

  /**
   * Original class name
   */
  name: string;

  /**
   * Name for backend system
   */
  storingName: string;

  /**
   * Name for processing and identifing
   */
  machineName: string;

  /**
   * meta data tpye
   */
  metaType: METADATA_TYPE;

  /**
   * Unique identifier
   */
  id(): string;


  /**
   * Return some options
   */
  getOptions(key?: string, defaultValue?: any): any;

  /**
   * Set some option
   */
  setOption(key: string, value: any): void;

  /**
   * Set options
   */
  setOptions(value: any): void;


  /**
   * Return the namespace name.
   */
  getNamespace(): string;

  /**
   * Return the registry.
   */
  getRegistry?(): ILookupRegistry;

}
