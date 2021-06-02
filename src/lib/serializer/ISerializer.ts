import {IClassRef} from '../../api/IClassRef';
import {IEntityRef} from '../../api/IEntityRef';

export interface ISerializer {
  serialize(klass: IClassRef | IEntityRef | Function | object): Promise<any>;
}
