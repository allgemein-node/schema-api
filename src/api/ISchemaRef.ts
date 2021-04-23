import {IBaseRef} from './IBaseRef';
import {IEntityRef} from './IEntityRef';

export interface ISchemaRef extends IBaseRef {

  name: string;

  getEntityRefs(): IEntityRef[];

  getEntityRefFor(value: string | Function): IEntityRef;
}
