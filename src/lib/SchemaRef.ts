import {isFunction, isString} from 'lodash';
import {AbstractRef} from './AbstractRef';
import {ISchemaOptions} from './options/ISchemaOptions';
import {METADATA_TYPE, METATYPE_ENTITY, METATYPE_SCHEMA} from './Constants';
import {RegistryFactory} from './registry/RegistryFactory';
import {IClassRef} from '../api/IClassRef';
import {ISchemaRef} from '../api/ISchemaRef';
import {IEntityRef} from '../api/IEntityRef';


export class SchemaRef extends AbstractRef implements ISchemaRef {


  constructor(options: ISchemaOptions = {name: 'default'}) {
    super(METATYPE_SCHEMA, options.name, null);
  }


  id() {
    return this.name.toLowerCase();
  }


  getRegistry() {
    return RegistryFactory.get(this.namespace);
  }


  getClassRefFor(object: string | Function | IClassRef,
                 type: METADATA_TYPE): IClassRef {
    return this.getRegistry().getClassRefFor(object, type);
  }


  getEntityRefFor(value: string | Function): IEntityRef {
    return this.getRegistry()
      .find(METATYPE_ENTITY,
        (b: IEntityRef) => {
          let schemaCheck = false;
          if (isString(value)) {
            schemaCheck = b.name === value;
          } else if (isFunction(value)) {
            schemaCheck = b.getClass() === value;
          }
          if (schemaCheck) {
            let schemas = b.getOptions('schema');
            schemas = schemas ? schemas : [];
            return schemas.includes(this.name);
          }
          return false;
        }
      );
  }


  getEntityRefs(): IEntityRef[] {
    return this.getRegistry()
      .filter(METATYPE_ENTITY,
        (b: IEntityRef) => {
          let schemas = b.getOptions('schema');
          schemas = schemas ? schemas : [];
          return schemas.includes(this.name);
        }
      );
  }


  // getPropertiesFor(fn: Function): IPropertyRef[] {
  //   return this.getLookupRegistry()
  //     .filter(METATYPE_PROPERTY, (p: IPropertyRef) => p.getSourceRef().getClass() === fn);
  // }


}

