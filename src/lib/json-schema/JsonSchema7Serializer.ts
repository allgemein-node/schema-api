import {assign, get, has, isEmpty, isFunction, isNull, isString, isUndefined, keys, uniqBy} from 'lodash';
import {ClassUtils, NotSupportedError} from '@allgemein/base/browser';
import {IJsonSchema7, IJsonSchema7Definition, IJsonSchema7TypeName, JSON_SCHEMA_7_TYPES} from './JsonSchema7';
import {METATYPE_PROPERTY, REFLECT_DESIGN_TYPE} from '../Constants';
import {IClassRef, isClassRef} from '../../api/IClassRef';
import {SchemaUtils} from '../SchemaUtils';
import {IPropertyRef} from '../../api/IPropertyRef';
import {IJsonSchemaSerializer} from './IJsonSchemaSerializer';
import {IEntityRef, isEntityRef} from '../../api/IEntityRef';
import {IJsonSchemaSerializeOptions} from './IJsonSchemaSerializeOptions';
import {DRAFT_07} from './Constants';
import {MetadataRegistry} from '../registry/MetadataRegistry';


export class JsonSchema7Serializer implements IJsonSchemaSerializer {

  options: IJsonSchemaSerializeOptions;

  data: IJsonSchema7;

  current: string;

  constructor(opts: IJsonSchemaSerializeOptions) {
    this.options = opts;
    this.data = this.getOrCreateSchemaDefinitions();
  }


  uri(): string {
    return `http://json-schema.org/${DRAFT_07}/schema`;
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


  private getOrCreateRoot(className: string, klass: Function | IClassRef | IEntityRef) {
    if (this.data.definitions[className]) {
      // definition is present and
      this.applyRef(className);
      return null;
    }

    const appendTarget = this.isAppendTargetSet();
    const root: IJsonSchema7Definition = this.data.definitions[className] = {
      title: className,
      type: 'object',
    };

    if (isEntityRef(klass) || isClassRef(klass)) {
      const data = klass.getOptions();
      this.appendAdditionalOptions(root, data);
    }

    if (appendTarget) {
      root.$target = SchemaUtils.getFunction(klass);
    }

    this.applyRef(className);

    if (this.options.postProcess) {
      this.options.postProcess(klass, root, this);
    }
    return root;
  }


  applyRef(className: string) {
    if (!this.data.$ref && !this.data.anyOf) {
      this.data.$ref = '#/definitions/' + className;
    } else if (this.data.$ref && !this.data.anyOf) {
      if (this.current === className) {
        this.data.anyOf = [
          {$ref: this.data.$ref},
          {$ref: '#/definitions/' + className}
        ];
        delete this.data['$ref'];
      }
    } else if (!this.data.$ref && this.data.anyOf) {
      if (this.current === className) {
        this.data.anyOf.push({$ref: '#/definitions/' + className});
      }
    }

    if (this.data.anyOf) {
      this.data.anyOf = uniqBy(this.data.anyOf, x => JSON.stringify(x));
    }
  }


  describeEntityRef(klass: IEntityRef): IJsonSchema7 {
    const className = klass.name;

    // schema = this.getOrCreateSchemaDefinitions(className);
    const root = this.getOrCreateRoot(className, klass);
    if (!root) {
      return null;
    }

    const rootProps = this.describePropertiesForRef(klass.getClassRef());
    root.properties = rootProps;

    const proto = klass.getClassRef().getExtend();
    if (proto) {
      this.describeInheritedClass(root, proto);
    }
    return root;
  }


  describeClassRef(klass: IClassRef): IJsonSchema7 {
    const className = klass.name;

    // schema = this.getOrCreateSchemaDefinitions(schema);
    const root = this.getOrCreateRoot(className, klass);
    if (!root) {
      return null;
    }

    const rootProps = this.describePropertiesForRef(klass);
    root.properties = rootProps;

    const proto = klass.getExtend();
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
      inheritedClass.properties = props;
    }
  }


  describeClass(klass: Function): IJsonSchema7 {
    const className = ClassUtils.getClassName(klass);

    const root = this.getOrCreateRoot(className, klass);
    if (!root) {
      return null;
    }

    const rootProps = this.describePropertiesForFunction(klass);
    root.properties = rootProps;

    const proto = SchemaUtils.getInherited(klass);
    if (proto) {
      const inheritedClassName = ClassUtils.getClassName(proto);
      root.allOf = [{$ref: '#/definitions/' + inheritedClassName}];
      if (this.data && !this.data.definitions[inheritedClassName]) {
        const inheritedClass = this.getOrCreateRoot(inheritedClassName, proto);
        const props = this.describePropertiesForFunction(proto);
        inheritedClass.properties = props;
      }
    }
    return root;
  }


  describePropertiesForFunction(klass: Function) {
    const properties: { [k: string]: IJsonSchema7Definition } = {};
    const instance = Reflect.construct(klass, []);
    const _properties = Reflect.ownKeys(instance);
    for (const p of _properties) {
      if (isString(p)) {
        const result = this.describePropertyForFunction(klass, p, instance);
        properties[p] = result;
      }
    }
    return properties;
  }


