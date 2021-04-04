// import {JSONSchema7, JSONSchema7Definition} from 'json-schema';
import {ClassUtils} from '@allgemein/base/browser';
import * as _ from 'lodash';
import {IJsonSchema7, IJsonSchema7Definition, IJsonSchema7TypeName, JSON_SCHEMA_7_TYPES} from '../metadata/JsonSchema7';
import {REFLECT_DESIGN_TYPE} from '../Constants';
import {IClassRef, isClassRef} from '../../api/IClassRef';
import {IEntityRef, isEntityRef} from '../../api/IEntityRef';
import {SchemaUtils} from '../SchemaUtils';
import {IPropertyRef} from '../../api/IPropertyRef';

export interface IJsonSchemaOptions {
  /**
   * If multiple schemas
   */
  handleMultipleSchemas?: 'reference' | 'clone';


  /**
   * handles
   */
}

export class JsonSchemaSerializer {

  options: IJsonSchemaOptions = {};

  static hooks: { [hook: string]: any[] };

  constructor() {
  }


  serialize(klass: IClassRef | IEntityRef | Function | object, options?: IJsonSchemaOptions) {
    this.options = options;
    if (_.isFunction(klass)) {
      return this.describeClass(klass);
    } else if (isClassRef(klass)) {
      return this.describeClassRef(klass);
    } else if (isEntityRef(klass)) {
    } else if (_.isObjectLike(klass)) {
    }
    return null;

  }

  private static getJsonSchemaEnvelope(schema?: IJsonSchema7, className?: string) {
    if (className) {
      schema = schema ? schema : {
        $schema: 'http://json-schema.org/draft-07/schema#',
        $ref: '#/definitions/' + className,
        definitions: {}
      };
    } else {
      schema = schema ? schema : {
        $schema: 'http://json-schema.org/draft-07/schema#',
        definitions: {}
      };
    }
    return schema;
  }

  describeClassRef(klass: IClassRef, schema?: IJsonSchema7): IJsonSchema7 {
    const className = klass.name;
    schema = JsonSchemaSerializer.getJsonSchemaEnvelope(schema, klass.name);

    const root: IJsonSchema7Definition = schema.definitions[className] = {
      type: 'object',
      $target: klass
    };

    klass.getOptions();
    const rootProps = this.describePropertiesForRef(klass);
    root.properties = rootProps;

    const proto = klass.getExtend();
    if (proto) {
      const inheritedClassName = proto.name;
      root.allOf = [{$ref: '#/definitions/' + inheritedClassName}];
      if (!schema.definitions[inheritedClassName]) {
        const inheritedClass: IJsonSchema7Definition = schema.definitions[inheritedClassName] = {
          type: 'object',
          $target: proto
        };
        const props = this.describePropertiesForRef(proto, schema);
        inheritedClass.properties = props;
      }
    }
    return schema;
  }


   describeClass(klass: Function, schema?: IJsonSchema7): IJsonSchema7 {
    const className = ClassUtils.getClassName(klass);
    schema = JsonSchemaSerializer.getJsonSchemaEnvelope(schema, className);

    const root: IJsonSchema7Definition = schema.definitions[className] = {
      type: 'object',
      $target: klass
    };
    const rootProps = this.describePropertiesForFunction(klass);
    root.properties = rootProps;

    const proto = SchemaUtils.getInherited(klass);
    if (proto) {
      const inheritedClassName = ClassUtils.getClassName(proto);
      root.allOf = [{$ref: '#/definitions/' + inheritedClassName}];
      if (!schema.definitions[inheritedClassName]) {
        const inheritedClass: IJsonSchema7Definition = schema.definitions[inheritedClassName] = {
          type: 'object',
          $target: proto
        };
        const props = this.describePropertiesForFunction(proto, schema);
        inheritedClass.properties = props;
      }
    }
    return schema;
  }


  describePropertiesForFunction(klass: Function, schema?: IJsonSchema7) {
    const properties: { [k: string]: IJsonSchema7Definition } = {};

    const instance = Reflect.construct(klass, []);
    const _properties = Reflect.ownKeys(instance);
    for (const p of _properties) {
      if (_.isString(p)) {
        const result = this.describePropertyForFunction(klass, p, instance, schema);
        properties[p] = result;
      }
    }
    return properties;
  }

