import {IEntityRef} from '../../api/IEntityRef';
import {AbstractRef} from '../AbstractRef';
import {IBuildOptions} from '../../api/IBuildOptions';
import {IPropertyRef} from '../../api/IPropertyRef';
import {DEFAULT_NAMESPACE, METADATA_TYPE, METATYPE_ENTITY, METATYPE_PROPERTY, XS_ID_SEPARATOR} from '../Constants';
import {IEntityOptions} from '../options/IEntityOptions';
import {IClassRef} from '../../api/IClassRef';
import {ClassRef} from '../ClassRef';
import {AnnotationsHelper} from '../AnnotationsHelper';
import {ILookupRegistry} from '../../api/ILookupRegistry';
import {RegistryFactory} from './RegistryFactory';
import {ISchemaRef} from '../../api/ISchemaRef';

export class DefaultEntityRef extends AbstractRef implements IEntityRef {


  constructor(options: IEntityOptions = {}) {
    super(METATYPE_ENTITY, options.name, options.target, options.namespace ? options.namespace : DEFAULT_NAMESPACE);
    AnnotationsHelper.merge(this.object, options);
    this.setOptions(options);
  }


  getSchemaRefs(): ISchemaRef[] {
    return this.getRegistry().getSchemaRefsFor(this);
  }

  getRegistry(): ILookupRegistry {
    return RegistryFactory.get(this.namespace);
  }

  build<T>(instance: any, options?: IBuildOptions): T {
    return this.getClassRef().build(instance, options);
  }

  create<T>(): T {
    return this.getClassRef().create();
  }

  getPropertyRef(name: string): IPropertyRef {
    return this.getRegistry().getPropertyRef(this, name);
  }

  getPropertyRefs(): IPropertyRef[] {
    return this.getRegistry().getPropertyRefs(this);
  }

  id(): string {
    return [METATYPE_ENTITY, this.getClassRef().id()].join(XS_ID_SEPARATOR);
  }

  getClassRefFor(object: string | Function | IClassRef, type: METADATA_TYPE): IClassRef {
    return this.getRegistry().getClassRefFor(object, this.metaType);
  }

  isOf(instance: any): boolean {
    return this.getClassRef().isOf(instance);
  }


}
