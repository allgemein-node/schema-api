import {IAbstractOptions} from '../options/IAbstractOptions';
import {JSONSchema7, JSONSchema7Definition} from 'json-schema';
import {ClassUtils} from '@allgemein/base/browser';
import * as _ from 'lodash';
import {IPropertyOptions} from '../options/IPropertyOptions';

export interface IJSONSchemaOptions {
  /**
   * If multiple schemas
   */
  handleMultipleSchemas: 'reference' | 'clone';
}

export class JsonSchemaConverter {

  static to(entries: IAbstractOptions[]): JSONSchema7[] {
    return null;
  }

  static toJSONSchema(target: Function, entries: IAbstractOptions[], options: IJSONSchemaOptions = {handleMultipleSchemas: 'clone'}): JSONSchema7 | JSONSchema7[] {
    const entitySchema = <JSONSchema7>{
      $schema: '/default',
      $id: '/' + ClassUtils.getClassName(target),
      properties: {}
    };

    const properties = _.filter(entries, x => x.$context === 'property');
    for (const prop of <IPropertyOptions[]>properties) {
      const copyKeys = _.keys(prop).filter(k => ['propertyName', 'target', '$context', 'type'].indexOf(k) === -1);
      const copyPropOptions = {};
      copyKeys.map(k => {
        copyPropOptions[k] = _.clone(prop[k]);
      });

      entitySchema.properties[prop.propertyName] = <JSONSchema7Definition>{
        type: prop.type,
        additionalOptions: copyPropOptions
      };


    }

    const schemas = _.remove(entries, x => x.$context === 'schema');
    if (schemas.length > 0) {
      if (schemas.length === 1) {
        entitySchema.$schema = '/' + schemas[0].name;
      } else {
        if (options.handleMultipleSchemas === 'clone') {
          const entitySchemas = [];
          for (const schema of schemas) {
            const _entitySchema = _.cloneDeep(entitySchema);
            _entitySchema.$schema = '/' + schema.name;
            entitySchemas.push(_entitySchema);
          }
          return entitySchemas;
        } else if (options.handleMultipleSchemas === 'reference') {
          const entitySchemas = [];
          for (const schema of schemas) {
            if (entitySchemas.length === 0) {
              const _entitySchema = _.cloneDeep(entitySchema);
              _entitySchema.$schema = '/' + schema.name;
              entitySchemas.push(_entitySchema);
            } else {
              const _entitySchema = <JSONSchema7>{
                $schema: '/' + schema.name,
                $id: entitySchema.$id,
                $ref: entitySchemas[0].$id
              };
              entitySchemas.push(_entitySchema);
            }
          }
          return entitySchemas;
        }
      }
    }


    return entitySchema;
  }


  static from(schemas: JSONSchema7[]): IAbstractOptions[] {
    return null;
  }
}
