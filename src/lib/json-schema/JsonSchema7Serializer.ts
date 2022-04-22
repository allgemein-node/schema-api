import {
  defaults,
  get,
  has,
  isEmpty,
  isFunction,
  isNull,
  isString,
  isUndefined,
  keys,
  set,
  snakeCase,
  uniqBy
} from 'lodash';
import {ClassUtils, NotSupportedError} from '@allgemein/base';
import {IJsonSchema7, IJsonSchema7Definition, IJsonSchema7TypeName, JSON_SCHEMA_7_TYPES} from './JsonSchema7';
import {
  DEFAULT_KEY_TO_SKIP,
  K_PATTERN_PROPERTY, METATYPE_NAMESPACE,
  METATYPE_PROPERTY,
  T_ARRAY,
  T_BOOLEAN,
  T_OBJECT,
  T_STRING
} from '../Constants';
import {IClassRef, isClassRef} from '../../api/IClassRef';
import {SchemaUtils} from '../SchemaUtils';
import {IPropertyRef} from '../../api/IPropertyRef';
import {IJsonSchemaSerializer} from './IJsonSchemaSerializer';
import {IEntityRef, isEntityRef} from '../../api/IEntityRef';
import {IJsonSchemaSerializeOptions} from './IJsonSchemaSerializeOptions';
import {C_ONLY_DECORATED, DRAFT_07} from './Constants';
import {MetadataRegistry} from '../registry/MetadataRegistry';
import {IEntityOptions} from '../options/IEntityOptions';
import {IPropertyOptions} from '../options/IPropertyOptions';
import {getReflectedType, setDefaultArray} from "./functions";
import {getClassName} from "../functions";


export class JsonSchema7Serializer implements IJsonSchemaSerializer {

  options: IJsonSchemaSerializeOptions;

  data: IJsonSchema7;

  current: string;

  constructor(opts: IJsonSchemaSerializeOptions) {
    this.options = opts || {};
    defaults(this.options, <IJsonSchemaSerializeOptions>{
      keysToSkip: DEFAULT_KEY_TO_SKIP,
      ignoreUnknownType: false,
      defaultTypeHint: T_STRING,
      [C_ONLY_DECORATED]: false,
      postProcess: (src, dst, serializer) => {
        if (src && src.metaType === METATYPE_PROPERTY && has(dst, 'cardinality')) {
          const cardinality = dst['cardinality'];
          delete dst['cardinality'];
          // TODO handle value corretly minItem/maxItem when item!
          if (cardinality === 0) {

          } else {
            //delete dst['cardinality'];
          }
        }
      }
    });
    this.data = this.getOrCreateSchemaDefinitions();
  }


  uri(): string {
    return `http://json-schema.org/${DRAFT_07}/schema`;
  }


  private isCurrentClass(x: string) {
    return snakeCase(this.current) === snakeCase(x);
  }


  serialize(klass: IClassRef | IEntityRef | Function | object): IJsonSchema7 {
    if (isFunction(klass)) {
      this.current = ClassUtils.getClassName(klass);
      this.describeClass(klass);
    } else if (isClassRef(klass)) {
      this.current = klass.name;
      this.describeClassRef(klass);
    } else if (isEntityRef(klass)) {
      this.current = klass.name;
      this.describeEntityRef(klass);
    } else {
      throw new NotSupportedError('class or function can\'t be used');
    }
    return this.getJsonSchema();
  }


  getJsonSchema() {
    return this.data;
  }


  private getOrCreateSchemaDefinitions(schema?: IJsonSchema7) {
    if (!schema) {
      schema = {
        $schema: this.uri() + '#',
        definitions: {}
      };
    } else if (schema && !schema.definitions) {
      schema.definitions = {};
    }
    return schema;
  }


  private getOrCreateRoot(entityName: string, klass: Function | IClassRef | IEntityRef) {
    if (this.data.definitions[entityName]) {
      // definition is present and
      this.applyRef(entityName);
      return null;
    }

    const className = getClassName(klass);
    const appendTarget = this.isAppendTargetSet();
    const root: IJsonSchema7Definition = this.data.definitions[entityName] = {
      title: className ? className : entityName,
      type: T_OBJECT,
    };
    if (isEntityRef(klass)) {
      // when an entity mark with $id!
      root.$id = '#' + klass.name;
    } else if (isClassRef(klass) && klass.hasEntityRef()) {
      root.$id = '#' + klass.getEntityRef().name;
    }

    if ((isEntityRef(klass) || isClassRef(klass))) {
      if (get(this.options, 'appendNamespace', false)) {
        set(root, '$' + METATYPE_NAMESPACE, klass.getRegistry().getLookupRegistry().getNamespace());
      }
      const data = klass.getOptions();
      this.appendAdditionalOptions(root, data);
    }

    if (appendTarget) {
      root.$target = SchemaUtils.getFunction(klass);
    }

    this.applyRef(entityName);
    if (this.options.postProcess) {
      this.options.postProcess(klass, root, this);
    }
    return root;
  }


