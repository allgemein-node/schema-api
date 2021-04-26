import * as _ from 'lodash';
import {IJsonSchema7, IJsonSchema7Definition} from './JsonSchema7';
import {IClassRef} from '../../api/IClassRef';
import {IJsonSchemaUnserializeOptions} from './IJsonSchemaUnserializeOptions';
import {DRAFT_07} from './Constants';
import {IJsonSchemaUnserializer} from './IJsonSchemaUnserializer';
import {JsonSchema} from './JsonSchema';
import {RegistryFactory} from '../registry/RegistryFactory';
import {DEFAULT_NAMESPACE, METADATA_TYPE, METATYPE_CLASS_REF, METATYPE_ENTITY, METATYPE_PROPERTY} from '../Constants';
import {IEntityRef, isEntityRef} from '../../api/IEntityRef';
import {IEntityOptions} from '../options/IEntityOptions';
import {ClassRef} from '../ClassRef';
import {NotSupportedError, NotYetImplementedError} from '@allgemein/base/browser';
import {MetadataRegistry} from '../registry/MetadataRegistry';
import {IParseOptions, PARSE_OPTIONS_KEYS} from './IParseOptions';
import {IPropertyOptions} from '../options/IPropertyOptions';
import {IAbstractOptions} from '../options/IAbstractOptions';
import {SchemaUtils} from '../SchemaUtils';
import {any} from 'codelyzer/util/function';

const skipKeys = ['$id', 'id', 'title', 'type', 'properties', 'allOf', 'anyOf', '$schema'];

export class JsonSchema7Unserializer implements IJsonSchemaUnserializer {

  version: string = DRAFT_07;

  options: IJsonSchemaUnserializeOptions;

  data: IJsonSchema7;

  fetched: { [k: string]: IJsonSchema7 } = {};

  constructor(opts: IJsonSchemaUnserializeOptions) {
    this.options = opts;
  }

  uri(): string {
    return `http://json-schema.org/${DRAFT_07}/schema`;
  }


  async unserialize(data: any): Promise<IClassRef | IEntityRef | (IClassRef | IEntityRef)[]> {
    this.data = data;
    const isRoot = _.get(this.options, 'rootAsEntity', true);
    const opts: any = {isRoot: isRoot};
    PARSE_OPTIONS_KEYS.forEach(x => {
      if (_.has(this.options, x)) {
        opts[x] = this.options[x];
      }
    });
    return this.parse(data, opts);
  }

  /**
   * Return namespace if set in passed options or if used in json-schema object.
   * If no match return default namespace
   */
  getNamespace() {
    return _.get(this.options, 'namespace', _.get(this.data, 'namespace', DEFAULT_NAMESPACE));
  }

  getRegistry() {
    return RegistryFactory.get(this.getNamespace());
  }


  /**
   * If collectors are defined use them before default
   *
   *
   * @param type
   * @param key
   * @param data
   * @param options
   * @private
   */
  private collectOptions(key: string, data: IJsonSchema7, options: IParseOptions = {}) {
    const type = _.get(options, 'metaType', METATYPE_ENTITY);
    let ret: any = null;
    if (data[key]) {
      ret = {};
      ret[key] = data[key];
    }

    if (_.has(this.options, 'collector')) {
      const methods = this.options.collector.filter(x => x.type === type && x.key === key);
      ret = _.assign(ret, ...methods.map(e => e.fn(key, data, options)));
    }
    return ret;
  }


  getClassRef(className: string | Function, namespace?: string) {
    if (!namespace) {
      namespace = this.getNamespace();
    }
    return ClassRef.get(className, namespace);
  }


  async parse(data: IJsonSchema7, options: IParseOptions = null): Promise<IClassRef | IEntityRef | (IClassRef | IEntityRef)[]> {
    let ret: IClassRef | IEntityRef | (IClassRef | IEntityRef)[] = null;
    if (data.type) {

      if (data.type === 'object') {
        ret = await this.parseTypeObject(data, options);
        if (this.hasProperties(data)) {
          await this.parseProperties(ret, data.properties, options);
        }
      } else {
        throw new Error('type is not supported at this place');
      }

    } else if (data.$ref) {
      // refers
      const res = await this.followRef(data.$ref, this.data);
      const opts = _.clone(options);
      if (!opts.className) {
        opts.className = this.getClassNameFromRef(data.$ref);
      }
      ret = await this.parse(res, opts);
    } else if (data.anyOf && options.isRoot) {
      // loading multi schema
      ret = [] ;
      for(const anyEntry of data.anyOf){
        ret.push(await this.parse(anyEntry as any, options) as (IClassRef | IEntityRef));
      }
    } else {
      throw new Error('no valid schema element for further parse, key with name type or $ref must be present.');
    }
    return ret;
  }


