/**
 * Handler for metadata
 */
import {
  assign,
  defaults,
  isArray,
  isEmpty,
  isFunction,
  isObjectLike,
  isString,
  keys,
  merge,
  remove,
  snakeCase,
  uniq
} from 'lodash';

import {
  C_EVENT_ADD,
  C_EVENT_REMOVE,
  C_EVENT_UPDATE,
  METADATA_TYPE,
  METATYPE_CLASS_REF,
  METATYPE_ENTITY,
  METATYPE_PROPERTY,
  METATYPE_SCHEMA
} from './../Constants';
import {IPropertyOptions} from './../options/IPropertyOptions';
import {IEntityRef, isEntityRef} from '../../api/IEntityRef';
import {IClassRef, isClassRef} from '../../api/IClassRef';
import {IPropertyRef} from '../../api/IPropertyRef';
import {MetadataRegistry} from './MetadataRegistry';
import {DefaultPropertyRef} from './DefaultPropertyRef';
import {ClassRef} from '../ClassRef';
import {IEntityOptions} from '../options/IEntityOptions';
import {DefaultEntityRef} from './DefaultEntityRef';
import {hasClassPropertiesInDefinition, IJsonSchema7} from '../json-schema/JsonSchema7';
import {ISchemaOptions} from '../options/ISchemaOptions';
import {IObjectOptions} from '../options/IObjectOptions';
import {ClassUtils, NotSupportedError} from '@allgemein/base/browser';
import {JsonSchema} from '../json-schema/JsonSchema';
import {ISchemaRef} from '../../api/ISchemaRef';
import {SchemaRef} from '../SchemaRef';
import {AbstractRegistry} from './AbstractRegistry';


/**
 * Registry for metadata of classes and there properties
 */
export class DefaultNamespacedRegistry extends AbstractRegistry {


  /**
   * Initialize events for metadata changes on runtime
   */
  prepare() {
    MetadataRegistry.$().on(C_EVENT_ADD, this.onAdd.bind(this));
    MetadataRegistry.$().on(C_EVENT_REMOVE, this.onRemove.bind(this));
    MetadataRegistry.$().on(C_EVENT_UPDATE, this.onUpdate.bind(this));
  }

  /**
   * react on dynamically added context
   *
   * @param context
   * @param entries
   */
  onAdd(context: METADATA_TYPE,
        options: IEntityOptions | IPropertyOptions | ISchemaOptions | IObjectOptions) {
    if (context === METATYPE_PROPERTY) {
      const find = this.find(context, (c: IPropertyRef) => c.getClassRef().getClass() === options.target && c.name === options.name);
      if (find) {
        // update
      } else {
        this.create(context, options);
      }
    } else if (context === METATYPE_ENTITY) {
      const find = this.find(context, (c: IEntityRef) => c.getClassRef().getClass() === options.target);
      if (!find) {
        this.create(context, options);
      }
    } else if (context === METATYPE_SCHEMA) {
      let find: ISchemaRef = this
        .find(context,
          (c: ISchemaRef) => c.name === (<ISchemaOptions>options).name
        );
      if (!find) {
        find = this.create(context, options);
      }

      let entityRef: IEntityRef = this
        .find(METATYPE_ENTITY,
          (c: IEntityRef) => c.getClass() === options.target
        );


      if (entityRef) {
        this.addSchemaToEntityRef(find, entityRef);
      }

    }
  }


  addSchemaToEntityRef(schemaRef: string | ISchemaRef, entityRef: IEntityRef) {
    const name = isString(schemaRef) ? schemaRef : schemaRef.name;
    let entry = entityRef.getOptions('schema');
    if (entry) {
      if (isArray(entry)) {
        entry.push(name);
      } else {
        entry = [entry, name];
      }
    } else {
      entry = [name];
    }
    entityRef.setOption('schema', uniq(entry));
  }


  /**
   * react on dynamically removed context
   *
   * @param context
   * @param entries
   */
  onRemove(context: METADATA_TYPE, entries: (IEntityOptions | IPropertyOptions | ISchemaOptions | IObjectOptions)[]) {

    if (context === METATYPE_ENTITY || context === METATYPE_CLASS_REF) {
      const targets = entries.map(x => x.target);
      this.getLookupRegistry().remove('class_ref', (x: any) => targets.includes(x.target));
      this.getLookupRegistry().remove('entity', (x: any) => targets.includes(x.target));
      this.getLookupRegistry().remove('property', (x: any) => targets.includes(x.target));
    } else if (context === METATYPE_PROPERTY) {
      const targets = entries.map(x => [x.target, x.propertyName]);
      this.getLookupRegistry().remove(context, (x: any) => targets.includes([x.target, x.name]));
    } else if (context === METATYPE_SCHEMA) {
      // TODO remove schema ref
      // TODO remove schema options entries
    }
  }


