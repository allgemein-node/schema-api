export interface IJsonSchemaSerializeOptions {

  /**
   * Version of json schema
   */
  version: 'draft-07' | string;

  /**
   * If multiple schemas
   */
  handleMultipleSchemas?: 'reference' | 'clone';


  /**
   * handles
   */
}
