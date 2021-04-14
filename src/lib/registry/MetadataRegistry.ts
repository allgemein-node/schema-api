/**
 * Handler for metadata
 */
import * as _ from 'lodash';
import {
  C_EVENT_ADD,
  C_EVENT_REMOVE,
  CLASS_TYPE,
  METADATA_REGISTRY,
  METADATA_TYPE,
  METATYPE_SCHEMA
} from './../Constants';
import {IEntityOptions} from './../options/IEntityOptions';
import {IPropertyOptions} from './../options/IPropertyOptions';
import {ISchemaOptions} from './../options/ISchemaOptions';
import {IObjectOptions} from './../options/IObjectOptions';
import {MetadataStorage} from '@allgemein/base/libs/MetadataStorage';
import {EventEmitter} from 'events';
import {IAbstractOptions} from '../options/IAbstractOptions';

/**
 * Registry for metadata of classes and there properties
 */
export class MetadataRegistry extends EventEmitter {

  private static $self: MetadataRegistry;

  private readonly metadata: IAbstractOptions[] = [];

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
      this.$self = new MetadataRegistry();
    }
    return this.$self;
  }


  static reset() {
    this.$self = null;
  }


  /**
   *  Add typed element to the local registry
   *
   * @param context
   * @param options
   */
  add(context: METADATA_TYPE, options: IEntityOptions | IPropertyOptions | ISchemaOptions | IObjectOptions, trigger: boolean = true) {
    options.metaType = context;
    // find?
    this.metadata.push(options);
    if (this.targets.indexOf(options.target) === -1) {
      this.targets.push(options.target);
    }
    if (context === METATYPE_SCHEMA) {
      if (this.schemas.indexOf(options.name) === -1) {
        this.schemas.push(options.name);
      }
    }

    if (trigger) {
      this.emit(C_EVENT_ADD, context, options);
    }

    return options;
  }


  remove(context: METADATA_TYPE, c: (x: any) => boolean, trigger: boolean = true) {
    const remove = _.remove(this.metadata, x => x.metaType === context && c(x));
    if (!_.isEmpty(remove) && trigger) {
      this.emit(C_EVENT_REMOVE, context, remove);
    }
  }

  // private update(context: METADATA_TYPE) {
  //   this.emit(C_EVENT_UPDATE, {});
  // }

  getByContext<T extends IAbstractOptions>(context: METADATA_TYPE): T[] {
    return <T[]>this.metadata.filter(x =>
      x.metaType === context
    );
  }

  getTargets() {
    return this.targets;
  }

  getByContextAndTarget<T extends IAbstractOptions>(context: METADATA_TYPE, target: CLASS_TYPE): T[] {
    return <T[]>this.metadata.filter(x =>
      x.metaType === context &&
      x.target === target
    );
  }

  getByTarget(target: CLASS_TYPE) {
    return this.metadata.filter(x =>
      x.target === target
    );
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


  find(context: METADATA_TYPE, find: CLASS_TYPE) {
    const lookup = this.createSearchFunction(find);
    return this.metadata.find((x => x.metaType === context && lookup(x)));
  }

  filter(context: METADATA_TYPE, find: CLASS_TYPE) {
    const lookup = this.createSearchFunction(find);
    return this.metadata.filter((x => x.context === context && lookup(x)));
  }

  getMetadata() {
    return this.metadata;
  }

  getSchemas() {
    return _.uniq(this.metadata.filter((x => x.context === METATYPE_SCHEMA)).map(x => x.name));
  }

  getMetadatasForSchema(schema: string) {
    return this.metadata.filter((x => x.context === METATYPE_SCHEMA && x.name === schema));
  }


}
