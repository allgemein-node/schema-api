import {snakeCase} from 'lodash';
import {EventEmitter} from 'events';
import {METADATA_TYPE, METATYPE_ENTITY, METATYPE_PROPERTY} from './../Constants';
import {ILookupRegistry} from '../../api/ILookupRegistry';
import {IEntityRef} from '../../api/IEntityRef';
import {IClassRef} from '../../api/IClassRef';
import {IPropertyRef} from '../../api/IPropertyRef';
import {LookupRegistry} from '../LookupRegistry';
import {LockFactory, NotSupportedError, Semaphore} from '@allgemein/base';
import {ISchemaRef} from '../../api/ISchemaRef';
import {IRegistryOptions} from './IRegistryOptions';


/**
 * Registry for metadata of classes and there properties
 */
export abstract class AbstractRegistry implements ILookupRegistry {

  protected readonly namespace: string;

  readonly lock: Semaphore;

  readonly options: IRegistryOptions;


  constructor(namespace: string, options?: IRegistryOptions) {
    this.namespace = namespace;
    this.options = options || {};
    this.lock = LockFactory.$().semaphore(1);
  }



  ready(timeout?: number): Promise<boolean> {
    return this.lock.await(timeout).then(x => true).catch(x => false);
  }


  getOptions(): IRegistryOptions {
    return this.options;
  }


  /**
   * Return all registered schema references
   *
   * @param ref
   * @return ISchemaRef[]
   */
  getSchemaRefs<T extends ISchemaRef>(filter?: (x: ISchemaRef) => boolean): (T | ISchemaRef)[] {
    throw new NotSupportedError('');
  }

  /**
   * Return schema references for an given entity or class reference
   *
   * @param ref
   * @return ISchemaRef[]
   */
  getSchemaRefsFor<T extends ISchemaRef>(ref: string): T | ISchemaRef;
  getSchemaRefsFor<T extends ISchemaRef>(ref: string | IEntityRef | IClassRef): T | ISchemaRef | (T | ISchemaRef)[] {
    throw new NotSupportedError('');
  }

  /**
   * TODO
   *
   * @param filter
   */
  getEntityRefs<T extends IEntityRef>(filter?: (x: IEntityRef) => boolean): (T | IEntityRef)[] {
    return this.filter(METATYPE_ENTITY, filter);
  }

  /**
   * Can get get entity ref for function.
   *
   * @param fn
   */
  getEntityRefFor<T extends IEntityRef>(fn: string | object | Function, skipNsCheck: boolean = true): (T | IEntityRef) {
    throw new NotSupportedError('');
  }


  /**
   * Returns the used instance of lookup registry handler
   */
  getLookupRegistry(namespace: string = null): LookupRegistry {
    return LookupRegistry.$(namespace ? namespace : this.namespace);
  }

  /**
   * Method for returning class ref
   *
   * @param object
   * @param type
   */
  getClassRefFor(object: string | Function | IClassRef, type: METADATA_TYPE): IClassRef {
    throw new NotSupportedError('');
  }

  /**
   * Returns property by name for a given class or entity ref
   *
   * @param filter
   */
  getPropertyRef<T extends IPropertyRef>(ref: IClassRef | IEntityRef, name: string): (T | IPropertyRef) {
    return this.getPropertyRefs<T>(ref).find(x => snakeCase(x.name) === snakeCase(name));
  }


  /**
   * Returns all properties for given class or entity ref
   *
   * @param ref
   */
  getPropertyRefs<T extends IPropertyRef>(ref: IClassRef | IEntityRef): (T | IPropertyRef)[] {
    throw new NotSupportedError('');
  }


  getPropertyRefsFor<T extends IPropertyRef>(fn: string | object | Function): (T | IPropertyRef)[] {
    throw new NotSupportedError('');
  }


  list<X>(type: METADATA_TYPE, filter?: (x: any) => boolean): X[] {
    return this.filter(type, filter);
  }


  listEntities(filter?: (x: IEntityRef) => boolean): IEntityRef[] {
    return this.getEntityRefs(filter);
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
  add<T>(context: string, entry: T, ns?: string): T {
    return this.getLookupRegistry(ns).add(context, entry);
  }


  /**
   * TODO
   */
  filter<T>(context: string, search: any, ns?: string): T[] {
    return this.getLookupRegistry(ns).filter(context, search);
  }

  /**
   * TODO
   */
  find<T>(context: string, search: any, ns?: string): T {
    return this.getLookupRegistry(ns).find(context, search);
  }

  /**
   * TODO
   */
  remove<T>(context: string, search: any, ns?: string): T[] {
    return this.getLookupRegistry(ns).remove(context, search);
  }

  /**
   * reset current registry
   */
  reset() {
    this.clear();
  }

  clear() {
    LookupRegistry.reset(this.namespace);
  }

}
