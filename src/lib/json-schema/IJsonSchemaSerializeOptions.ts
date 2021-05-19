import {IJsonSchemaSerializer} from './IJsonSchemaSerializer';

export interface IJsonSchemaSerializeOptions {

  /**
   * Version of json schema
   */
  version?: 'draft-07' | string;

  /**
   * If multiple schemas
   */
  handleMultipleSchemas?: 'reference' | 'clone';


  /**
   * Namespace of the registry
   */
  namespace?: string;

  /**
   * If set then on entries with type object the class function will be passed under key $target
   *
   * {
   *   title: 'TestClass',
   *   type: 'object',
   *   $target: ClassType<TestClass>
   * }
   */
  appendTarget?: boolean;


  /**
   * Callback for postprocess
   */
  postProcess?: (src: any, dst: any, serializer?: IJsonSchemaSerializer) => void;

  /**
   * Allow override of existing standard properties
   */
  allowKeyOverride?: boolean;

  /**
   * Property keys where information can be skipped
   * Default if not set: ['type', '$ref', 'target', '$target','propertyName', 'metaType', 'namespace', 'name']
   * See constant DEFAULT_KEY_TO_SKIP
   */
  keysToSkip?: string[];

  /**
   * By default options of reference properties are removed, to pass them set this to 'false'.
   */
  deleteReferenceKeys?: boolean;
}
