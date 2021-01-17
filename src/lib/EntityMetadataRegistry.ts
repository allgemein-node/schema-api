/**
 * Handler for metadata
 */
import * as _ from 'lodash';
import {METADATA_REGISTRY, METADATA_TYPE} from './Constants';
import {IEntityOptions} from './options/IEntityOptions';
import {IPropertyOptions} from './options/IPropertyOptions';
import {ISchemaOptions} from './options/ISchemaOptions';
import {IObjectOptions} from './options/IObjectOptions';
import {MetadataStorage} from '@allgemein/base/libs/MetadataStorage';
import {EventEmitter} from 'events';

/**
 * Registry for metadata of classes and there properties
 */
export class EntityMetadataRegistry extends EventEmitter {

  private static $self: EntityMetadataRegistry;

  private readonly metadata: any[] = [];

  private schemas: string[] = [];

  private targets: any[] = [];

  constructor() {
    super();
    this.targets = [];
    this.schemas = [];
    this.metadata = MetadataStorage.key(METADATA_REGISTRY);
  }


  static $() {
    if (!this.$self) {
      this.$self = new EntityMetadataRegistry();
    }
    return this.$self;
  }


  static reset() {
    this.$self = null;
  }


  add(context: METADATA_TYPE, options: IEntityOptions | IPropertyOptions | ISchemaOptions | IObjectOptions) {
    options.$type = context;
    // find?
    this.metadata.push(options);
    if (this.targets.indexOf(options.target) === -1) {
      this.targets.push(options.target);
    }
    if (context === 'schema') {
      if (this.schemas.indexOf(options.name) === -1) {
        this.schemas.push(options.name);
      }
    }
    this.emit('add', context, options);
  }


  remove(context: METADATA_TYPE) {
    this.emit('remove', {});
  }

  update(context: METADATA_TYPE) {
    this.emit('update', {});
  }

  getByContext(context: METADATA_TYPE) {
    return this.metadata.filter(x => x.$context === context);
  }

  getTargets() {
    return this.targets;
  }

  getByContextAndTarget(context: METADATA_TYPE, target: any) {
    return this.metadata.filter(x => x.$context === context && x.target === target);
  }

  getByTarget(target: any) {
    return this.metadata.filter(x => x.target === target);
  }

  private createSearchFunction(find: any) {
    let lookup = find;
    if (!_.isFunction(find)) {
      const keys = _.keys(find);
      lookup = (x: any) => {
        return keys.map(k => find[k] === x[k]).reduce((previousValue, currentValue) => previousValue && currentValue);
      };
    }
    return lookup;
  }

  find(context: METADATA_TYPE, find: any) {
    const lookup = this.createSearchFunction(find);
    return this.metadata.find((x => x.context === context && lookup(x)));
  }

  filter(context: METADATA_TYPE, find: any) {
    const lookup = this.createSearchFunction(find);
    return this.metadata.filter((x => x.context === context && lookup(x)));
  }

  getMetadata() {
    return this.metadata;
  }

  getSchemas() {
    return _.uniq(this.metadata.filter((x => x.context === 'schema')).map(x => x.name));
  }

  getMetadatasForSchema(schema: string) {
    return this.metadata.filter((x => x.context === 'schema' && x.name === schema));
  }


}
