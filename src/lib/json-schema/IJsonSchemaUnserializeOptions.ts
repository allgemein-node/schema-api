import {METADATA_TYPE} from '../Constants';
import {IParseOptions} from './IParseOptions';

export interface IJsonSchemaUnserializeOptions {

  /**
   * Version of json schema
   */
  version?: 'draft-7' | string;

  /**
   * Namespace of the registry
   */
  namespace?: string;

  /**
   * Key specific method for options extraction from json schema to entity or property options
   */
  collector?: { type: METADATA_TYPE, key: string, fn: (key: string, data: any, options: IParseOptions) => any }[];

  /**
   * If set already existing classes are not followed and parsed
   */
  skipExistingClasses?: boolean;


  /**
   * is root object an entity
   */
  rootAsEntity?: boolean;
}