  describePropertiesForRef(klass: IClassRef) {
    const properties: { [k: string]: IJsonSchema7Definition } = {};

    for (const prop of klass.getPropertyRefs()) {
      const result = this.describePropertyForRef(klass, prop);
      properties[prop.name] = result;
    }

    const instance = klass.create<object>(false);
    // TODO own key
    const _properties = Reflect.ownKeys(instance);
    for (const p of _properties) {
      if (isString(p) && !has(properties, p)) {
        const result = this.describePropertyForFunction(klass, p, instance);
        properties[p] = result;
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
    let value = instance[propertyName];
    let typeHint: any = typeof value;
    if (typeHint === 'object') {
      typeHint = Reflect.getPrototypeOf(value)?.constructor;
      if (typeHint.name === Object.name) {
        typeHint = 'object';
      } else if (typeHint.name === Array.name) {
        typeHint = 'array';
      }
    }

    let target = null;
    if (typeHint) {

      if (isString(typeHint)) {
        propMeta.type = typeHint as IJsonSchema7TypeName;
        if (propMeta.type === 'array') {
          this.setDefaultArray(propMeta);
        }
      } else if (isFunction(typeHint)) {
        if (typeHint === Date) {
          // propMeta.type = 'date' as any;
          propMeta.type = 'string';
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
            this.setDefaultArray(propMeta);
          } else {
            propMeta.type = 'object';
          }
        }
      }
    }


    if (!propMeta.type || (isString(propMeta.type) && isEmpty(propMeta.type))) {
      const reflectMetadataType = Reflect && Reflect.getMetadata ?
        Reflect.getMetadata(REFLECT_DESIGN_TYPE, clazz, propertyName) : undefined;

      if (reflectMetadataType) {
        const className = ClassUtils.getClassName(reflectMetadataType);
        if (JSON_SCHEMA_7_TYPES.includes(className.toLowerCase() as any)) {
          propMeta.type = className.toLowerCase() as IJsonSchema7TypeName;
        } else if (className === Array.name) {
          this.setDefaultArray(propMeta);
        } else {
          propMeta.type = 'object';
          target = reflectMetadataType;
        }
      } else {
        // not reflection data
        propMeta.type = 'string';
      }
    }

    if (target) {
      if (this.isAppendTargetSet()) {
        propMeta.$target = target;
      }

      const className = ClassUtils.getClassName(target);
      let ref = '#/definitions/' + className;
      if (propMeta.type === 'array') {
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

    if (!isUndefined(value) || !isNull(value)) {
      propMeta.default = SchemaUtils.normValue(value);
    }

    this.propertyPostproces(propMeta);

    const data = MetadataRegistry.$().find(METATYPE_PROPERTY, (x: any) => x.target === clazz && x.propertyName === propertyName);
    this.appendAdditionalOptions(propMeta, data);

    return propMeta;
  }

  appendAdditionalOptions(propMeta: any, data: object) {
    if (data && keys(data).length > 0) {
      const _keys = keys(data);
      for (const k of _keys) {
        if (['type', '$ref', 'target', 'propertyName', 'metaType', 'namespace', 'name'].includes(k)) {
          continue;
        }
        if (!propMeta[k]) {
          propMeta[k] = data[k];
        }
      }
    }
  }


  setDefaultArray(schema: IJsonSchema7) {
    assign(schema, {
      type: 'array',
      items: {
        type: 'object'
      }
    });
  }


  describePropertyForRef(klass: IClassRef, property: IPropertyRef): IJsonSchema7Definition {
    const propMeta: IJsonSchema7Definition = {};

    if (property.isCollection()) {
      this.setDefaultArray(propMeta);
      if (property.isReference()) {
        const targetRef = property.getTargetRef();
        propMeta.items = {$ref: '#/definitions/' + targetRef.name};
        if (this.data && !this.data.definitions[targetRef.name]) {
          this.describeClassRef(targetRef);
        }
      } else {
        propMeta.items = {
          type: property.getType() as any
        };
        this.propertyPostproces(propMeta.items);
      }
    } else {
      propMeta.type = 'object';
      if (property.isReference()) {
        const targetRef = property.getTargetRef();
        propMeta.$ref = '#/definitions/' + targetRef.name;
        if (this.data && !this.data.definitions[targetRef.name]) {
          this.describeClassRef(targetRef);
        }
      } else {
        propMeta.type = property.getType() as any;
        this.propertyPostproces(propMeta);
      }
    }

    const data = property.getOptions();
    this.appendAdditionalOptions(propMeta, data);
    if (this.options.postProcess) {
      this.options.postProcess(property, propMeta, this);
    }
    return propMeta;
  }

  propertyPostproces(opt: IJsonSchema7) {
    if ((opt.type as any) === 'date') {
      opt.type = 'string';
      opt.format = 'date-time';
    }

  }


}
