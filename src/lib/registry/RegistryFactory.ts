/**
 * Schema definitions can be different depending by handled structure.
 * We want use one api for use and accessing objects. The registry handle for a namespace can be
 * registered here.
 */
import {isRegExp, isString, keys, remove} from 'lodash';
import {ILookupRegistry} from '../../api/ILookupRegistry';
import {ClassType, DEFAULT_NAMESPACE} from '../Constants';
import {DefaultNamespacedRegistry} from './DefaultNamespacedRegistry';

export class RegistryFactory {

  static $types: { pattern: string | RegExp, registryClass: ClassType<ILookupRegistry> }[] = [
    {
      pattern: /.*/,
      registryClass: DefaultNamespacedRegistry
    }
  ];


  static $handles: { [key: string]: ILookupRegistry } = {};


  /**
   * Return the registry handling schema/objects of given context or if not exists the generic default namescaped registry
   *
   * @param namespace
   */
  static get(namespace: string = DEFAULT_NAMESPACE) {
    if (!this.$handles[namespace]) {
      for (const type of this.$types) {
        if (isString(type.pattern)) {
          if (namespace === type.pattern) {
            this.$handles[namespace] = Reflect.construct(type.registryClass, [namespace]);
            break;
          }
        } else {
          if (isRegExp(type.pattern) && type.pattern.test(namespace)) {
            this.$handles[namespace] = Reflect.construct(type.registryClass, [namespace]);
            break;
          }
        }
      }

      if (!this.$handles[namespace]) {
        // create default as fallback if nothing passes
        this.$handles[namespace] = new DefaultNamespacedRegistry(namespace);
      }

      if (this.$handles[namespace].prepare) {
        this.$handles[namespace].prepare();
      }
    }
    return this.$handles[namespace];
  }


  /**
   * Register a special registry for a given namespace or pattern, remove previous if existed
   *
   * @param namespace
   * @param registry
   */
  static register(namespace: string | RegExp, registryClass: ClassType<ILookupRegistry>) {
    remove(this.$types, x => x.pattern === namespace);
    this.$types.unshift({
      pattern: namespace,
      registryClass: registryClass
    });
  }


  static getNamespaces() {
    return keys(this.$handles);
  }


}
