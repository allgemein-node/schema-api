import {METADATA_TYPE} from '../Constants';
import {IParseOptions} from './IParseOptions';

export interface IJsonSchemaUnserializeOptions extends IParseOptions {

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
   * If set then a new class ref will be created even if an with same name already exists.
   */
  forceClassRefCreation?: boolean;

  /**
   * If set then a new entity ref will be created even if an with same name already exists.
   */
  forceEntityRefCreation?: boolean;

  /**
   * Is root object an entity.
   */
  rootAsEntity?: boolean;

  /**
   * Prepend class name on object which is a property.
   */
  prependClass?: boolean;
}
