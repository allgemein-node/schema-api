import {ISerializerFactory} from './ISerializerFactory';
import {JsonSchema} from '../json-schema/JsonSchema';

export class SerializerRegistry {

  static serializer: { [k: string]: ISerializerFactory } = {};

  static register(factory: ISerializerFactory) {
    this.serializer[factory.getName()] = factory;
  }

  static get(name: string) {
    if (this.serializer[name]) {
      return this.serializer[name];
    }
    return null;
  }
}

SerializerRegistry.register(new JsonSchema());
