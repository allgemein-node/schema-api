import 'reflect-metadata';
import {suite, test} from '@testdeck/mocha';
import {expect} from 'chai';
import {JsonSchema} from '../../src/lib/json-schema/JsonSchema';
import {IEntityRef} from '../../src/api/IEntityRef';
import '../../src/decorators/validate';
import {FileUtils} from '@allgemein/base';
import {join} from 'path';
import {inspect} from 'util';

@suite('functional/json-schema-draft-07 - cardinality')
class JsonSchemaDraft07SerializationSpec {


  @test
  async 'parse schema with arrays'() {
    const jsonSchema = FileUtils.getJsonSync(join(__dirname, 'data', 'json', 'config.schema.json'));

    const serializer = JsonSchema.getUnserializer({className: 'Config'});
    let parsed = await serializer.unserialize(jsonSchema) as IEntityRef;

    const out = JsonSchema.serialize(parsed);
    // console.log(inspect(out.definitions.Libs, false, 10));
    expect(out.definitions.Libs).to.be.deep.eq({
      title: 'Libs',
      type: 'object',
      properties: {
        topic: {type: 'string'},
        refs: {type: 'array', items: {type: 'string'}}
      }
    });
  }


}
