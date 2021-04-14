/**
 * Handler for metadata
 */
import * as _ from 'lodash';
import {EventEmitter} from 'events';
import {
  C_EVENT_ADD,
  C_EVENT_REMOVE,
  C_EVENT_UPDATE,
  METADATA_AND_BIND_TYPE,
  METADATA_TYPE,
  METATYPE_CLASS_REF,
  METATYPE_ENTITY,
  METATYPE_PROPERTY
} from './../Constants';
import {IPropertyOptions} from './../options/IPropertyOptions';
import {ILookupRegistry} from '../../api/ILookupRegistry';
import {IEntityRef, isEntityRef} from '../../api/IEntityRef';
import {IClassRef, isClassRef} from '../../api/IClassRef';
import {IPropertyRef} from '../../api/IPropertyRef';
import {LookupRegistry} from '../LookupRegistry';
import {MetadataRegistry} from './MetadataRegistry';
import {DefaultPropertyRef} from './DefaultPropertyRef';
import {ClassRef} from '../ClassRef';
import {IEntityOptions} from '../options/IEntityOptions';
import {DefaultEntityRef} from './DefaultEntityRef';
import {hasClassPropertiesInDefinition, IJsonSchema7} from '../metadata/JsonSchema7';
import {ISchemaOptions} from '../options/ISchemaOptions';
import {IObjectOptions} from '../options/IObjectOptions';
import {ClassUtils} from '@allgemein/base/browser';
import {JsonSchema} from '../json-schema/JsonSchema';


/**
 * Registry for metadata of classes and there properties
 */
export class DefaultNamespacedRegistry extends EventEmitter implements ILookupRegistry {

  readonly namespace: string;

  readonly registry: LookupRegistry;

  constructor(namespace: string) {
    super();
    this.namespace = namespace;
    this.registry = LookupRegistry.$(this.namespace);
  }

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
  onAdd(context: METADATA_TYPE, options: IEntityOptions | IPropertyOptions | ISchemaOptions | IObjectOptions) {
    if (context === 'property') {
      const find = this.getLookupRegistry().find(context, (c: any) => c.target === options.target && c.name === options.name);
      if (find) {
        // update
      } else {
        this.create(context, options);
      }
    } else if (context === 'entity') {
      this.create(context, options);
    }
  }


