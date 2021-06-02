import {IUnserializer} from '../serializer/IUnserializer';

export interface IJsonSchemaUnserializer extends IUnserializer{

  uri(): string;

  unserialize(data: string): any;

}
