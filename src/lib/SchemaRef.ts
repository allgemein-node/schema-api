import {AbstractRef} from './AbstractRef';
import {ISchemaOptions} from './options/ISchemaOptions';
import {IEntityRef} from './IEntityRef';
import {Binding} from './Binding';
import {XS_TYPE_BINDING_SCHEMA_CLASS_REF, XS_TYPE_PROPERTY} from './Constants';
import {IClassRef} from './IClassRef';
import {IPropertyRef} from './IPropertyRef';

export class SchemaRef extends AbstractRef {


  constructor(options: ISchemaOptions = {name: 'default'}) {
    super('schema', options.name, null);
  }

  id() {
    return this.name.toLowerCase();
  }


  getEntity(name: string): IEntityRef {
    // TODO cache?
    const binding: Binding = this.getLookupRegistry()
      .find<Binding>(XS_TYPE_BINDING_SCHEMA_CLASS_REF,
        (b: Binding) => b.source === this.name &&
          b.target.className === name && b.target.isEntity);
    if (binding) {
      return binding.target.getEntityRef();
    }
    return null;
  }


  getEntities(): IEntityRef[] {
    return this.getLookupRegistry()
      .filter(XS_TYPE_BINDING_SCHEMA_CLASS_REF, (b: Binding) => {
        return b.source === this.name && (<IClassRef>b.target).isEntity;
      })
      .map((b: Binding) => <IEntityRef>(<IClassRef>b.target).getEntityRef());
    // return LookupRegistry.$().filter(XS_TYPE_ENTITY, (x:EntityDef) => x.schemaName === this.name);
  }

  getStoreableEntities(): IEntityRef[] {
    return this.getEntities().filter((x: IEntityRef) => x.isStoreable());
  }


  getPropertiesFor(fn: Function): IPropertyRef[] {
    return this.getLookupRegistry()
      .filter(XS_TYPE_PROPERTY, (p: IPropertyRef) => p.getSourceRef().getClass() === fn);
  }


  toJson(withEntities: boolean = true, withProperties: boolean = true) {
    const o = super.toJson();
    if (withEntities) {
      o.entities = this.getEntities().map(p => p.toJson(withProperties));
    }
    return o;
  }


}

