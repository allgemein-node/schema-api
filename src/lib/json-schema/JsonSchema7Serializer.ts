import * as _ from 'lodash';
import {ClassUtils, NotSupportedError} from '@allgemein/base/browser';
import {IJsonSchema7, IJsonSchema7Definition, IJsonSchema7TypeName, JSON_SCHEMA_7_TYPES} from './JsonSchema7';
import {REFLECT_DESIGN_TYPE} from '../Constants';
import {IClassRef, isClassRef} from '../../api/IClassRef';
import {SchemaUtils} from '../SchemaUtils';
import {IPropertyRef} from '../../api/IPropertyRef';
import {IJsonSchemaSerializer} from './IJsonSchemaSerializer';
import {IEntityRef, isEntityRef} from '../../api/IEntityRef';
import {IJsonSchemaSerializeOptions} from './IJsonSchemaSerializeOptions';
import {IJsonSchemaUnserializeOptions} from './IJsonSchemaUnserializeOptions';
import {DRAFT_07} from './Constants';


export class JsonSchema7Serializer implements IJsonSchemaSerializer {

  version: string = DRAFT_07;

  options: IJsonSchemaSerializeOptions | IJsonSchemaUnserializeOptions;

  data: IJsonSchema7;

  fetched: { [k: string]: IJsonSchema7 };

  constructor(opts: IJsonSchemaSerializeOptions | IJsonSchemaUnserializeOptions) {
    this.options = opts;
  }


  uri(): string {
    return `http://json-schema.org/${DRAFT_07}/schema`;
  }


  serialize(klass: IClassRef | IEntityRef | Function | object): IJsonSchema7 {
    if (_.isFunction(klass)) {
      return this.describeClass(klass);
    } else if (isClassRef(klass)) {
      return this.describeClassRef(klass);
    } else if (isEntityRef(klass)) {
      return this.describeEntityRef(klass);
    }
    throw new NotSupportedError('class or function can\'t be used');
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


  private getOrCreateRoot(schema: IJsonSchema7, className: string, klass: Function | IClassRef | IEntityRef) {
    const appendTarget = this.isAppendTargetSet();
    const root: IJsonSchema7Definition = schema.definitions[className] = {
      title: className,
      type: 'object',
    };

    if (isEntityRef(klass) || isClassRef(klass)) {
      this.attachOptions(klass, root);
    }

    if (appendTarget) {
      if (isEntityRef(klass)) {
        root.$target = klass.getClassRef().getClass(true);
      } else if (isClassRef(klass)) {
        root.$target = klass.getClass(true);
      } else {
        root.$target = klass;
      }
    }

    if (!schema.$ref) {
      schema.$ref = '#/definitions/' + className;
    }
    return root;
  }

  attachOptions(from: IClassRef | IEntityRef | IPropertyRef, to: IJsonSchema7) {

  }

  describeEntityRef(klass: IEntityRef, schema?: IJsonSchema7): IJsonSchema7 {
    const className = klass.name;

    schema = this.getOrCreateSchemaDefinitions(schema);
    const root = this.getOrCreateRoot(schema, className, klass);

    klass.getOptions();
    const rootProps = this.describePropertiesForRef(klass.getClassRef());
    root.properties = rootProps;

    const proto = klass.getClassRef().getExtend();
    if (proto) {
      const inheritedClassName = proto.name;
      root.allOf = [{$ref: '#/definitions/' + inheritedClassName}];
      if (!schema.definitions[inheritedClassName]) {
        const inheritedClass = this.getOrCreateRoot(schema, inheritedClassName, proto);
        const props = this.describePropertiesForRef(proto, schema);
        inheritedClass.properties = props;
      }
    }
    return schema;
  }


  describeClassRef(klass: IClassRef, schema?: IJsonSchema7): IJsonSchema7 {
    const className = klass.name;

    schema = this.getOrCreateSchemaDefinitions(schema);
    const root = this.getOrCreateRoot(schema, className, klass);

    // klass.getOptions();
    const rootProps = this.describePropertiesForRef(klass);
    root.properties = rootProps;

    const proto = klass.getExtend();
    if (proto) {
      const inheritedClassName = proto.name;
      root.allOf = [{$ref: '#/definitions/' + inheritedClassName}];
      if (!schema.definitions[inheritedClassName]) {
        const inheritedClass = this.getOrCreateRoot(schema, inheritedClassName, proto);
        const props = this.describePropertiesForRef(proto, schema);
        inheritedClass.properties = props;
      }
    }
    return schema;
  }


  describeClass(klass: Function, schema?: IJsonSchema7): IJsonSchema7 {
    const className = ClassUtils.getClassName(klass);

    schema = this.getOrCreateSchemaDefinitions(schema);
    const root = this.getOrCreateRoot(schema, className, klass);
    const rootProps = this.describePropertiesForFunction(klass, schema);
    root.properties = rootProps;

    const proto = SchemaUtils.getInherited(klass);
    if (proto) {
      const inheritedClassName = ClassUtils.getClassName(proto);
      root.allOf = [{$ref: '#/definitions/' + inheritedClassName}];
      if (!schema.definitions[inheritedClassName]) {
        const inheritedClass = this.getOrCreateRoot(schema, inheritedClassName, proto);
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


  isAppendTargetSet() {
    return _.get(this.options, 'appendTarget', false);
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

    let target = null;
    if (typeHint) {

      if (_.isString(typeHint)) {
        propMeta.type = typeHint as IJsonSchema7TypeName;
        if (propMeta.type === 'array') {
          this.setDefaultArray(propMeta);
        }
      } else if (_.isFunction(typeHint)) {
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


    if (!propMeta.type || (_.isString(propMeta.type) && _.isEmpty(propMeta.type))) {
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
      if (schema && !schema.definitions[className]) {
        this.describeClass(target, schema);
      }
    }

    this.propertyPostproces(propMeta);

    return propMeta;
  }


  setDefaultArray(schema: IJsonSchema7) {
    _.assign(schema, {
      type: 'array',
      items: {
        type: 'object'
      }
    });
  }


  describePropertyForRef(klass: IClassRef, property: IPropertyRef, schema?: IJsonSchema7): IJsonSchema7Definition {
    const propMeta: IJsonSchema7Definition = {};

    if (property.isCollection()) {
      this.setDefaultArray(propMeta);
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
