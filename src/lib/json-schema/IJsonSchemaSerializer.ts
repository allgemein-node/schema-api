import {IClassRef} from '../../api/IClassRef';
import {IEntityRef} from '../../api/IEntityRef';

export interface IJsonSchemaSerializer {

  uri(): string;

  serialize(klass: IClassRef | IEntityRef | Function | object): any;

}
