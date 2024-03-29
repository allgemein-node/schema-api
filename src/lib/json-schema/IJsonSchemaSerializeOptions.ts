import {IJsonSchemaSerializer} from './IJsonSchemaSerializer';
import {ISerializeOptions} from '../serializer/ISerializeOptions';
import {IPropertyRef} from '../../api/IPropertyRef';
import {IClassRef} from "../../api/IClassRef";
import {IEntityRef} from "../../api/IEntityRef";

export interface IJsonSchemaSerializeOptions extends ISerializeOptions {

  /**
   * Version of json schema
   */
  version?: 'draft-07' | string;

  /**
   * If multiple schemas
   */
  handleMultipleSchemas?: 'reference' | 'clone';


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


  /**
   * Passed method for type correction if necessary, else
   */
  typeConversion?: (type: any, property: IPropertyRef) => string | null;

  /**
   * Passed method for type hint if necessary, else
   */
  typeHint?: (klass: Function | IClassRef, propertyName: string, instance: any, value: any) => string;

  /**
   * Default type hint on null or undefined
   */
  defaultTypeHint?: string;

  /**
   * Ignore unknown type
   */
  ignoreUnknownType?: boolean;

  /**
   * Serialize only decorated properties (default is true)
   */
  onlyDecorated?: boolean;

  /**
   * Add $namespace to schema
   */
  appendNamespace?: boolean;

  /**
   * Check if kind of property should be serialized
   *
   * - check for property ref
   * - or klass + property name
   *
   */
  allowedProperty?: (entry: IPropertyRef | string, klass?: Function) => boolean;
}
