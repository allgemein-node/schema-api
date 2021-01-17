import * as _ from 'lodash';
import {suite, test} from '@testdeck/mocha';
import {EntityMetadataRegistry} from '../../src/lib/EntityMetadataRegistry';
import {inspect} from 'util';
import {JsonSchemaConverter} from '../../src/lib/converter/JsonSchemaConverter';


@suite('functional/schema')
class JsonSchemaSpec {

  static before() {
    require('./schema/simple/SimpleEntity').SimpleEntity;
  }

  /**
   * TODO test the different propery types
   *
   *   | 'string'
   | 'number'
   | 'integer'
   | 'boolean'
   | 'object'
   | 'array'
   | 'null';
   *
   */
  @test
  async 'simple entity to json schema'() {
    const registry = EntityMetadataRegistry.$();
    // const registry = EntityMetadataRegistry.$().getMetadata();
    console.log(inspect(registry.getMetadata(), false, 10));


    const entitySchemas = [];
    const targets = registry.getTargets();
    for (const target of targets) {

      const entries = registry.getByTarget(target);

      const entitySchema = JsonSchemaConverter.toJSONSchema(target, entries);
      if (_.isArray(entitySchema)) {
        entitySchemas.push(...entitySchema);
      } else {
        entitySchemas.push(entitySchema);
      }

    }

    console.log(inspect(entitySchemas, false, 10));

  }

  @test
  async 'interprete json schema as simple entity'() {

  }

  @test
  async 'complex entity with relations to json schema'() {

  }

  @test
  async 'interprete json schema as complex entity'() {

  }

  @test
  async 'entity in multiple schema'() {

  }
}

