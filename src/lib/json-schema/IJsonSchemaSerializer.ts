import {IClassRef} from '../../api/IClassRef';
import {IEntityRef} from '../../api/IEntityRef';
import {ISerializer} from '../serializer/ISerializer';

export interface IJsonSchemaSerializer extends ISerializer {

  uri(): string;

  serialize(klass: IClassRef | IEntityRef | Function | object): any;

}
