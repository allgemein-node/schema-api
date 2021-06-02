import {IClassRef} from '../../api/IClassRef';
import {IEntityRef} from '../../api/IEntityRef';

export interface IUnserializer {
  unserialize(data: string): Promise<IClassRef | IEntityRef | (IClassRef | IEntityRef)[]>;
}
