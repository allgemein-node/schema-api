import {
  assign,
  camelCase,
  clone,
  defaults,
  get,
  has,
  isArray,
  isEmpty,
  isNull,
  isObjectLike,
  isString,
  isUndefined,
  keys,
  upperFirst
} from 'lodash';
import {IJsonSchema7, IJsonSchema7Definition} from './JsonSchema7';
import {IClassRef} from '../../api/IClassRef';
import {IJsonSchemaUnserializeOptions} from './IJsonSchemaUnserializeOptions';
import {DRAFT_07} from './Constants';
import {IJsonSchemaUnserializer} from './IJsonSchemaUnserializer';
import {JsonSchema} from './JsonSchema';
import {RegistryFactory} from '../registry/RegistryFactory';
import {
  DEFAULT_NAMESPACE,
  K_PATTERN_PROPERTY,
  METADATA_TYPE,
  METATYPE_CLASS_REF,
  METATYPE_ENTITY,
  METATYPE_PROPERTY,
  T_ARRAY,
  T_OBJECT,
  T_STRING
} from '../Constants';
import {IEntityRef, isEntityRef} from '../../api/IEntityRef';
import {IEntityOptions} from '../options/IEntityOptions';
import {ClassRef} from '../ClassRef';
import {NotSupportedError, NotYetImplementedError} from '@allgemein/base';
import {MetadataRegistry} from '../registry/MetadataRegistry';
import {IParseOptions, PARSE_OPTIONS_KEYS} from './IParseOptions';
import {IPropertyOptions} from '../options/IPropertyOptions';
import {IAbstractOptions} from '../options/IAbstractOptions';
import {SchemaUtils} from '../SchemaUtils';
import {IPropertyRef} from '../../api/IPropertyRef';

const skipKeys = ['$id', 'id', 'title', 'type', 'properties', 'allOf', 'anyOf', '$schema', 'patternProperties'];

export class JsonSchema7Unserializer implements IJsonSchemaUnserializer {

  version: string = DRAFT_07;

  options: IJsonSchemaUnserializeOptions;

  data: IJsonSchema7;

  classRefs: IClassRef[] = [];

  fetched: { [k: string]: IJsonSchema7 } = {};

  reference: { [k: string]: any } = {};

  constructor(opts: IJsonSchemaUnserializeOptions) {
    this.options = opts;
  }

  uri(): string {
    return `http://json-schema.org/${DRAFT_07}/schema`;
  }


  async unserialize(data: any): Promise<IClassRef | IEntityRef | (IClassRef | IEntityRef)[]> {
    this.data = data;
    const isRoot = get(this.options, 'rootAsEntity', true);
    const opts: any = {isRoot: isRoot};
    PARSE_OPTIONS_KEYS.forEach(x => {
      if (has(this.options, x)) {
        opts[x] = this.options[x];
      }
    });

    const ret = this.options.return ? this.options.return : 'default';
    return this.parse(data, opts).then(refs => {
      switch (ret) {
        case 'class-refs':
          return this.classRefs;
        case 'entity-refs':
          return this.classRefs.filter(x => x.hasEntityRef()).map(x => x.getEntityRef());
        default:
          return refs;
      }
    });
  }

  /**
   * Return namespace if set in passed options or if used in json-schema object.
   * If no match return default namespace
   */
  getNamespace() {
    return get(this.options, 'namespace', get(this.data, 'namespace', DEFAULT_NAMESPACE));
  }

  /**
   * Get registry containing elements
   */
  getRegistry(ns: string = null) {
    return RegistryFactory.get(ns ? ns : this.getNamespace());
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
    const type = get(options, 'metaType', METATYPE_ENTITY);
    let ret: any = null;
    if (!isUndefined(data[key]) || !isNull(data[key])) {
      ret = {};
      ret[key] = data[key];
    }

    if (has(this.options, 'collector') && this.options.collector.length > 0) {
      const methods = this.options.collector.filter(x => x.type === type && x.key === key);
      if (methods) {
        ret = assign(ret, ...methods.map(e => e.fn.apply(null, [key, data, options])));
      }
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

      if (data.type === T_OBJECT) {
        ret = await this.parseTypeObject(data, options);
        if (options.$ref) {
          // finish reference if waiting
          this.reference[options.$ref] = ret;
          delete options.$ref;
        }

        if (this.hasProperties(data)) {
          await this.parseProperties(ret, data.properties, options);
        }
        if (this.hasPatternProperties(data)) {
          options.isPattern = true;
          await this.parseProperties(ret, data.patternProperties, options);
        }
      } else {
        throw new Error('type is not supported at this place');
      }

    } else if (data.$ref) {
      return this.parseRef(data, options);
    } else if (data.anyOf && options.isRoot) {
      // loading multi schema
      ret = [];
      for (const anyEntry of data.anyOf) {
        ret.push(await this.parse(anyEntry as any, options) as (IClassRef | IEntityRef));
      }
    } else {
      throw new Error('no valid schema element for further parse, key with name type or $ref must be present.');
    }
    return ret;
  }

