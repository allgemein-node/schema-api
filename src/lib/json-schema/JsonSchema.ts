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
      if (addr.startsWith('file:///')) {
        const buffer = await PlatformUtils.readFile(addr.replace('file://', ''));
        const strValue = buffer.toString(_.get(opts, 'encoding', 'utf8'));
        return JSON.parse(strValue);
      } else {
        const got = PlatformUtils.load('got');
        const response = await got(addr, opts);
        return JSON.parse(response.body);
      }
    } catch (e) {
      console.error(e);
      return {};
    }

  }


  static getSerializer(options: IJsonSchemaSerializeOptions = {version: DRAFT_07}) {
    options = options || {};
    _.defaults(options, {version: DRAFT_07});
    switch (options.version) {
      case DRAFT_07:
        return new JsonSchema7Serializer(options);
    }
    return null;
  }

  static getUnserializer(options: IJsonSchemaUnserializeOptions = {version: DRAFT_07}) {
    options = options || {};
    _.defaults(options, {version: DRAFT_07});
    switch (options.version) {
      case DRAFT_07:
        return new JsonSchema7Unserializer(options);
    }
    return null;
  }

  static serialize(klass: IClassRef | IEntityRef | Function | object, options?: IJsonSchemaSerializeOptions) {
    const serializer = JsonSchema.getSerializer(options);
    return serializer.serialize(klass);
  }


  static unserialize(data: any, options?: IJsonSchemaUnserializeOptions): Promise<IClassRef | IEntityRef | (IClassRef | IEntityRef)[]> {
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
