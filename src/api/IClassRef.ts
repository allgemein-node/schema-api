import {IPropertyRef} from './IPropertyRef';
import {IBuildOptions} from './IBuildOptions';
import {IBaseRef} from './IBaseRef';
import {ILookupRegistry} from './ILookupRegistry';
import {METATYPE_CLASS_REF} from '../lib/Constants';


export function isClassRef(x: any): x is IClassRef {
  if (x !== undefined && x && x.metaType === METATYPE_CLASS_REF) {
    return true;
  }
  return false;
}


export interface IClassRef extends IBaseRef {

  isPlaceholder(): boolean;

  isAnonymous(): boolean;

  getClass(create?: boolean): Function;

  getPropertyRef(name: string): IPropertyRef;

  getPropertyRefs(): IPropertyRef[];

  create<T>(addinfo?: boolean): T;

  build<T>(instance: any, options?: IBuildOptions): T;

  getNamespace(): string;

  switchNamespace(namespace: string): void;

  getRegistry(): ILookupRegistry;

  getExtend(): IClassRef;

  getExtends(): IClassRef[];

  addExtend(ref: IClassRef): IClassRef;

  // toJson(withProperties?: boolean): IClassRefMetadata;

}