  applyRef(className: string) {
    if (!this.data.$ref && !this.data.anyOf) {
      this.data.$ref = '#/definitions/' + className;
    } else if (this.data.$ref && !this.data.anyOf) {
      if (this.isCurrentClass(className)) {
        this.data.anyOf = [
          {$ref: this.data.$ref},
          {$ref: '#/definitions/' + className}
        ];
        delete this.data['$ref'];
      }
    } else if (!this.data.$ref && this.data.anyOf) {
      if (this.isCurrentClass(className)) {
        this.data.anyOf.push({$ref: '#/definitions/' + className});
      }
    }

    if (this.data.anyOf) {
      this.data.anyOf = uniqBy(this.data.anyOf, x => JSON.stringify(x));
    }
  }


  describeEntityRef(klass: IEntityRef): IJsonSchema7 {
    return this.describeRef(klass);
  }


  describeClassRef(klass: IClassRef): IJsonSchema7 {
    return this.describeRef(klass);
  }


  private describeRef(klass: IEntityRef | IClassRef): IJsonSchema7 {
    const clsRef = isEntityRef(klass) ? klass.getClassRef() : klass;
    const className = isEntityRef(klass) ? klass.name : clsRef.name;

    const root = this.getOrCreateRoot(className, klass);
    if (!root) {
      return null;
    }

    const rootProps = this.describePropertiesForRef(clsRef);
    this.appendProperties(root, rootProps);

    const proto = clsRef.getExtend();
    if (proto) {
      this.describeInheritedClass(root, proto);
    }
    return root;
  }


  describeInheritedClass(root: IJsonSchema7, proto: IClassRef) {
    const inheritedClassName = proto.name;
    root.allOf = [{$ref: '#/definitions/' + inheritedClassName}];
    if (!this.data.definitions[inheritedClassName]) {
      const inheritedClass = this.getOrCreateRoot(inheritedClassName, proto);
      const props = this.describePropertiesForRef(proto);
      this.appendProperties(inheritedClass, props);
    }
  }


  describeClass(klass: Function): IJsonSchema7 {
    const className = ClassUtils.getClassName(klass);

    const root = this.getOrCreateRoot(className, klass);
    if (!root) {
      return null;
    }

    const rootProps = this.describePropertiesForFunction(klass);
    this.appendProperties(root, rootProps);
    const proto = SchemaUtils.getInherited(klass);
    if (proto) {
      const inheritedClassName = ClassUtils.getClassName(proto);
      root.allOf = [{$ref: '#/definitions/' + inheritedClassName}];
      if (this.data && !this.data.definitions[inheritedClassName]) {
        const inheritedClass = this.getOrCreateRoot(inheritedClassName, proto);
        const props = this.describePropertiesForFunction(proto);
        this.appendProperties(inheritedClass, props);
      }
    }
    return root;
  }

  appendProperties(data: any, properties: { [k: string]: IJsonSchema7Definition }) {
    data.properties = {};
    for (const k of keys(properties)) {
      const p = properties[k];
      if (p[K_PATTERN_PROPERTY]) {
        if (!data.patternProperties) {
          data.patternProperties = {};
        }
        data.patternProperties[k] = p;
      } else {
        data.properties[k] = p;
      }
      delete p[K_PATTERN_PROPERTY];
    }
  }


  describePropertiesForFunction(klass: Function) {
    const properties: { [k: string]: IJsonSchema7Definition } = {};
    let _properties: (string | symbol)[] = [];
    let instance = null;
    try {
      instance = Reflect.construct(klass, []);
      _properties = Reflect.ownKeys(instance);
    } catch (e) {
    }

    for (const p of _properties) {
      if (isString(p)) {
        if (!get(this.options, C_ONLY_DECORATED, false) && this.allowed(p, klass)) {
          const result = this.describePropertyForFunction(klass, p, instance);
          properties[p] = result;
        }
      }
    }
    return properties;
  }


