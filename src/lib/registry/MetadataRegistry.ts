import {assign, defaults, isEmpty, isFunction, keys, merge, remove, uniq} from 'lodash';

/**
 * Handler for metadata
 */
import {
  C_EVENT_ADD,
  C_EVENT_REMOVE,
  CLASS_TYPE, K_TRIGGERED,
  METADATA_REGISTRY,
  METADATA_TYPE,
  METATYPE_PROPERTY,
  METATYPE_SCHEMA
} from './../Constants';
import {IEntityOptions} from './../options/IEntityOptions';
import {IPropertyOptions} from './../options/IPropertyOptions';
import {ISchemaOptions} from './../options/ISchemaOptions';
import {IObjectOptions} from './../options/IObjectOptions';
import {MetadataStorage} from '@allgemein/base';
import {EventEmitter} from 'events';
import {IAbstractOptions} from '../options/IAbstractOptions';
import {IAttributeOptions} from '../options/IAttributeOptions';

/**
 * Registry for metadata of classes and there properties
 */
export class MetadataRegistry extends EventEmitter {

  private static INC = 0;

  private static $self: MetadataRegistry;

  private readonly metadata: IAbstractOptions[] = [];

  private readonly cached: IAbstractOptions[] = [];

  private schemas: string[] = [];

  private targets: any[] = [];


  constructor() {
    super();
    this.setMaxListeners(1000);
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
  add(context: METADATA_TYPE | string,
      options: IEntityOptions | IPropertyOptions | ISchemaOptions | IObjectOptions | IAttributeOptions,
      trigger: boolean = true) {
    options.metaType = context;

    // find?
    const id = MetadataRegistry.INC++;
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
      Object.defineProperty(options, K_TRIGGERED, {value: true});
      this.notify(C_EVENT_ADD, context, options);
    }

    return options;
  }

  addCached(context: METADATA_TYPE | string,
            options: IEntityOptions | IPropertyOptions | ISchemaOptions | IObjectOptions | IAttributeOptions) {
    options.metaType = context;
    this.cached.push(options);
    return options;
  }

  notify(eventName: string, context: string, options: any) {
    this.emit(eventName, context, options);
  }


  remove(context: METADATA_TYPE | string, c: (x: any) => boolean, trigger: boolean = true) {
    const removed = remove(this.metadata, x => x.metaType === context && c(x));
    if (!isEmpty(removed) && trigger) {
      this.notify(C_EVENT_REMOVE, context, removed);
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


  getByContextAndTarget<T extends IAbstractOptions>(context: METADATA_TYPE | string,
                                                    target: CLASS_TYPE | string,
                                                    attributes: 'merge' | 'assign' | 'defaults' = null,
                                                    propertyName?: string): T[] {
    const data = <T[]>this.metadata.filter(x =>
      x.metaType === context &&
      x.target === target &&
      (propertyName ? x.propertyName === propertyName : true)
    );
    if (attributes && !isEmpty(data)) {
      this.mergeAttributes(context, target, data, attributes);
    }
    return data;
  }


  mergeAttributes(context: METADATA_TYPE | string,
                  target: CLASS_TYPE | string,
                  data: IPropertyOptions | IEntityOptions | IObjectOptions | ISchemaOptions,
                  mode: 'merge' | 'assign' | 'defaults' = null) {
    let attributes: IAttributeOptions[] = [];
    if (context === METATYPE_PROPERTY) {
      // merge with properties
      attributes = this.getAttributesForTargetProperties(context, target);
    } else {
      attributes = this.getAttributesForTarget(context, target);
    }

    for (const attribute of attributes) {
      let toExtend = null;
      if (attribute.propertyName) {
        toExtend = data.find((x: IPropertyOptions) => x.metaType === METATYPE_PROPERTY && x.propertyName === attribute.propertyName);
      } else {
        toExtend = data.find((x: IAbstractOptions) => x.metaType === context);
      }
      if (toExtend) {
        switch (mode) {
          case 'assign':
            assign(toExtend, attribute.attributes);
            break;
          case 'merge':
            merge(toExtend, attribute.attributes);
            break;
          case 'defaults':
            defaults(toExtend, attribute.attributes);
            break;
        }

      }
    }
  }

  getAttributesForTarget<T extends IAttributeOptions>(context: METADATA_TYPE | string,
                                                      target: CLASS_TYPE | string): T[] {
    return <T[]>this.metadata.filter((x: IAttributeOptions) =>
      x.targetTypes &&
      !x.propertyName &&
      x.attributes &&
      x.targetTypes.includes(context) &&
      x.target === target
    );
  }

  getAttributesForTargetProperty<T extends IAttributeOptions>(context: METADATA_TYPE,
                                                              target: CLASS_TYPE,
                                                              propertyName: string): T[] {
    return <T[]>this.metadata.filter((x: IAttributeOptions) =>
      x.targetTypes &&
      x.propertyName === propertyName &&
      x.attributes &&
      x.targetTypes.includes(context) &&
      x.target === target
    );
  }

  getAttributesForTargetProperties<T extends IAttributeOptions>(context: METADATA_TYPE, target: CLASS_TYPE | string): T[] {
    return <T[]>this.metadata.filter((x: IAttributeOptions) =>
      x.targetTypes &&
      x.propertyName &&
      x.attributes &&
      x.targetTypes.includes(context) &&
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
    if (!isFunction(find)) {
      const _keys = keys(find);
      lookup = (x: any) => {
        return _keys.map(k => find[k] === x[k]).reduce((previousValue, currentValue) => previousValue && currentValue);
      };
    }
    return lookup;
  }


  find(context: METADATA_TYPE | string, find: CLASS_TYPE) {
    const lookup = this.createSearchFunction(find);
    return this.metadata.find((x => x.metaType === context && lookup(x)));
  }


  findCached(context: METADATA_TYPE | string, find: CLASS_TYPE) {
    const lookup = this.createSearchFunction(find);
    return this.cached.find((x => x.metaType === context && lookup(x)));
  }


  filter(context: METADATA_TYPE | string, find: CLASS_TYPE) {
    const lookup = this.createSearchFunction(find);
    return this.metadata.filter((x => x.context === context && lookup(x)));
  }

  getMetadata() {
    return this.metadata;
  }


  getCached() {
    return this.cached;
  }

  getSchemas() {
    return uniq(this.metadata.filter((x => x.context === METATYPE_SCHEMA)).map(x => x.name));
  }

  getMetadatasForSchema(schema: string) {
    return this.metadata.filter((x => x.context === METATYPE_SCHEMA && x.name === schema));
  }


}