  getDefinitionsKey(data: object) {
    for (const k of _.keys(data)) {
      if (k !== 'properties' && _.isObjectLike(data[k])) {
        const exists = _.keys(data[k]).find(x => _.has(data[k][x], 'type'));
        if (exists) {
          return k;
        }
      }
    }
    return 'definition';
  }


  async followRef($ref: string, data: IJsonSchema7): Promise<any> {
    let [addr, anchor] = $ref.split('#');

    if (!anchor) {
      anchor = '';
    }

    if (_.isEmpty(addr)) {
      //  local
      if (_.isEmpty(anchor)) {
        return data;
      } else if (/^\//.test(anchor)) {
        // starts with path
        const dottedPath = anchor.substr(1).replace(/\//, '.');
        const entry = _.get(data, dottedPath, null);
        if (entry) {
          return entry;
        }
      } else {
        // refs to local id
        const refHashed = '#' + anchor;
        if (data.$id === refHashed) {
          return data;
        } else {
          const defKey = this.getDefinitionsKey(data);
          if (data[defKey]) {
            for (const k of _.keys(data[defKey])) {
              const x = data[defKey][k] as IJsonSchema7;
              if (x && x.$id && x.$id === refHashed) {
                return x;
              }
            }
          }
        }
      }
    } else {
      // remote fetch url
      if (!this.fetched[addr]) {
        this.fetched[addr] = await JsonSchema.request(addr);
      }
      return this.followRef('#' + anchor, this.fetched[addr]);
    }
    // TODO create exception
    throw new Error($ref + ' not found');
  }


  async parseProperties(classRef: IClassRef | IEntityRef, properties: { [propertyName: string]: IJsonSchema7Definition }, options: IParseOptions = null) {
    const _classRef = isEntityRef(classRef) ? classRef.getClassRef() : classRef;
    const propertyNames = _.keys(properties);
    for (const propertyName of propertyNames) {
      await this.parseProperty(_classRef, propertyName, properties[propertyName], options);
    }
  }


  async parseProperty(classRef: IClassRef | IEntityRef, propertyName: string, data: IJsonSchema7Definition, options: IParseOptions = null) {
    const _classRef = isEntityRef(classRef) ? classRef.getClassRef() : classRef;

    const propOptions: IPropertyOptions = {
      metaType: METATYPE_PROPERTY,
      propertyName: propertyName,
      target: _classRef.getClass(true),
      type: 'object' // default type is object
    };

    if (_.isObjectLike(data)) {
      const parseOptions: IParseOptions = {
        isProperty: true,
        sourceRef: _classRef,
        propertyName: propertyName,
        isRoot: false,
        metaType: 'property'
      };
      const dataPointer = data as IJsonSchema7;
      const collectOptions = {};

      this.collectAndProcess(dataPointer, collectOptions, ['type', '$ref', '$schema'], parseOptions);
      _.assign(propOptions, collectOptions);
      if (dataPointer.$ref) {
        const ref = await this.parse(dataPointer, parseOptions);
        propOptions.type = ref;
      } else if (dataPointer.type) {
        await this.onTypes(dataPointer, propOptions, options);
      }
    } else {
      // boolean
      throw new NotSupportedError('passed boolean value as definition not supported');
    }

    _classRef.getRegistry().create(METATYPE_PROPERTY, propOptions);
  }


  hasProperties(datapointer: any) {
    return _.has(datapointer, 'properties');
  }


  async onTypes(dataPointer: IJsonSchema7, propOptions: any, options: any) {
    const hasProps = this.hasProperties(dataPointer);
    switch (dataPointer.type) {
      case 'string':
        const res = this.onTypeString(dataPointer);
        _.assign(propOptions, res);
        break;
      case 'boolean':
        propOptions.type = 'boolean';
        break;
      case 'integer':
        propOptions.type = 'number';
        break;
      case 'number':
        propOptions.type = 'number';
        break;
      case 'object':
        propOptions.type = 'object';
        if (hasProps) {
          propOptions.type = await this.parse(dataPointer, {isRoot: false});
        }
        break;
      case 'array':
        // check items
        if (dataPointer.minItems || dataPointer.maxItems) {
          propOptions.cardinality = {
            min: _.get(dataPointer, 'minItems', 0),
            max: _.get(dataPointer, 'maxItems', 0),
          };
        } else {
          propOptions.cardinality = 0;
        }

        if (dataPointer.items) {
          if (_.isArray(dataPointer.items)) {
            throw new NotSupportedError('tuple values for array is not supported');
          } else if (_.isObjectLike(dataPointer.items)) {
            const items = dataPointer.items as IJsonSchema7;
            if (items.$ref) {
              propOptions.type = await this.parse(items as IJsonSchema7, {isRoot: false});
            } else if (items.type === 'object') {
              propOptions.type = items.type;
              if (this.hasProperties(items)) {
                propOptions.type = await this.parse(items as IJsonSchema7, {isRoot: false});
              }
            } else {
              propOptions.type = items.type;
            }
          }
        }
        break;
      case 'null':
        throw new NotSupportedError('null value is not supported for property');
    }
  }


  onTypeString(dataPointer: any) {
    const propOptions: any = {};
    propOptions.type = 'string';
    // or date check format
    if (dataPointer.format) {
      propOptions.format = dataPointer.format;
      switch (dataPointer.format) {
        case 'date-time':
          // set date type
          propOptions.type = 'date';
          break;
        case 'date':
          // set date type
          propOptions.type = 'date';
          break;
      }
    }
    return propOptions;
  }


  async parseInherits(classRef: IClassRef, data: IJsonSchema7, key: 'allOf' | 'anyOf') {
    if (_.has(data, key)) {
      const values = data[key];
      if (_.isArray(values)) {
        for (const inheritEntry of values) {
          const extend = await this.parse(inheritEntry as IJsonSchema7, {isRoot: false}) as IClassRef;
          classRef.addExtend(extend);
        }
      } else {
        throw new NotSupportedError('only array is allowed for ' + key);
      }
    }
  }


  async parseTypeObject(data: IJsonSchema7, options: IParseOptions = null) {
    let ret: IClassRef | IEntityRef = null;

    const id = _.get(data, '$id', _.get(data, 'id', null));
    let metaType: METADATA_TYPE = options.isRoot || !_.isEmpty(id) ? METATYPE_ENTITY : METATYPE_CLASS_REF;

    const title = _.get(data, 'title', null);
    // get namespace or override
    const namespace = _.get(data, 'namespace', this.getNamespace());
    // check if class ref exists else create one or recreate if parse options are set
    let classRef: IClassRef = null;
    let className = null;
    if (options) {
      if (options.className) {
        className = options.className;
      }
      if (options.ref) {
        classRef = options.ref;
        className = options.ref.name;
      }
    }

    // title data override passed className
    if (title) {
      if (!className || !_.get(this.options, 'ignoreDeclared', false)) {
        className = _.upperFirst(_.camelCase(title));
      }
    }

    if (!className && options?.isProperty && options.propertyName) {
      className = _.upperFirst(_.camelCase(options.sourceRef.name + options.propertyName));
    }

    if (className && !classRef) {
      const fn = _.get(this.options, 'forceClassRefCreation', false) ? SchemaUtils.clazz(className) : className;
      classRef = this.getClassRef(fn, namespace);
    }

    if (!classRef) {
      metaType = METATYPE_CLASS_REF;
      classRef = this.getClassRef(new Function(), namespace);
    }

    // TODO check extentions!
    for (const inheritsKey of ['allOf', 'anyOf']) {
      if (_.has(data, inheritsKey)) {
        await this.parseInherits(classRef, data, inheritsKey as any);
      }
    }

    if (classRef) {
      // a named class ref exists

      const clazz = classRef.getClass(true);
      const refOptions: IEntityOptions = {
        name: classRef.name,
        namespace: this.getNamespace(),
        target: clazz
      };

      const collectorOptions = _.clone(options);
      collectorOptions.metaType = metaType;
      collectorOptions.ref = classRef;
      this.collectAndProcess(data, refOptions, skipKeys, collectorOptions);

      metaType = collectorOptions.metaType;

      const entityOptions = MetadataRegistry.$().find(metaType, (x: IAbstractOptions) => x.target === clazz);
      if (entityOptions) {
        // merge existing
        _.assign(entityOptions, refOptions);
      } else {
        // create new one
        MetadataRegistry.$().add(metaType, refOptions);
      }

      if (metaType === METATYPE_ENTITY) {
        ret = this.getRegistry().getEntityRefFor(clazz);
      } else {
        ret = classRef;
      }

    } else {
      throw new NotYetImplementedError();
    }

    return ret;
  }

  collectAndProcess(data: IJsonSchema7,
                    collectingObject: any,
                    skipKeys: string[],
                    collectorOptions: IParseOptions
  ) {
    const keys = _.keys(data).filter(k => !skipKeys.includes(k));
    for (const key of keys) {
      const entry = this.collectOptions(key, data, collectorOptions);
      if (entry && _.isObjectLike(entry)) {
        _.assign(collectingObject, entry);
      }
    }
  }

  getClassNameFromRef(data: string) {
    return data.split(/#|\//).pop();
  }

}
