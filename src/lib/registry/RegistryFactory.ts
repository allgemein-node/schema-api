/**
 * Schema definitions can be different depending by handled structure.
 * We want use one api for use and accessing objects. The registry handle for a namespace can be
 * registered here.
 */
import {ILookupRegistry} from '../../api/ILookupRegistry';
import {DEFAULT_NAMESPACE} from '../Constants';
import {DefaultNamespacedRegistry} from './DefaultNamespacedRegistry';

export class RegistryFactory {


  static $handles: { [key: string]: ILookupRegistry } = {};


  /**
   * Return the registry handling schema/objects of given context or if not exists the generic default namescaped registry
   *
   * @param namespace
   */
  static get(namespace: string = DEFAULT_NAMESPACE) {
    if (!this.$handles[namespace]) {
      this.$handles[namespace] = new DefaultNamespacedRegistry(namespace);
      if (this.$handles[namespace].prepare) {
        this.$handles[namespace].prepare();
      }
    }
    return this.$handles[namespace];
  }


  /**
   * Register a special registry for a given namespace
   *
   * @param namespace
   * @param registry
   */
  static register(namespace: string, registry: ILookupRegistry) {
    this.$handles[namespace] = registry;
  }
}
