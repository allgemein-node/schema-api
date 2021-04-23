import {IPropertyRef} from './IPropertyRef';
import {IClassRef} from './IClassRef';
import {IBuildOptions} from './IBuildOptions';
import {IBaseRef} from './IBaseRef';
import {ISchemaRef} from './ISchemaRef';

// import {IEntityRefMetadata} from "./metadata/IEntityRefMetadata";

export function isEntityRef(x: any): x is IEntityRef {
  return (x as IEntityRef)?.metaType === 'entity';
}

export interface IEntityRef extends IBaseRef {

  getNamespace(): string;

  getPropertyRef(name: string): IPropertyRef;

  getPropertyRefs(): IPropertyRef[];

  getSchemaRefs(): ISchemaRef[];

  getClassRef(): IClassRef;

  getClass(create?: boolean): Function;

  create<T>(addinfo?: boolean): T;

  build<T>(instance: any, options?: IBuildOptions): T;

  // toJson(follow?:boolean): IEntityRefMetadata;

}