  /**
   * react on dynamically removed context
   *
   * @param context
   * @param entries
   */
  onRemove(context: METADATA_TYPE, entries: (IEntityOptions | IPropertyOptions | ISchemaOptions | IObjectOptions)[]) {

    if (context === 'entity' || context === 'class_ref') {
      const targets = entries.map(x => x.target);
      this.getLookupRegistry().remove('class_ref', (x: any) => targets.includes(x.target));
      this.getLookupRegistry().remove('entity', (x: any) => targets.includes(x.target));
      this.getLookupRegistry().remove('property', (x: any) => targets.includes(x.target));
    }

    if (context === 'property') {
      const targets = entries.map(x => [x.target, x.propertyName]);
      this.getLookupRegistry().remove(context, (x: any) => targets.includes([x.target, x.name]));
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
    if (!_.isFunction(fn) && !_.isString(fn) && _.isObjectLike(fn)) {
      lookup = ClassUtils.getFunction(fn as any);
    }
    const clsRef = ClassRef.get(lookup, this.namespace);
    let lookupFn = (x: IEntityRef) => x.getClassRef().name === clsRef.name;
    const entityRefExists = this.find<IEntityRef>(METATYPE_ENTITY, lookupFn);
    if (entityRefExists) {
      return entityRefExists;
    }
    return this.createEntityForRef(clsRef);
  }


  /**
   * Returns the used instance of lookup registry handler
   */
  getLookupRegistry(): LookupRegistry {
    return this.registry;
  }


  /**
   * Returns property by name for a given class or entity ref
   *
   * @param filter
   */
  getPropertyRef(ref: IClassRef | IEntityRef, name: string): IPropertyRef {
    return this.getPropertyRefs(ref).find(x => _.snakeCase(x.name) === _.snakeCase(name));
  }


  /**
   * Returns all properties for given class or entity ref. If
   *
   * @param ref
   */
  getPropertyRefs(ref: IClassRef | IEntityRef): IPropertyRef[] {
    const clsRef: IClassRef = isEntityRef(ref) ? ref.getClassRef() : ref;
    // Return existing
    const clsRefExists = this.find(METATYPE_CLASS_REF, (x: IClassRef) => x === clsRef);
    if (clsRefExists) {
      return this.filter(METATYPE_PROPERTY, (x: IPropertyRef) => x.getClassRef() === clsRefExists);
    }
    return this.createPropertiesForRef(clsRef);
  }

  /**
   * Create properties for class or entity ref.
   */
  createPropertiesForRef(clsRef: IClassRef): DefaultPropertyRef[] {
    const cls = clsRef.getClass(true);
    const jsonSchema = JsonSchema.serialize(cls);
    const propOptions: IPropertyOptions[] = [];
    const metaPropOptions = MetadataRegistry.$().getByContextAndTarget(METATYPE_PROPERTY, cls) as IPropertyOptions[];
    if (hasClassPropertiesInDefinition(clsRef.name, jsonSchema)) {
      const properties = (jsonSchema.definitions[clsRef.name] as IJsonSchema7).properties;
      for (const k of _.keys(properties)) {
        const property: IJsonSchema7 = properties[k] as IJsonSchema7;
        const opts: IPropertyOptions = {
          metaType: METATYPE_PROPERTY,
          namespace: this.namespace,
          type: property.$target ? property.$target : property.type,
          propertyName: k,
          target: cls
        };

        const propMetadata = _.remove(metaPropOptions, x => x.propertyName === k);
        if (!_.isEmpty(propMetadata)) {
          for (const p of propMetadata) {
            _.assign(opts, p);
          }
        }
        propOptions.push(opts);
      }
    }

    return propOptions
      .concat(metaPropOptions)
      .map(opts => this.createPropertyForOptions(opts));
  }

  /**
   * Create default property reference
   *
   * @param options
   */
  createPropertyForOptions(options: IPropertyOptions): DefaultPropertyRef {
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
   * Create default entity reference for passed reference
   *
   * @param options
   */
  createEntityForRef(ref: IClassRef | IEntityRef): DefaultEntityRef {
    const metaEntityOptions = MetadataRegistry.$().getByContextAndTarget(METATYPE_ENTITY, ref.getClass()) as IEntityOptions[];
    let metaEntityOption = metaEntityOptions.shift();
    if (!metaEntityOption) {
      metaEntityOption = {
        target: ref.getClass(),
        name: ref.getClass().name
      };
    }
    return this.createEntityForOptions(metaEntityOption);
  }


  getPropertyRefsFor(fn: string | object | Function): IPropertyRef[] {
    const clsName = ClassRef.getClassName(fn);
    const clsRef = ClassRef.get(clsName, this.namespace);
    return this.getPropertyRefs(clsRef);
  }


  list<X>(type: METADATA_AND_BIND_TYPE, filter?: (x: any) => boolean): X[] {
    return this.filter(type, filter);
  }


  listEntities(filter?: (x: IEntityRef) => boolean): IEntityRef[] {
    return this.getEntities(filter);
  }


  listProperties(filter?: (x: IPropertyRef) => boolean): IPropertyRef[] {
    return this.filter(METATYPE_PROPERTY, filter);
  }


  create<T>(context: string, options: any): T {
    switch (context as METADATA_TYPE) {
      case 'class_ref':
        break;
      case 'entity':
        if(isClassRef(options)){
          return <any>this.createEntityForRef(options);
        }else{
          return <any>this.createEntityForOptions(options);
        }
      case 'property':
        return <any>this.createPropertyForOptions(options);
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

  /**
   * TODO
   */
  filter<T>(context: string, search: any): T[] {
    return this.getLookupRegistry().filter(context, search);
  }

  /**
   * TODO
   */
  find<T>(context: string, search: any): T {
    return this.getLookupRegistry().find(context, search);
  }

  /**
   * TODO
   */
  remove<T>(context: string, search: any): T[] {
    return this.getLookupRegistry().remove(context, search);
  }

}
