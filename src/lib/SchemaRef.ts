import {AbstractRef} from './AbstractRef';
import {ISchemaOptions} from './options/ISchemaOptions';
import {METATYPE_SCHEMA} from './Constants';


export class SchemaRef extends AbstractRef<ISchemaOptions> {


  constructor(options: ISchemaOptions = {name: 'default'}) {
    super(METATYPE_SCHEMA, options.name, null);
  }

  id() {
    return this.name.toLowerCase();
  }

  //
  // getEntity(name: string): IEntityRef {
  //   // TODO cache?
  //   const binding: Binding = this.getLookupRegistry()
  //     .find<Binding>(BINDING_SCHEMA_ENTITY,
  //       (b: Binding) =>
  //         b.source === this.name &&
  //         b.target.className === name);
  //   if (binding) {
  //     return binding.target.getEntityRef();
  //   }
  //   return null;
  // }
  //
  //
  // getEntities(): IEntityRef[] {
  //   return this.getLookupRegistry()
  //     .filter(BINDING_SCHEMA_ENTITY, (b: Binding) => {
  //       return b.source === this.name;
  //     })
  //     .map((b: Binding) => <IEntityRef>(b.target));
  //   // return LookupRegistry.$().filter(METATYPE_ENTITY, (x:EntityDef) => x.schemaName === this.name);
  // }
  //
  //
  // getPropertiesFor(fn: Function): IPropertyRef[] {
  //   return this.getLookupRegistry()
  //     .filter(METATYPE_PROPERTY, (p: IPropertyRef) => p.getSourceRef().getClass() === fn);
  // }


}

