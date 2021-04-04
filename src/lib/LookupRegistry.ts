import * as _ from 'lodash';
import {DEFAULT_NAMESPACE} from './Constants';

export class LookupRegistry {

  private static $self: { [namespace: string]: LookupRegistry } = {};

  private namespace: string = DEFAULT_NAMESPACE;

  private _entries: { [context: string]: any[] } = {};

  constructor(namespace: string) {
    this.namespace = namespace;
  }

  getNamespace(): string {
    return this.namespace;
  }

  static reset(namespace: string = DEFAULT_NAMESPACE): void {
    if (this.$self[namespace]) {
      delete this.$self[namespace];
    }
  }

  static $(namespace: string = DEFAULT_NAMESPACE): LookupRegistry {
    if (!this.$self[namespace]) {
      this.$self[namespace] = new LookupRegistry(namespace);
    }
    return this.$self[namespace];
  }

  list(context: string) {
    if (!_.has(this._entries, context)) {
      this._entries[context] = [];
    }
    return this._entries[context];
  }

  add<T>(context: string, entry: T): T {
    if (!_.has(this._entries, context)) {
      this._entries[context] = [];
    }
    this._entries[context].push(entry);
    return entry;
  }

  remove<T>(context: string, search: any): T[] {
    if (!_.has(this._entries, context)) {
      this._entries[context] = [];
    }
    return _.remove<T>(this._entries[context], search);
  }

  filter<T>(context: string, search: any): T[] {
    if (!_.has(this._entries, context)) {
      this._entries[context] = [];
    }
    return _.filter(this._entries[context], search);
  }

  find<T>(context: string, search: any): T {
    if (!_.has(this._entries, context)) {
      this._entries[context] = [];
    }
    return _.find(this._entries[context], search);
  }




  /**
   * return lookup registry namespaces
   */
  static getRegistryNamespaces() {
    return _.keys(this.$self);
  }

  /**
   * return lookup registries
   */
  static getLookupRegistries() {
    return _.keys(this.$self).map(x => this.$self[x]);
  }

  /**
   * search in all registries
   *
   * @param context
   * @param search
   */
  static find<T>(context: string, search: any): T {
    const registryNames = _.keys(this.$self);
    for (const registryName of registryNames) {
      const found = <T>this.$self[registryName].find(context, search);
      if (found) {
        return found;
      }
    }
    return null;
  }

  /**
   * filter over all registries
   *
   * @param context
   * @param search
   */
  static filter<T>(context: string, search: any): T[] {
    const results: T[] = [];
    const namespaces = _.keys(this.$self);
    for (const namespace of namespaces) {
      const found = <T[]>this.$self[namespace].filter(context, search);
      if (!_.isEmpty(found)) {
        results.push(...found);
      }
    }
    return results;
  }


}