  /**
   * react on dynamically update context
   *
   * @param context
   * @param entries
   */
  onUpdate() {
  }


  /**
   * Return all registered schema references
   *
   * @param ref
   * @return ISchemaRef[]
   */
  getSchemaRefs(filter?: (x: ISchemaRef) => boolean): ISchemaRef[] {
    return this.filter(METATYPE_SCHEMA, filter);
  }

  /**
   * Return schema references for an given entity or class reference
   *
   * @param ref
   * @return ISchemaRef[]
   */
  getSchemaRefsFor(ref: IEntityRef | IClassRef): ISchemaRef[] {
    let lookup = [];
    if (isEntityRef(ref) || isClassRef(ref)) {
      const schemas = ref.getOptions('schema');
      for (const schema of schemas) {
        let schemaRef = this.find(METATYPE_SCHEMA, (x: ISchemaRef) => x.name === schema);
        if (!schemaRef) {
          schemaRef = this.create(METATYPE_SCHEMA, {name: schema, target: ref.getClass()});
        }
        lookup.push(schemaRef);
      }
      lookup = this.getSchemaRefs((x: ISchemaRef) => schemas.includes(x.name));
    } else {
      throw new NotSupportedError('passed value is not supported');
    }
    return lookup ? uniq(lookup) : null;
  }

  /**
   * TODO
   *
   * @param filter
   */
  getEntities(filter?: (x: IEntityRef) => boolean): IEntityRef[] {
    return this.getLookupRegistry().filter(METATYPE_ENTITY, filter);
  }

  /**
   * Can get get entity ref for function.
   *
   * @param fn
   */
  getEntityRefFor(fn: string | object | Function): IEntityRef {
    let lookup = <string | Function>fn;
    if (!isFunction(fn) && !isString(fn) && isObjectLike(fn)) {
      lookup = ClassUtils.getFunction(fn as any);
    }
    const clsRef = ClassRef.get(lookup, this.namespace);
    let lookupFn = (x: IEntityRef) => x.getClassRef() === clsRef;
    const entityRefExists = this.find<IEntityRef>(METATYPE_ENTITY, lookupFn);
    if (entityRefExists) {
      return entityRefExists;
    }
    return this.createEntityForRef(clsRef);
  }


  /**
   * Returns property by name for a given class or entity ref
   *
   * @param filter
   */
  getPropertyRef(ref: IClassRef | IEntityRef, name: string): IPropertyRef {
    return this.getPropertyRefs(ref).find(x => snakeCase(x.name) === snakeCase(name));
  }


  /**
   * Returns all properties for given class or entity ref
   *
   * @param ref
   */
  getPropertyRefs(ref: IClassRef | IEntityRef): IPropertyRef[] {
    const clsRef: IClassRef = isEntityRef(ref) ? ref.getClassRef() : ref;
    // Return existing
    const clsRefExists = this.find(METATYPE_CLASS_REF, (x: IClassRef) => x === clsRef);
    let properties: IPropertyRef[] = [];
    if (clsRefExists) {
      properties = this.filter(METATYPE_PROPERTY, (x: IPropertyRef) => x.getClassRef() === clsRefExists);
    } else {
      properties = this.createPropertiesForRef(clsRef);
    }
    return properties;
  }

