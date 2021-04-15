import {suite, test} from '@testdeck/mocha';
import {expect} from 'chai';
import 'reflect-metadata';
import {JsonSchema} from '../../src/lib/json-schema/JsonSchema';
import {ClassRef} from '../../src/lib/ClassRef';

@suite('functional/json-schema-helper')
class JsonSchemaHelperSpec {

  /**
   * Generate json schema for simple plain object without properties.
   */
  @test
  async 'detect json schema version'() {
    let schema = JsonSchema.detectSchemaVersion({$schema: 'http://json-schema.org/draft/2019-09/schema#'});
    expect(schema).to.be.deep.eq('draft/2019-09');

    schema = JsonSchema.detectSchemaVersion({$schema: 'http://json-schema.org/draft-07/schema#'});
    expect(schema).to.be.deep.eq('draft-07');

    schema = JsonSchema.detectSchemaVersion({$schema: 'http://json-schema.org/draft-06/schema#'});
    expect(schema).to.be.deep.eq('draft-06');

    schema = JsonSchema.detectSchemaVersion({$schema: 'http://json-schema.org/draft-04/schema#'});
    expect(schema).to.be.deep.eq('draft-04');
  }


  /**
   * Generate json schema for simple plain object without properties.
   */
  @test
  async 'check anonymus functions'() {
      // const ref = ClassRef.get(new Function());


  }

}