  describePropertiesForRef(klass: IClassRef, schema?: IJsonSchema7) {
    const properties: { [k: string]: IJsonSchema7Definition } = {};

    for (const prop of klass.getPropertyRefs()) {
      const result = this.describePropertyForRef(klass, prop, schema);
      properties[prop.name] = result;
    }

    const instance = klass.create<object>(false);
    // TODO own key
    const _properties = Reflect.ownKeys(instance);
    for (const p of _properties) {
      if (_.isString(p) && !_.has(properties, p)) {
        const result = this.describePropertyForFunction(klass, p, instance, schema);
        properties[p] = result;
      }
    }
    return properties;
  }


  describePropertyForFunction(klass: Function | IClassRef, propertyName: string, instance?: any, schema?: IJsonSchema7): IJsonSchema7Definition {
    const clazz = isClassRef(klass) ? klass.getClass() : klass;
    const propMeta: IJsonSchema7Definition = {};

    // check if property is object
    let typeHint: any = typeof instance[propertyName];
    if (typeHint === 'object') {
      typeHint = Reflect.getPrototypeOf(instance[propertyName])?.constructor;
      if (typeHint.name === Object.name) {
        typeHint = 'object';
      } else if (typeHint.name === Array.name) {
        typeHint = 'array';
      }
    }

    if (typeHint) {

      if (_.isString(typeHint)) {
        propMeta.type = typeHint as IJsonSchema7TypeName;
      } else if (_.isFunction(typeHint)) {
        if (typeHint === Date) {
          propMeta.type = 'date' as any;
          // propMeta.type = 'string';
          // propMeta.format = 'date-time';
        } else {
          const name = ClassUtils.getClassName(typeHint);
          if (name === '' || name === Function.name) {
            // Function passing the parameter type
            propMeta.$target = typeHint();
          } else {
            propMeta.$target = typeHint as Function;
          }

          // maybe follow the object here
          if (propMeta.$target.name === Array.name) {
            propMeta.type = 'array';
            propMeta.items = {
              type: 'object'
            };

          } else {
            propMeta.type = 'object';
          }

        }
      }

    }


    if (!propMeta.type || (_.isString(propMeta.type) && _.isEmpty(propMeta.type))) {
      const reflectMetadataType = Reflect && Reflect.getMetadata ?
        Reflect.getMetadata(REFLECT_DESIGN_TYPE, clazz, propertyName) : undefined;

      if (reflectMetadataType) {
        const className = ClassUtils.getClassName(reflectMetadataType);
        if (JSON_SCHEMA_7_TYPES.includes(className.toLowerCase() as any)) {
          propMeta.type = className.toLowerCase() as IJsonSchema7TypeName;
        } else if (className === Array.name) {
          propMeta.type = 'array';
          propMeta.items = {
            type: 'object'
          };
        } else {
          propMeta.type = 'object';
          propMeta.$target = reflectMetadataType;
        }
      } else {
        // not reflection data
        propMeta.type = 'string';
      }
    }

    if (propMeta.$target) {
      const className = ClassUtils.getClassName(propMeta.$target as Function);
      let ref = '#/definitions/' + className;
      if (propMeta.type === 'array') {
        propMeta.items = {
          $ref: ref
        };
      } else {
        propMeta['$ref'] = ref;
      }
      if (schema && !schema.definitions[className]) {
        this.describeClass(propMeta.$target as Function, schema);
      }
    }

    this.propertyPostproces(propMeta);

    return propMeta;
  }


  describePropertyForRef(klass: IClassRef, property: IPropertyRef, schema?: IJsonSchema7): IJsonSchema7Definition {
    const propMeta: IJsonSchema7Definition = {};

    if (property.isCollection()) {
      propMeta.type = 'array';
      if (property.isReference()) {
        const targetRef = property.getTargetRef();
        propMeta.items = {$ref: '#/definitions/' + targetRef.name};
        if (schema && !schema.definitions[targetRef.name]) {
          this.describeClassRef(targetRef, schema);
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
        if (schema && !schema.definitions[targetRef.name]) {
          this.describeClassRef(targetRef, schema);
        }
      } else {
        propMeta.type = property.getType() as any;
        this.propertyPostproces(propMeta);
      }
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