  async parseRef(data: any, options: IParseOptions) {
    // refers
    let ret = null;
    if (has(this.reference, data.$ref)) {
      ret = this.reference[data.$ref];
    } else {
      const res = await this.followRef(data.$ref, this.data);
      const opts = clone(options);
      opts.$ref = data.$ref;
      if (!opts.className) {
        opts.className = this.getClassNameFromRef(data.$ref);
      }
      ret = await this.parse(res, opts);
    }
    return ret;
  }


  getDefinitionsKey(data: object) {
    for (const k of keys(data)) {
      if (k !== 'properties' && isObjectLike(data[k])) {
        const exists = keys(data[k]).find(x => has(data[k][x], 'type'));
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

    if (isEmpty(addr)) {
      //  local
      if (isEmpty(anchor)) {
        if (data.$ref) {
          return this.followRef(data.$ref, data);
        } else {
          return data;
        }

      } else if (/^\//.test(anchor)) {
        // starts with path
        const dottedPath = anchor.substr(1).replace(/\//, '.');
        const entry = get(data, dottedPath, null);
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
            for (const k of keys(data[defKey])) {
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
        this.fetched[addr] = await JsonSchema.request(addr, {cwd: this.options.cwd});
      }
      return this.followRef('#' + anchor, this.fetched[addr]);

    }
    // TODO create exception
    throw new Error($ref + ' not found');
  }


  async parseProperties(classRef: IClassRef | IEntityRef, properties: { [propertyName: string]: IJsonSchema7Definition }, options: IParseOptions = null) {
    const _classRef = isEntityRef(classRef) ? classRef.getClassRef() : classRef;
    const propertyNames = keys(properties);
    for (const propertyName of propertyNames) {
      await this.parseProperty(_classRef, propertyName, properties[propertyName], options);
    }
  }


  async parseProperty(classRef: IClassRef | IEntityRef, propertyName: string, data: IJsonSchema7Definition, options: IParseOptions = null) {
    const _classRef = isEntityRef(classRef) ? classRef.getClassRef() : classRef;

    const propRefExits = _classRef.getRegistry()
      .find(METATYPE_PROPERTY,
        (x: IPropertyRef) => x.getClassRef() === _classRef && x.name === propertyName) as IPropertyRef;

    const propOptions: IPropertyOptions = {
      metaType: METATYPE_PROPERTY,
      propertyName: propertyName,
      target: _classRef.getClass(true),
      // default type is object
      type: T_OBJECT,
    };
    if (options.isPattern) {
      propOptions[K_PATTERN_PROPERTY] = true;
    }

    if (isObjectLike(data)) {
      const parseOptions: IParseOptions = {
        isProperty: true,
        sourceRef: _classRef,
        propertyName: propertyName,
        isRoot: false,
        metaType: 'property',
        // isPattern: options.isPattern ? true : false
      };
      const dataPointer = data as IJsonSchema7;
      let collectOptions = {};
      collectOptions = this.collectAndProcess(dataPointer, collectOptions, ['type', '$ref', '$schema', '$id'], parseOptions);
      assign(propOptions, collectOptions);
      if (dataPointer.$ref) {
        const ref = await this.parse(dataPointer, parseOptions);
        propOptions.type = ref;
        if (options.isPattern) {
          propOptions[K_PATTERN_PROPERTY] = true;
        }
      } else if (dataPointer.type) {
        await this.onTypes(dataPointer, propOptions, parseOptions);
      }
    } else {
      // boolean
      throw new NotSupportedError('passed boolean value as definition not supported');
    }

    if (!propRefExits || get(this.options, 'forcePropertyRefCreation', false)) {
      // remove properties key if exists
      delete propOptions.properties;
      _classRef.getRegistry().create(METATYPE_PROPERTY, propOptions);
    } else if (propRefExits) {
      propRefExits.setOptions(propOptions);
    }

  }


  hasProperties(datapointer: any) {
    return has(datapointer, 'properties');
  }

  hasPatternProperties(datapointer: any) {
    return has(datapointer, 'patternProperties');
  }

  async onTypes(dataPointer: IJsonSchema7, propOptions: IPropertyOptions, options: IParseOptions) {
    let type = dataPointer.type as string;
    if (isString(type)) {
      type = type.toLowerCase();
    }
    switch (type) {
      case T_STRING:
        const res = this.onTypeString(dataPointer);
        assign(propOptions, res);
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
      case T_OBJECT:
        propOptions.type = T_OBJECT;
        if (this.hasProperties(dataPointer) || this.hasPatternProperties(dataPointer)) {
          propOptions.type = await this.parse(dataPointer, options);
        }
        break;
      case T_ARRAY:
        // check items
        if (dataPointer.minItems || dataPointer.maxItems) {
          propOptions.cardinality = {
            min: get(dataPointer, 'minItems', 0),
            max: get(dataPointer, 'maxItems', 0),
          };
        } else {
          propOptions.cardinality = 0;
        }

        if (dataPointer.items) {

          if (isArray(dataPointer.items)) {
            throw new NotSupportedError('tuple values for array is not supported');
          } else if (isObjectLike(dataPointer.items)) {
            options.asArray = true;
            const items = dataPointer.items as IJsonSchema7;
            if (items.$ref) {
              propOptions.type = await this.parse(items as IJsonSchema7, options);
            } else if (items.type === T_OBJECT) {
              propOptions.type = items.type;
              if (this.hasProperties(items) || this.hasPatternProperties(items)) {
                propOptions.type = await this.parse(items as IJsonSchema7, options);
              }
            } else {
              propOptions.type = items.type;
            }
            if (options.isPattern) {
              propOptions[K_PATTERN_PROPERTY] = true;
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
    propOptions.type = T_STRING;
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
    if (has(data, key)) {
      const values = data[key];
      if (isArray(values)) {
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

    const id = get(data, '$id', get(data, 'id', null));
    let metaType: METADATA_TYPE = options.isRoot || !isEmpty(id) ? METATYPE_ENTITY : METATYPE_CLASS_REF;


    const title = get(data, 'title', null);
    // get namespace or override
    const namespace = get(data, 'namespace', this.getNamespace());
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
      if (!className || !get(this.options, 'ignoreDeclared', false)) {
        className = upperFirst(camelCase(title));
      }
    }

    let entityName = metaType === METATYPE_ENTITY && id ? id.replace(/^#/, '') : className;
    if (!className && options?.isProperty && options.propertyName) {
      if (get(this.options, 'prependClass', false)) {
        className = [options.sourceRef.name, options.propertyName].map(x => upperFirst(camelCase(x))).join('');
      } else {
        className = upperFirst(camelCase(options.propertyName));
      }
      // pass property name as entity name if the object is declared as a property
      entityName = className;
    }

    if (className && !classRef) {
      const fn = get(this.options, 'forceClassRefCreation', false) ? SchemaUtils.clazz(className) : className;
      classRef = this.getClassRef(fn, namespace);
    }

    if (!classRef) {
      metaType = METATYPE_CLASS_REF;
      classRef = this.getClassRef(SchemaUtils.clazzAnonymous(), namespace);
    }

    // TODO check extentions!
    for (const inheritsKey of ['allOf', 'anyOf']) {
      if (has(data, inheritsKey)) {
        await this.parseInherits(classRef, data, inheritsKey as any);
      }
    }

    if (classRef) {
      // a named class ref exists
      if (!this.classRefs.find(x => x === classRef)) {
        this.classRefs.push(classRef);
      }

      const clazz = classRef.getClass(true);
      const refOptions: IEntityOptions = {
        name: entityName,
        namespace: this.getNamespace(),
        target: clazz
      };

      const collectorOptions = clone(options);
      collectorOptions.metaType = metaType;
      collectorOptions.ref = classRef;
      this.collectAndProcess(data, refOptions, skipKeys, collectorOptions);

      metaType = collectorOptions.metaType;

      let entityOptions = MetadataRegistry.$().find(metaType, (x: IAbstractOptions) => x.target === clazz);
      if (entityOptions) {
        // merge existing
        assign(entityOptions, refOptions);
      } else {
        entityOptions = refOptions;
        refOptions.metaType = METATYPE_CLASS_REF;
        const existingOptions = classRef.getOptions();

        classRef.setOptions(defaults(refOptions, existingOptions));
      }

      if (metaType === METATYPE_ENTITY) {
        ret = this.getRegistry(namespace).find(metaType, (x: IEntityRef) => x.getClassRef() === classRef);
        if (!ret || get(this.options, 'forceEntityRefCreation', false)) {
          ret = this.getRegistry(namespace).create(metaType, entityOptions);
        }
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
                    collectorOptions: IParseOptions) {
    const type = get(collectorOptions, 'metaType', METATYPE_ENTITY);
    const _keys = keys(data);
    for (const key of _keys) {
      const entry = this.collectOptions(key, data, collectorOptions);
      if (skipKeys.includes(key)) {
        continue;
      }
      if (entry && isObjectLike(entry)) {
        collectingObject = assign(collectingObject, entry);
      }
    }
    if (has(this.options, 'collector') && this.options.collector.length > 0) {
      const methods = this.options.collector.filter(x => x.type === type && isUndefined(x.key));
      if (methods.length > 0) {
        collectingObject = assign(collectingObject, ...methods.map(e => e.fn.apply(null, [null, data, collectorOptions])));
      }
    }
    return collectingObject;
  }

  getClassNameFromRef(data: string) {
    return data.split(/#|\//).pop();
  }

}
