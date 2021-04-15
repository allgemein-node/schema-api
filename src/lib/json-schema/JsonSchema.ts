import * as _ from 'lodash';
import {IClassRef} from '../../api/IClassRef';
import {IEntityRef} from '../../api/IEntityRef';
import {JsonSchema7Serializer} from './JsonSchema7Serializer';
import {IJsonSchemaSerializeOptions} from './IJsonSchemaSerializeOptions';
import {IJsonSchemaUnserializeOptions} from './IJsonSchemaUnserializeOptions';
import {DRAFT_07} from './Constants';
import {PlatformUtils} from '@allgemein/base';
import {JsonSchema7Unserializer} from './JsonSchema7Unserializer';


export class JsonSchema {


  static async request(addr: string, opts: any = {}) {
    try {
      const got = PlatformUtils.load('got');
      const response = await got(addr, opts);
      return JSON.parse(response.body);
    } catch (e) {
      console.error(e);
      return {};
    }

  }


  private static getSerializer(options: IJsonSchemaSerializeOptions) {
    switch (options.version) {
      case DRAFT_07:
        return new JsonSchema7Serializer(options);
    }
    return null;
  }

  private static getUnserializer(options: IJsonSchemaUnserializeOptions) {
    switch (options.version) {
      case DRAFT_07:
        return new JsonSchema7Unserializer(options);
    }
    return null;
  }

  static serialize(klass: IClassRef | IEntityRef | Function | object, options?: IJsonSchemaSerializeOptions) {
    options = options ? options : {version: DRAFT_07};
    _.defaults(options, {version: DRAFT_07});
    const serializer = JsonSchema.getSerializer(options);
    return serializer.serialize(klass);
  }


  static unserialize(data: any, options?: IJsonSchemaUnserializeOptions): Promise<IClassRef | IEntityRef> {
    options = options ? options : {};
    const schema = this.detectSchemaVersion(data);
    options.version = schema;
    const serializer = this.getUnserializer(options);
    return serializer.unserialize(data);
  }


  static detectSchemaVersion(schema: object, fallback: string = DRAFT_07) {
    if (schema['$schema']) {
      if (_.isString(schema['$schema'])) {
        const match = schema['$schema'].match(/json-schema.org\/(.*)\/schema/);
        if (match && match[1]) {
          return match[1];
        }
      }
    }
    return fallback;
  }


}