  /**
   * Create properties for class or entity ref.
   */
  createPropertiesForRef(clsRef: IClassRef): DefaultPropertyRef[] {
    const cls = clsRef.getClass(true);
    const jsonSchema = JsonSchema.serialize(cls, {appendTarget: true});
    const propOptions: IPropertyOptions[] = [];
    const metaPropOptions = MetadataRegistry.$().getByContextAndTarget(METATYPE_PROPERTY, cls) as IPropertyOptions[];
    if (hasClassPropertiesInDefinition(clsRef.name, jsonSchema)) {
      const properties = (jsonSchema.definitions[clsRef.name] as IJsonSchema7).properties;
      for (const k of keys(properties)) {
        const property: IJsonSchema7 = properties[k] as IJsonSchema7;
        const opts: IPropertyOptions = {
          metaType: METATYPE_PROPERTY,
          namespace: this.namespace,
          type: property.$target ? property.$target : property.type,
          propertyName: k,
          target: cls
        };

        const propMetadata = remove(metaPropOptions, x => x.propertyName === k);
        if (!isEmpty(propMetadata)) {
          for (const p of propMetadata) {
            assign(opts, p);
          }
        }
        propOptions.push(opts);
      }
    }

    const propertyOptions = propOptions.concat(metaPropOptions);
    return propertyOptions.map(opts => this.createPropertyForOptions(opts));
  }


  /**
   * Create default property reference
   *
   * @param options
   */
  createPropertyForOptions(options: IPropertyOptions): DefaultPropertyRef {
    if (keys(options).length === 0) {
      throw new Error('cant create property for emtpy options');
    }
    options.namespace = this.namespace;
    const prop = new DefaultPropertyRef(options);
    return this.add(prop.metaType, prop);
  }


  /**
   * Create default entity reference
   *
   * @param options
   */
  createEntityForOptions(options: IEntityOptions): DefaultEntityRef {
    options.namespace = this.namespace;
    const entityRef = new DefaultEntityRef(options);
    return this.add(entityRef.metaType, entityRef);
  }

  /**
   * Create default schema reference
   *
   * @param options
   */
  createSchemaForOptions(options: ISchemaOptions): SchemaRef {
    options.namespace = this.namespace;
    const schemaRef = new SchemaRef(options);
    return this.add(schemaRef.metaType, schemaRef);
  }

  /**
   * Create default entity reference for passed reference. The options are taken from metadata registry.
   * Also the schema is looked up.
   *
   * @param options
   */
  createEntityForRef(ref: IClassRef | IEntityRef): DefaultEntityRef {
    const metaEntityOptions = MetadataRegistry.$().getByContextAndTarget(METATYPE_ENTITY, ref.getClass()) as IEntityOptions[];
    let metaEntityOption: IEntityOptions = {};
    if (metaEntityOptions.length > 1) {
      metaEntityOption = merge(metaEntityOption, ...metaEntityOptions);
    } else if (metaEntityOptions.length === 1) {
      metaEntityOption = metaEntityOptions.shift();
    }
    defaults(metaEntityOption, {
      target: ref.getClass(),
      name: ref.getClass().name
    });
    const entityRef = this.createEntityForOptions(metaEntityOption);
    const metaSchemaOptionsForEntity = MetadataRegistry.$()
      .getByContextAndTarget(METATYPE_SCHEMA, ref.getClass()) as ISchemaOptions[];
    if (metaSchemaOptionsForEntity.length > 0) {
      for (const schemaOptions of metaSchemaOptionsForEntity) {
        this.addSchemaToEntityRef(schemaOptions.name, entityRef);
      }
    }
    return entityRef;
  }


  getPropertyRefsFor(fn: string | object | Function): IPropertyRef[] {
    const clsName = ClassRef.getClassName(fn);
    const clsRef = ClassRef.get(clsName, this.namespace);
    return this.getPropertyRefs(clsRef);
  }


  create<T>(context: string, options: any): T {
    switch (context as METADATA_TYPE) {
      case METATYPE_CLASS_REF:
        break;
      case METATYPE_ENTITY:
        if (isClassRef(options)) {
          return <any>this.createEntityForRef(options);
        } else {
          return <any>this.createEntityForOptions(options);
        }
      case METATYPE_PROPERTY:
        return <any>this.createPropertyForOptions(options);
      case METATYPE_SCHEMA:
        return <any>this.createSchemaForOptions(options);
    }

    return null;
  }

  /**
   * TODO
   */
  add<T>(context: string, entry: T): T {
    if (context === METATYPE_CLASS_REF) {
      return this.addClassRef(entry as any) as any;
    }
    return this.getLookupRegistry().add(context, entry);
  }

  /**
   * Create default entity reference
   *
   * @param options
   */
  addClassRef(ref: IClassRef): IClassRef {
    const addedClassRef = this.getLookupRegistry().add(METATYPE_CLASS_REF, ref);
    this.createPropertiesForRef(addedClassRef);
    return addedClassRef;
  }


}
