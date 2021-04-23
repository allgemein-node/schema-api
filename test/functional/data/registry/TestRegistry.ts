import {DefaultNamespacedRegistry} from '../../../../src/lib/registry/DefaultNamespacedRegistry';
import {IEntityOptions} from '../../../../src/lib/options/IEntityOptions';
import {TestEntityRef} from './TestEntityRef';
import {IPropertyOptions} from '../../../../src/lib/options/IPropertyOptions';
import * as _ from 'lodash';
import {TestPropertyRef} from './TestPropertyRef';

export class TestRegistry extends DefaultNamespacedRegistry {
  /**
   * Create default entity reference
   *
   * @param options
   */
  createEntityForOptions(options: IEntityOptions): TestEntityRef {
    options.namespace = this.namespace;
    const entityRef = new TestEntityRef(options);
    return this.add(entityRef.metaType, entityRef);
  }

  /**
   * Create default property reference
   *
   * @param options
   */
  createPropertyForOptions(options: IPropertyOptions): TestPropertyRef {
    if (_.keys(options).length === 0) {
      throw new Error('cant create property for emtpy options');
    }
    options.namespace = this.namespace;

    const prop = new TestPropertyRef(options);
    return this.add(prop.metaType, prop);
  }

}
