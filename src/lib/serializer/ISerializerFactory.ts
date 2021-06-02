import {ISerializeOptions} from './ISerializeOptions';
import {ISerializer} from './ISerializer';
import {IUnserializeOptions} from './IUnserializeOptions';
import {IUnserializer} from './IUnserializer';
import {IClassRef} from '../../api/IClassRef';
import {IEntityRef} from '../../api/IEntityRef';

export interface ISerializerFactory {

  getName(): string;

  getSerializer(options?: ISerializeOptions): ISerializer;

  getUnserializer(options?: IUnserializeOptions): IUnserializer;

  serialize(klass: IClassRef | IEntityRef | Function | object, options?: ISerializeOptions): Promise<any>;

  unserialize(data: string, options?: ISerializeOptions): Promise<IClassRef | IEntityRef | (IClassRef | IEntityRef)[]>;

}
