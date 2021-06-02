export interface IUnserializeOptions {

  /**
   * Name of serializer
   */
  serializer?: string;

  /**
   * Namespace of the registry
   */
  namespace?: string;


  /**
   * Return found entity refs or class refs.
   */
  return?: 'entity-refs' | 'class-refs' | 'default';

}
