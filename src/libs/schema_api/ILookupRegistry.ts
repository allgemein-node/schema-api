import {IEntityRef} from './IEntityRef';
import {IPropertyRef} from './IPropertyRef';
import {XS_TYPE} from './Constants';


export interface ILookupRegistry {

  getEntityRefFor(fn: any): IEntityRef;

  getPropertyRefsFor(fn: any): IPropertyRef[];

  fromJson(json: any): IEntityRef;

  list<X>(type: XS_TYPE, filter?: (x: any) => boolean): X[];

  listEntities(filter?: (x: IEntityRef) => boolean): IEntityRef[];

  listProperties(filter?: (x: IPropertyRef) => boolean): IPropertyRef[];
}
