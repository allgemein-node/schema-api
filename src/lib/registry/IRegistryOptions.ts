export interface IRegistryOptions {
  /**
   * If class is passed without annotated properties, then scan for existing defined attributes.
   *
   * Default value is true.
   */
  detectUnannotatedProperties?: boolean;
}
