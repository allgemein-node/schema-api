import {IEntityRef} from '../../api/IEntityRef';
import {AbstractRef} from '../AbstractRef';
import {IBuildOptions} from '../../api/IBuildOptions';
import {IPropertyRef} from '../../api/IPropertyRef';
import {DEFAULT_NAMESPACE, METATYPE_ENTITY, XS_ID_SEPARATOR} from '../Constants';
import {IEntityOptions} from '../options/IEntityOptions';

export class DefaultEntityRef extends AbstractRef implements IEntityRef {


  constructor(options: IEntityOptions = {}) {
    super(METATYPE_ENTITY, options.name, options.target, options.namespace ? options.namespace : DEFAULT_NAMESPACE);
    this.setOptions(options);
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

}