  describePropertiesForRef(klass: IClassRef) {
    const properties: { [k: string]: IJsonSchema7Definition } = {};
    for (const prop of klass.getPropertyRefs()) {
      if (this.allowed(prop)) {
        const result = this.describePropertyForRef(klass, prop);
        if (result) {
          properties[prop.name] = result;
        }
      }
    }

    const instance = klass.create<object>(false);
    // TODO own key
    const _properties = Reflect.ownKeys(instance);
    for (const p of _properties) {
      if (isString(p) && !has(properties, p)) {
        if (!get(this.options, C_ONLY_DECORATED, false)) {
          const result = this.describePropertyForFunction(klass, p, instance);
          if (result) {
            properties[p] = result;
          }
        }
      } else if (isString(p) && has(properties, p)) {
        const value = instance[p];
        if (!isNull(value) || !isUndefined(value)) {
          // add default value if exists
          (properties[p] as any).default = SchemaUtils.normValue(value);
        }
      }
    }
    return properties;
  }


  isAppendTargetSet() {
    return get(this.options, 'appendTarget', false);
  }


  describePropertyForFunction(klass: Function | IClassRef, propertyName: string, instance?: any): IJsonSchema7Definition {
    const clazz = isClassRef(klass) ? klass.getClass() : klass;
    const propMeta: IJsonSchema7Definition = {};

    // check if property is object
    let value = instance ? instance[propertyName] : undefined;
    let typeHint: any = typeof value;
    const reflectMetadataType = getReflectedType(clazz, propertyName);
    if (this.options.typeHint && isFunction(this.options.typeHint)) {
      typeHint = this.options.typeHint(klass, propertyName, instance, value);
    } else {
      if (typeHint === T_OBJECT) {
        if (reflectMetadataType && reflectMetadataType !== T_OBJECT) {
          typeHint = reflectMetadataType;
        } else {
          if (value === null || value === undefined) {
            typeHint = this.getDefaultTypeHint();
          } else if (value === false || value === true) {
            typeHint = T_BOOLEAN;
          } else {
            typeHint = Reflect.getPrototypeOf(value)?.constructor;
            if (typeHint && typeHint.name) {
              if (typeHint.name === Object.name) {
                typeHint = T_OBJECT;
              } else if (typeHint.name === Array.name) {
                typeHint = T_ARRAY;
              }
            } else {
              typeHint = this.getDefaultTypeHint();
            }
          }
        }
      }
    }

    let target = null;
    if (typeHint) {
      if (isString(typeHint)) {
        propMeta.type = typeHint as IJsonSchema7TypeName;
        if (propMeta.type === T_ARRAY) {
          setDefaultArray(propMeta);
        }
      } else if (isFunction(typeHint)) {
        if (typeHint === Date) {
          // propMeta.type = 'date' as any;
          propMeta.type = T_STRING;
          propMeta.format = 'date-time';
        } else {
          const name = ClassUtils.getClassName(typeHint);
          if (name === '' || name === Function.name) {
            // Function passing the parameter type
            // propMeta.$target = typeHint();
            target = typeHint();
          } else {
            // propMeta.$target = typeHint as Function;
            target = typeHint as Function;
          }

          // maybe follow the object here
          if (target.name === Array.name) {
            setDefaultArray(propMeta);
          } else {
            propMeta.type = T_OBJECT;
          }
        }
      }
    }


    if (!propMeta.type || (isString(propMeta.type) && isEmpty(propMeta.type))) {
      if (reflectMetadataType) {
        const className = ClassUtils.getClassName(reflectMetadataType);
        if (JSON_SCHEMA_7_TYPES.includes(className.toLowerCase() as any)) {
          propMeta.type = className.toLowerCase() as IJsonSchema7TypeName;
        } else if (className === Array.name) {
          setDefaultArray(propMeta);
        } else {
          propMeta.type = T_OBJECT;
          target = reflectMetadataType;
        }
      } else {
        // not reflection data
        propMeta.type = this.getDefaultTypeHint();
      }
    }

    if (target) {
      if (this.isAppendTargetSet()) {
        propMeta.$target = target;
      }

      const className = ClassUtils.getClassName(target);
      let ref = '#/definitions/' + className;
      if (propMeta.type === T_ARRAY) {
        propMeta.items = {
          $ref: ref
        };
      } else {
        propMeta['$ref'] = ref;
        delete propMeta['type'];
      }
      if (this.data && !this.data.definitions[className]) {
        this.describeClass(target);
      }
    }

    if (!(isUndefined(value) || isNull(value))) {
      propMeta.default = SchemaUtils.normValue(value);
    }

    this.propertyPostproces(propMeta);
    const data = MetadataRegistry.$().find(METATYPE_PROPERTY, (x: any) => x.target === clazz && x.propertyName === propertyName);
    this.appendAdditionalOptions(propMeta, data);
    return propMeta;
  }


