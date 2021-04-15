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
   * If set then on entries with type object the class function will be passed under key $target
   *
   * {
   *   title: 'TestClass',
   *   type: 'object',
   *   $target: ClassType<TestClass>
   * }
   */
  appendTarget?: boolean;
}
