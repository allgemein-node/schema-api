import {isFunction} from 'lodash';
import {IEntityRef} from './IEntityRef';
import {IPropertyRef} from './IPropertyRef';
import {LookupRegistry} from '../lib/LookupRegistry';
import {IClassRef} from './IClassRef';
import {ISchemaRef} from './ISchemaRef';
import {METADATA_TYPE} from '../lib/Constants';


export function isLookupRegistry(x: any): x is ILookupRegistry {
  if (x !== undefined && x &&
    isFunction(x['getLookupRegistry']) &&
    isFunction(x['getEntityRefFor']) &&
    isFunction(x['getPropertyRefs']) &&
    isFunction(x['getEntities'])
  ) {
    return true;
  }
  return false;
}

/**
 *
 */
export interface ILookupRegistry {

  prepare?(): void;

  reload?(): void;

  ready?(timeout?: number): Promise<boolean>;

  getSchemaRefs<T extends ISchemaRef>(filter?: (x: ISchemaRef) => boolean): (T | ISchemaRef)[];

  getSchemaRefsFor<T extends ISchemaRef>(fn: string): (T | ISchemaRef);

  getSchemaRefsFor<T extends ISchemaRef>(fn: string | IEntityRef | IClassRef): T | ISchemaRef | (T | ISchemaRef)[];

  getEntityRefFor<T extends IEntityRef>(fn: string | object | Function, skipNsCheck?: boolean): (T | IEntityRef);

  getEntityRefs<T extends IEntityRef>(filter?: (x: IEntityRef) => boolean): (T | IEntityRef)[];

  getPropertyRefsFor<T extends IPropertyRef>(fn: string | object | Function): (T | IPropertyRef)[];

  getPropertyRef<T extends IPropertyRef>(ref: IClassRef | IEntityRef, name: string): (T | IPropertyRef);

  getPropertyRefs<T extends IPropertyRef>(ref: IClassRef | IEntityRef): (T | IPropertyRef)[];

  getLookupRegistry(): LookupRegistry;

  list<X>(type: METADATA_TYPE, filter?: (x: any) => boolean): X[];

  listEntities(filter?: (x: IEntityRef) => boolean): IEntityRef[];


  listProperties(filter?: (x: IPropertyRef) => boolean): IPropertyRef[];

  getClassRefFor(object: string | Function | IClassRef, type: METADATA_TYPE): IClassRef;


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

  /**
   * Reset registry data
   */
  reset(): void;

}
