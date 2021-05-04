/**
 * Handler for metadata
 */
import * as _ from 'lodash';
import {EventEmitter} from 'events';
import {METADATA_TYPE, METATYPE_PROPERTY, METATYPE_ENTITY} from './../Constants';
import {ILookupRegistry} from '../../api/ILookupRegistry';
import {IEntityRef} from '../../api/IEntityRef';
import {IClassRef} from '../../api/IClassRef';
import {IPropertyRef} from '../../api/IPropertyRef';
import {LookupRegistry} from '../LookupRegistry';
import {NotSupportedError} from '@allgemein/base/browser';
import {ISchemaRef} from '../../api/ISchemaRef';


/**
 * Registry for metadata of classes and there properties
 */
export abstract class AbstractRegistry extends EventEmitter implements ILookupRegistry {

  protected readonly namespace: string;

  constructor(namespace: string) {
    super();
    this.namespace = namespace;
  }



  // /**
  //  * Initialize events for metadata changes on runtime
  //  */
  // prepare() {
  //   MetadataRegistry.$().on(C_EVENT_ADD, this.onAdd.bind(this));
  //   MetadataRegistry.$().on(C_EVENT_REMOVE, this.onRemove.bind(this));
  //   MetadataRegistry.$().on(C_EVENT_UPDATE, this.onUpdate.bind(this));
  // }


  /**
   * Return all registered schema references
   *
   * @param ref
   * @return ISchemaRef[]
   */
  getSchemaRefs(filter?: (x: ISchemaRef) => boolean): ISchemaRef[] {
    throw new NotSupportedError('');
  }

  /**
   * Return schema references for an given entity or class reference
   *
   * @param ref
   * @return ISchemaRef[]
   */
  getSchemaRefsFor(ref: IEntityRef | IClassRef): ISchemaRef[] {
    throw new NotSupportedError('');
  }

  /**
   * TODO
   *
   * @param filter
   */
  getEntities(filter?: (x: IEntityRef) => boolean): IEntityRef[] {
    return this.filter(METATYPE_ENTITY, filter);
  }

  /**
   * Can get get entity ref for function.
   *
   * @param fn
   */
  getEntityRefFor(fn: string | object | Function): IEntityRef {
    throw new NotSupportedError('');
  }


  /**
   * Returns the used instance of lookup registry handler
   */
  getLookupRegistry(): LookupRegistry {
    return LookupRegistry.$(this.namespace);
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
   * Returns all properties for given class or entity ref
   *
   * @param ref
   */
  getPropertyRefs(ref: IClassRef | IEntityRef): IPropertyRef[] {
    throw new NotSupportedError('');
  }


  getPropertyRefsFor(fn: string | object | Function): IPropertyRef[] {
    throw new NotSupportedError('');
  }


  list<X>(type: METADATA_TYPE, filter?: (x: any) => boolean): X[] {
    return this.filter(type, filter);
  }


  listEntities(filter?: (x: IEntityRef) => boolean): IEntityRef[] {
    return this.getEntities(filter);
  }


  listProperties(filter?: (x: IPropertyRef) => boolean): IPropertyRef[] {
    return this.filter(METATYPE_PROPERTY, filter);
  }


  create<T>(context: string, options: any): T {
    throw new NotSupportedError('');
  }

  /**
   * TODO
   */
  add<T>(context: string, entry: T): T {
    return this.getLookupRegistry().add(context, entry);
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

  /**
   * reset current registry
   */
  reset() {
    LookupRegistry.reset(this.namespace);
  }

}
