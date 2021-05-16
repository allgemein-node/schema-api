/**
 * Handler for metadata
 */
import {
  assign,
  clone,
  cloneDeep,
  defaults,
  get,
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
  METATYPE_EMBEDDABLE,
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
import {IAbstractOptions} from '../options/IAbstractOptions';


/**
 * Registry which handles by default class, schema, embeddalbes and properties, which are not handled by a specialized registry.
 *
 * This is a space for entities and their relations, which are grouped by a give "namespace" context.
 *
 * How entities are passed to the registry:
 *
 * 1. by annotations at startup (event from metadata registry)
 *   - properties are appended first by annotation then entities follow
 * 2. by call for getEntityRefFor
 * 3. append during runtime by event fired through metadata registry
 * 4. append through reload method
 *
 */
export class DefaultNamespacedRegistry extends AbstractRegistry {

  /**
   * Initialize events for metadata changes on runtime
   */
  prepare() {
    // apply listener
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


    // check namespace, if not given use this as default
    if (options.namespace) {
      if (options.namespace !== this.namespace) {
        // skip not my namespace
        return;
      }
    }

    // const find = this.find(METATYPE_E, (c: IEntityRef) =>
    //   c.getClassRef().getClass() === options.target
    // );


    if (context === METATYPE_PROPERTY) {
      // if (!!this.processing.find(x => x.target === options.target && x.propertyName === options.propertyName)) {
      //   return;
      // }
      // this.processing.push(options);
      const sourceEntry = this.find(METATYPE_CLASS_REF, (ref: IClassRef) => ref.getClass() === options.target);
      if (sourceEntry) {
        const find = this.find(context, (c: IPropertyRef) =>
          c.getClassRef().getClass() === options.target &&
          c.name === options.propertyName
        );
        if (!find) {
          // update
          this.create(context, options);
        }
      }
      // remove(this.processing, x => x === options);
    } else if (context === METATYPE_ENTITY) {
      const find = this.find(context, (c: IEntityRef) =>
        c.getClassRef().getClass() === options.target
      );
      if (!find) {
        const entityRef = this.create(context, options) as IEntityRef;
        this.createPropertiesForRef(entityRef.getClassRef());
      }
    } else if (context === METATYPE_EMBEDDABLE) {
      const find = this.find(METATYPE_CLASS_REF, (c: IClassRef) =>
        c.getClass() === options.target
      ) as IClassRef;
      if (!find) {
        this.create(context, options);
      } else {
        const refOptions = find.getOptions();
        defaults(refOptions, options);
      }
    } else if (context === METATYPE_SCHEMA) {
      let find: ISchemaRef = this
        .find(context,
          (c: ISchemaRef) => c.name === (<ISchemaOptions>options).name
        );
      if (!find) {
        find = this.create(context, options);
      }

      if (options.target) {
        let entityRef: IEntityRef = this
          .find(METATYPE_ENTITY,
            (c: IEntityRef) => c.getClass() === options.target
          );

        if (find && entityRef) {
          this.addSchemaToEntityRef(find, entityRef);
        }
      }
    }
  }


  addSchemaToEntityRef(schemaRef: string | ISchemaRef, entityRef: IEntityRef, options: { override?: boolean, onlyDefault?: boolean } = {}) {
    const name = isString(schemaRef) ? schemaRef : schemaRef.name;
    this.onAdd(METATYPE_SCHEMA, {name: name, namespace: this.namespace});
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

    if (get(options, 'override', false)) {
      if (get(options, 'onlyDefault', false)) {
        remove(entry, x => x === git'default');
      } else {
        entry = [name];
      }
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
  getSchemaRefs(filter?: (x: ISchemaRef) => boolean): SchemaRef[] {
    return this.filter(METATYPE_SCHEMA, filter);
  }

  /**
   * Return schema references for an given entity or class reference
   *
   * @param ref
   * @return ISchemaRef[]
   */
  getSchemaRefsFor(ref: string): SchemaRef;
  getSchemaRefsFor(ref: string | IEntityRef | IClassRef): SchemaRef | SchemaRef[] {
    let lookup: SchemaRef[] = [];
    if (isEntityRef(ref) || isClassRef(ref)) {
      const schemas = ref.getOptions('schema');
      for (const schema of schemas) {
        let schemaRef: SchemaRef = this.find(METATYPE_SCHEMA, (x: ISchemaRef) => x.name === schema);
        if (!schemaRef) {
          schemaRef = this.create(METATYPE_SCHEMA, {name: schema, target: ref.getClass()});
        }
        lookup.push(schemaRef);
      }
      lookup = this.getSchemaRefs((x: ISchemaRef) => schemas.includes(x.name));
    } else if (isString(ref)) {
      let schemaRef = this.find(METATYPE_SCHEMA, (x: ISchemaRef) => x.name === ref);
      if (!schemaRef) {
        schemaRef = this.create(METATYPE_SCHEMA, {name: ref});
      }
      return schemaRef as SchemaRef;
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
  getEntityRefFor(fn: string | object | Function, skipNsCheck: boolean = true): DefaultEntityRef {
    let lookup = <string | Function>fn;
    if (!isFunction(fn) && !isString(fn) && isObjectLike(fn)) {
      lookup = ClassUtils.getFunction(fn as any);
    }
    let lookupFn = (x: IEntityRef) => x.getClassRef().getClass() === lookup;
    if (isString(fn)) {
      lookupFn = (x: IEntityRef) => x.getClassRef().name === lookup || x.name === lookup;
    }
    const entityRefExists = this.find<DefaultEntityRef>(METATYPE_ENTITY, lookupFn);
    if (entityRefExists) {
      return entityRefExists;
    }
    return this.create(METATYPE_ENTITY, {
      target: lookup,
      namespace: this.namespace,
      skipNsCheck: skipNsCheck
    });
  }


  /**
   * Returns property by name for a given class or entity ref
   *
   * @param filter
   */
  getPropertyRef(ref: IClassRef | IEntityRef, name: string): DefaultPropertyRef {
    return this.getPropertyRefs(ref).find(x => snakeCase(x.name) === snakeCase(name));
  }


  /**
   * Returns all properties for given class or entity ref
   *
   * @param ref
   */
  getPropertyRefs(ref: IClassRef | IEntityRef): DefaultPropertyRef[] {
    const clsRef: IClassRef = isEntityRef(ref) ? ref.getClassRef() : ref;
    // Return existing
    const clsRefExists = this.find(METATYPE_CLASS_REF, (x: IClassRef) => x === clsRef);
    let properties: DefaultPropertyRef[] = [];
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
          namespace: clsRef.getNamespace(),
          type: property.$target ? property.$target : property.type,
          propertyName: k,
          target: cls
        };

        const propMetadata = remove(metaPropOptions, x => x.propertyName === k);
        if (!isEmpty(propMetadata)) {
          for (const p of propMetadata) {
            // clean namespace
            const copy = clone(p);
            delete copy.namespace;
            assign(opts, copy);
          }
        }
        propOptions.push(opts);
      }
    }

    const propertyOptions = propOptions.concat(metaPropOptions)
      // .filter(x => !clsRef.getRegistry().find(METATYPE_PROPERTY,
      //   (z: IPropertyRef) => z.name === x.propertyName && z.getClassRef().getClass() === x.target)
      // )
      // .filter(x => !this.processing.find((z: IPropertyOptions) => z.propertyName === x.propertyName && z.target === x.target))
      .map(p => {
        // change namespace of properties namespace
        const copy = clone(p);
        copy.namespace = clsRef.getNamespace();
        copy.skipNsCheck = true;
        return copy;
      });


    return propertyOptions.map(opts => clsRef.getRegistry().create(METATYPE_PROPERTY, opts));
  }


  /**
   * Create default property reference
   *
   * @param options
   */
  createPropertyForOptions(options: IPropertyOptions): DefaultPropertyRef {
    if (keys(options).length === 0) {
      throw new Error('can\'t create property for empty options');
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
    if (!options.name) {
      options.name = ClassRef.getClassName(options.target);
    }
    const entityRef = new DefaultEntityRef(options);
    const retRef = this.add(entityRef.metaType, entityRef);
    const metaSchemaOptionsForEntity = MetadataRegistry.$()
      .getByContextAndTarget(METATYPE_SCHEMA, entityRef.getClass()) as ISchemaOptions[];
    if (metaSchemaOptionsForEntity.length > 0) {
      for (const schemaOptions of metaSchemaOptionsForEntity) {
        this.addSchemaToEntityRef(schemaOptions.name, entityRef);
      }
    }
    return retRef;
  }

  /**
   * Create default entity reference
   *
   * @param options
   */
  createEmbeddableForOptions(options: IObjectOptions): IClassRef {
    // options.namespace = this.namespace;
    // if (!options.name) {
    //   options.name = ClassRef.getClassName(options.target);
    // }
    options = defaults(options || {}, {});
    const classRef = this.getClassRefFor(options.target, METATYPE_CLASS_REF);
    classRef.setOptions(options);
    return classRef;
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
   * Return metadata collected in the MetadataRegistry through annotation or explizit attached data.
   *
   * @param context
   * @param target
   * @return IAbstractOptions
   */
  getMetadata(context: METADATA_TYPE, target: Function | string, propertyName?: string): IAbstractOptions {
    let metadataOptionList: IAbstractOptions[] =
      MetadataRegistry.$()
        .getByContextAndTarget(context, target, 'merge', propertyName) as IAbstractOptions[];

    let metadataOptions: IAbstractOptions = {};
    if (metadataOptionList.length > 1) {
      metadataOptions = merge(metadataOptions, ...metadataOptionList.map(x => cloneDeep(x)));
    } else if (metadataOptionList.length === 1) {
      metadataOptions = cloneDeep(metadataOptionList.shift());
    }

    if (propertyName) {
      // remove namespace for properties
      delete metadataOptions.namespace;
    }

    return metadataOptions;
  }


  getPropertyRefsFor(fn: string | object | Function): DefaultPropertyRef[] {
    const clsName = ClassRef.getClassName(fn);
    const clsRef = ClassRef.get(clsName, this.namespace);
    return this.getPropertyRefs(clsRef);
  }


  create<T>(context: string, options: IAbstractOptions): T {
    const skipNsCheck = get(options, 'skipNsCheck', false);
    delete options.skipNsCheck;
    const metadata = this.getMetadata(context as METADATA_TYPE, options.target, options.propertyName ? options.propertyName : null);
    if (metadata) {

      if (!skipNsCheck && metadata.namespace && metadata.namespace !== this.namespace) {
        if (context !== METATYPE_PROPERTY) {
          throw new NotSupportedError(
            'namespace for ' + context + ' is ' + metadata.namespace +
            ' the namespace of this registry is ' + this.namespace
          );
        }
      }
      if (!isEmpty(metadata) && keys(metadata).length > 0) {
        merge(options, assign(metadata, {namespace: this.namespace}));
      }
    }
    options.metaType = context;
    switch (context as METADATA_TYPE) {
      case METATYPE_CLASS_REF:
        break;
      case METATYPE_EMBEDDABLE:
        return <any>this.createEmbeddableForOptions(options);
      case METATYPE_ENTITY:
        return <any>this.createEntityForOptions(options);
      case METATYPE_PROPERTY:
        return <any>this.createPropertyForOptions(options);
      case METATYPE_SCHEMA:
        return <any>this.createSchemaForOptions(options as ISchemaOptions);
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


  getClassRefFor(object: string | Function | IClassRef, type: METADATA_TYPE): IClassRef {
    let ref: IClassRef = null;
    if (isString(object)) {
      ref = this.find(METATYPE_CLASS_REF, (x: IClassRef) => x.name === object);
    } else if (isFunction(object)) {
      ref = this.find(METATYPE_CLASS_REF, (x: IClassRef) => x.getClass(true) === object);
    } else {
      ref = this.find(METATYPE_CLASS_REF, (x: IClassRef) => x === object);
    }
    if (!ref) {
      ref = ClassRef.get(<string | Function>object, this.namespace, type === METATYPE_PROPERTY);
      const metadata = this.getMetadata(METATYPE_EMBEDDABLE, <string | Function>object);
      if (!isEmpty(metadata) && keys(metadata).length > 0) {
        const refOptions = ref.getOptions();
        merge(refOptions, metadata);
      }
      // this.createPropertiesForRef(ref);
    }
    return ref;
  }

  reset() {
    super.reset();
    MetadataRegistry.$().removeListener(C_EVENT_ADD, this.onAdd.bind(this));
    MetadataRegistry.$().removeListener(C_EVENT_REMOVE, this.onRemove.bind(this));
    MetadataRegistry.$().removeListener(C_EVENT_UPDATE, this.onUpdate.bind(this));
  }


}