  appendAdditionalOptions(propMeta: any, data: IEntityOptions | IPropertyOptions) {
    if (data && keys(data).length > 0) {
      const metaType = data.metaType;
      if (metaType === METATYPE_PROPERTY) {
        if (isClassRef(data.type) || isEntityRef(data.type)) {
          // if reference ignore adding
          if (get(this.options, 'deleteReferenceKeys', true)) {
            return;
          }
        }
      }

      const _keys = keys(data);
      for (const k of _keys) {
        if (this.options.keysToSkip.includes(k)) {
          continue;
        }
        if (!propMeta[k] || get(this.options, 'allowKeyOverride', false)) {
          propMeta[k] = data[k];
        }
      }
    }
  }


  /**
   * General handle to check allow options method
   *
   * @param entry
   */
  allowed(entry: IPropertyRef | string, klass?: any) {
    if (this.options && this.options.allowedProperty && isFunction(this.options.allowedProperty)) {
      return this.options.allowedProperty(entry, klass);
    }
    return true;
  }


  describePropertyForRef(klass: IClassRef, property: IPropertyRef): IJsonSchema7Definition {
    const propMeta: IJsonSchema7Definition = {};
    if (property.isCollection()) {
      setDefaultArray(propMeta);
      if (property.isReference()) {
        this.describeTargetRef(property, propMeta, 'collection');
      } else {
        const normedType = this.getNormedType(property);
        propMeta.items = {
          type: normedType as any
        };
        this.propertyPostproces(propMeta.items);
      }
    } else {
      propMeta.type = T_OBJECT;
      if (property.isReference()) {
        this.describeTargetRef(property, propMeta, 'single');
      } else {
        const normedType = this.getNormedType(property);
        propMeta.type = normedType as any;
        this.propertyPostproces(propMeta);
      }
    }

    const data = property.getOptions();
    this.appendAdditionalOptions(propMeta, data);
    // pass data pattern property for later correct selection
    if (data[K_PATTERN_PROPERTY]) {
      (propMeta as any)[K_PATTERN_PROPERTY] = true;
    }
    if (this.options.postProcess) {
      this.options.postProcess(property, propMeta, this);
    }
    return propMeta;
  }


  describeTargetRef(property: IPropertyRef, propMeta: any, mode: 'collection' | 'single') {
    let targetRef: any = property.getTargetRef();
    if (get(this.options, 'deleteReferenceKeys', true)) {
      keys(propMeta).map(k => delete propMeta[k]);
    } else {
      this.options.keysToSkip.map(x => delete propMeta[x]);
    }

    if (targetRef.hasEntityRef()) {
      targetRef = targetRef.getEntityRef();
      if (mode === 'collection') {
        propMeta.type = T_ARRAY;
        propMeta.items = {$ref: '#/definitions/' + targetRef.name};
      } else {
        propMeta.$ref = '#/definitions/' + targetRef.name;
      }
      if (this.data && !this.data.definitions[targetRef.name]) {
        this.describeEntityRef(targetRef);
      }
    } else {
      if (mode === 'collection') {
        propMeta.type = T_ARRAY;
        propMeta.items = {$ref: '#/definitions/' + targetRef.name};
      } else {
        propMeta.$ref = '#/definitions/' + targetRef.name;
      }
      if (this.data && !this.data.definitions[targetRef.name]) {
        this.describeClassRef(targetRef);
      }
    }
  }

  propertyPostproces(opt: IJsonSchema7) {
    if ((opt.type as any) === 'date') {
      opt.type = T_STRING;
      opt.format = 'date-time';
    }
  }


  getNormedType(property: IPropertyRef) {
    let retType = null;
    const type = property.getType();
    if (this.options.typeConversion) {
      retType = this.options.typeConversion(type, property);
    }

    if (!retType) {
      retType = isFunction(type) ? type.name.toLowerCase() : type;
    }

    return retType;
  }


  getDefaultTypeHint() {
    return this.options && this.options.defaultTypeHint ? this.options.defaultTypeHint as any : T_STRING;
  }

}
