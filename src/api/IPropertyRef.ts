import {IClassRef} from "./IClassRef";
import {IBaseRef} from "./IBaseRef";
import {IBuildOptions} from "./IBuildOptions";
import {METATYPE_CLASS_REF, METATYPE_PROPERTY} from '../lib/Constants';

export function isPropertyRef(x: any){
  if (x !== undefined && x && x.metaType === METATYPE_PROPERTY) {
    return true;
  }
  return false;
}

export interface IPropertyRef extends IBaseRef {

  isIdentifier(): boolean;

  isReference(): boolean;

  getType(): string | Function;

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
