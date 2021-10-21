/**
 * Schema definitions can be different depending by handled structure.
 * We want use one api for use and accessing objects. The registry handle for a namespace can be
 * registered here.
 */
import {has, isRegExp, isString, keys} from 'lodash';
import {ILookupRegistry} from '../../api/ILookupRegistry';
import {ClassType, DEFAULT_NAMESPACE, METATYPE_ENTITY} from '../Constants';
import {DefaultNamespacedRegistry} from './DefaultNamespacedRegistry';
import {MetadataRegistry} from './MetadataRegistry';
import {C_DEFAULT} from '@allgemein/base';
import {IRegistryOptions} from './IRegistryOptions';

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
  static get<T extends ILookupRegistry>(namespace: string = DEFAULT_NAMESPACE, options?: IRegistryOptions): T {
    if (!this.$handles[namespace]) {
      for (const type of this.$types) {
        if (isString(type.pattern)) {
          if (namespace === type.pattern) {
            this.$handles[namespace] = Reflect.construct(type.registryClass, [namespace, options]);
            break;
          }
        } else {
          if (isRegExp(type.pattern) && type.pattern.test(namespace)) {
            this.$handles[namespace] = Reflect.construct(type.registryClass, [namespace, options]);
            break;
          }
        }
      }

      if (!this.$handles[namespace]) {
        // create default as fallback if nothing passes
        this.$handles[namespace] = new DefaultNamespacedRegistry(namespace, options);
      }

      if (this.$handles[namespace].prepare) {
        this.$handles[namespace].prepare();
      }
    }
    return this.$handles[namespace] as T;
  }

  /**
   * Remove registry from handles list
   *
   * @param namespace
   */
  static remove(namespace: string) {
    if (has(this.$handles, namespace)) {
      this.get(namespace).reset();
    }
    delete this.$handles[namespace];
  }


  /**
   * Register a special registry for a given namespace or pattern, remove previous if existed
   *
   * @param namespace
   * @param registry
   */
  static register(namespace: string | RegExp, registryClass: ClassType<ILookupRegistry>) {
    const existsAlready = this.$types.find(x =>
      isString(x.pattern) && isString(namespace) ? x.pattern === namespace :
        isRegExp(x.pattern) && isRegExp(namespace) ? x.pattern.source === namespace.source :
          x.pattern === namespace);
    if (!existsAlready) {
      this.$types.unshift({
        pattern: namespace,
        registryClass: registryClass
      });
    }
  }

  /**
   * Return active and registered namespaces
   */
  static getNamespaces() {
    return keys(this.$handles);
  }

  static getTargets() {
    return MetadataRegistry.$().getTargets();
  }

  /**
   * Return all declared namespaces
   */
  static getDeclaredNamespaces(): { target: Function, namespace: string }[] {
    return [].concat(...MetadataRegistry.$().getTargets().map(x => {
      const entries = MetadataRegistry.$().getByContextAndTarget(METATYPE_ENTITY, x, 'merge');
      return entries.map(x => {
        return {target: x.target, namespace: x.namespace ? x.namespace : C_DEFAULT};
      });
    }));
  }


  static reset() {
    for (const ns of this.getNamespaces()) {
      this.remove(ns);
    }
  }

}
