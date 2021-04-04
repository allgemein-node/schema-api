import {IPropertyRef} from './IPropertyRef';
import {IBuildOptions} from './IBuildOptions';
import {IBaseRef} from './IBaseRef';
import {ILookupRegistry} from './ILookupRegistry';


export function isClassRef(x: any): x is IClassRef {
  if (x !== undefined) {
    return (x as IClassRef).getClass !== undefined && (x as IClassRef).getPropertyRefs !== undefined;
  }
  return false;
}


export interface IClassRef extends IBaseRef {

  isPlaceholder: boolean;

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

  // toJson(withProperties?: boolean): IClassRefMetadata;

}
