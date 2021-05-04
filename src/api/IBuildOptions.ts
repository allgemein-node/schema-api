import {IEntityRef} from "./IEntityRef";
import {IClassRef} from "./IClassRef";

/**
 * Build options for generation of object instance
 */
export interface IBuildOptions {


  /**
   * Do not add __CLASS__ and __NS__ in build
   */
  skipClassNamespaceInfo?: boolean;

  /**
   * If set only the object instance will be created and all object members will be copied
   */
  createAndCopy?: boolean;

  /**
   * Special callback for preprocessing
   *
   * @param entityRef
   * @param from
   * @param to
   */
  beforeBuild?: (entityRef: IEntityRef | IClassRef, from: any, to: any, options?: IBuildOptions) => void

  /**
   * Special callback for postprocessing
   *
   * @param entityRef
   * @param from
   * @param to
   */
  afterBuild?: (entityRef: IEntityRef | IClassRef, from: any, to: any, options?: IBuildOptions) => void
}
