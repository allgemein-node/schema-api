import {IPropertyRef} from './IPropertyRef';
import {IClassRef} from './IClassRef';
import {IBuildOptions} from './IBuildOptions';
import {IBaseRef} from './IBaseRef';
import {ISchemaRef} from './ISchemaRef';
import {METATYPE_ENTITY} from "../lib/Constants";


export function isEntityRef(x: any): x is IEntityRef {
  return (x as IEntityRef)?.metaType === METATYPE_ENTITY;
}

export interface IEntityRef extends IBaseRef {


  getPropertyRef(name: string): IPropertyRef;

  getPropertyRefs(): IPropertyRef[];

  getSchemaRefs(): ISchemaRef | ISchemaRef[];

  getClassRef(): IClassRef;

  getClass(create?: boolean): Function;

  create<T>(addinfo?: boolean): T;

  build<T>(instance: any, options?: IBuildOptions): T;

  isOf(instance: any): boolean;

}
