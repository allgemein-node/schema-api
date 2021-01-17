import * as _ from 'lodash';
import {XS_DEFAULT} from './Constants';

export class LookupRegistry {

  private static $self: { [name: string]: LookupRegistry } = {};

  private name: string = XS_DEFAULT;

  private _entries: { [context: string]: any[] } = {};

  constructor(name: string) {
    this.name = name;
  }

  getName(): string {
    return this.name;
  }

  static reset(name: string = XS_DEFAULT): void {
    if (this.$self[name]) {
      delete this.$self[name];
    }
  }

  static $(name: string = XS_DEFAULT): LookupRegistry {
    if (!this.$self[name]) {
      this.$self[name] = new LookupRegistry(name);
    }
    return this.$self[name];
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
   * return lookup registry names
   */
  static getRegistryNames() {
    return _.keys(this.$self);
  }

  /**
   * return lookup registries
   */
  static getRegistries() {
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
    const registryNames = _.keys(this.$self);
    for (const registryName of registryNames) {
      const found = <T[]>this.$self[registryName].filter(context, search);
      if (!_.isEmpty(found)) {
        results.push(...found);
      }
    }
    return results;
  }
}


