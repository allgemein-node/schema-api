import {IEntityRef} from './IEntityRef';
import {IPropertyRef} from './IPropertyRef';
import {METADATA_AND_BIND_TYPE} from '../lib/Constants';
import {LookupRegistry} from '../lib/LookupRegistry';
import {IClassRef} from './IClassRef';
import {IBaseRef} from './IBaseRef';

/**
 *
 */
export interface ILookupRegistry {

  prepare?(): void;


  getEntityRefFor(fn: string | object | Function): IEntityRef;

  getPropertyRefsFor(fn: string | object | Function): IPropertyRef[];

  getPropertyRef(ref: IClassRef | IEntityRef, name: string): IPropertyRef;

  getLookupRegistry(): LookupRegistry;

  list<X>(type: METADATA_AND_BIND_TYPE, filter?: (x: any) => boolean): X[];

  listEntities(filter?: (x: IEntityRef) => boolean): IEntityRef[];

  getEntities(filter?: (x: IEntityRef) => boolean): IEntityRef[];

  listProperties(filter?: (x: IPropertyRef) => boolean): IPropertyRef[];

  getPropertyRefs(ref: IClassRef | IEntityRef): IPropertyRef[];


  create<T>(context: string, options: any): T;

  /**
   * Add some entries of given context (mostly passing to same method of LookupRegistry)
   *
   * @param context
   * @param entry
   */
  add<T>(context: string, entry: T): T;

  /**
   * Remove some entries of given context by search critieria (mostly passing to same method of LookupRegistry)
   *
   * @param context
   * @param entry
   */
  remove<T>(context: string, search: any): T[];

  /**
   * Filter some entries of given context by search critieria (mostly passing to same method of LookupRegistry)
   *
   * @param context
   * @param entry
   */
  filter<T>(context: string, search: any): T[];

  /**
   * Find some entries of given context by search critieria (mostly passing to same method of LookupRegistry)
   *
   * @param context
   * @param entry
   */
  find<T>(context: string, search: any): T;


}
