import {defaults, get, isString} from 'lodash';

import {IClassRef} from '../../api/IClassRef';
import {IEntityRef} from '../../api/IEntityRef';
import {JsonSchema7Serializer} from './JsonSchema7Serializer';
import {IJsonSchemaSerializeOptions} from './IJsonSchemaSerializeOptions';
import {IJsonSchemaUnserializeOptions} from './IJsonSchemaUnserializeOptions';
import {DRAFT_07, JSON_SCHEMA_SERIALIZER} from './Constants';
import {PlatformUtils} from '@allgemein/base';
import {JsonSchema7Unserializer} from './JsonSchema7Unserializer';
import {ISerializerFactory} from '../serializer/ISerializerFactory';
import {ISerializer} from '../serializer/ISerializer';
import {IUnserializer} from '../serializer/IUnserializer';


export class JsonSchema implements ISerializerFactory {


  static async request(addr: string, opts: any = {}) {
    try {
      if (addr.startsWith('file:///')) {
        const buffer = await PlatformUtils.readFile(addr.replace('file://', ''));
        const strValue = buffer.toString(get(opts, 'encoding', 'utf8'));
        return JSON.parse(strValue);
      } else if (addr.startsWith('.')) {
        const cwd = opts.cwd ? opts.cwd : process.cwd();
        const path = PlatformUtils.join(cwd, addr);
        const buffer = await PlatformUtils.readFile(path);
        const strValue = buffer.toString(get(opts, 'encoding', 'utf8'));
        return JSON.parse(strValue);
      } else if (PlatformUtils.isAbsolute(addr)) {
        const buffer = await PlatformUtils.readFile(addr);
        const strValue = buffer.toString(get(opts, 'encoding', 'utf8'));
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
    defaults(options, {version: DRAFT_07});
    switch (options.version) {
      case DRAFT_07:
        return new JsonSchema7Serializer(options);
    }
    return null;
  }

  static getUnserializer(options: IJsonSchemaUnserializeOptions = {version: DRAFT_07}) {
    options = options || {};
    defaults(options, {version: DRAFT_07});
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
      if (isString(schema['$schema'])) {
        const match = schema['$schema'].match(/json-schema.org\/(.*)\/schema/);
        if (match && match[1]) {
          return match[1];
        }
      }
    }
    return fallback;
  }

  getName(): string {
    return JSON_SCHEMA_SERIALIZER;
  }

  getSerializer(options?: IJsonSchemaSerializeOptions): ISerializer {
    return JsonSchema.getSerializer(options);
  }

  getUnserializer(options?: IJsonSchemaUnserializeOptions): IUnserializer {
    return JsonSchema.getUnserializer(options);
  }

  serialize(klass: IClassRef | IEntityRef | Function | object, options?: IJsonSchemaSerializeOptions): any {
    return JsonSchema.serialize(klass, options);
  }

  unserialize(data: string, options?: IJsonSchemaUnserializeOptions): Promise<IClassRef | IEntityRef | (IClassRef | IEntityRef)[]> {
    return JsonSchema.unserialize(data, options);
  }


}
