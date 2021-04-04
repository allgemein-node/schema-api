import {IClassRef} from "./IClassRef";
import {IBaseRef} from "./IBaseRef";
import {IBuildOptions} from "./IBuildOptions";

export interface IPropertyRef extends IBaseRef {

  isIdentifier(): boolean;

  isReference(): boolean;

  getType(): string;

  /**
   * get class ref of the property
   */
  getClassRef(): IClassRef;

  getTargetRef(): IClassRef;

  isCollection(): boolean;

  convert(i: any, options?: IBuildOptions): any;

  // toJson(follow?: boolean): IPropertyRefMetadata;

  get(instance: any): any;
}
