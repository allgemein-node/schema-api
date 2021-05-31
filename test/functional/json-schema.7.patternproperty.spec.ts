import 'reflect-metadata';
import {suite, test} from '@testdeck/mocha';
import {expect} from 'chai';
import {JsonSchema} from '../../src/lib/json-schema/JsonSchema';
import {IEntityRef} from '../../src/api/IEntityRef';
import {IJsonSchema7} from '../../src/lib/json-schema/JsonSchema7';
import '../../src/decorators/validate';

@suite('functional/json-schema-draft-07 pattern property')
class JsonSchemaDraft07SerializationSpec {


  @test
  async 'parse simple pattern property'() {
    const jsonSchema: IJsonSchema7 = {
      '$schema': 'http://json-schema.org/draft-07/schema#',
      definitions: {
        ParsePatternProp: {
          '$id': '#ParsePatternProp',
          title: 'ParsePatternProp',
          type: 'object',
          properties: {
            strValue: {type: 'string'},
          },
          patternProperties: {
            '^S_': {
              type: 'string'
            }
          }
        }
      },
      $ref: '#/definitions/ParsePatternProp'
    };

    const serializer = JsonSchema.getUnserializer();
    let first = await serializer.unserialize(jsonSchema) as IEntityRef;
    const properties = first.getPropertyRefs();
    expect(properties[0].isPattern()).to.be.false;
    expect(properties[1].isPattern()).to.be.true;

    const out = JsonSchema.serialize(first);
    expect(out).to.be.deep.eq(jsonSchema);
  }


  @test
  async 'parse pattern property with object'() {
    const jsonSchema: IJsonSchema7 = {
      '$schema': 'http://json-schema.org/draft-07/schema#',
      definitions: {
        ParsePatternObject: {
          '$id': '#ParsePatternObject',
          title: 'ParsePatternObject',
          type: 'object',
          properties: {
            strValue: {type: 'string'},
          },
          patternProperties: {
            '^E_': {
              $ref: '#/definitions/EmbeddedObject'
            }
          }
        },
        EmbeddedObject: {
          title: 'EmbeddedObject',
          type: 'object',
          properties: {
            pValue: {type: 'string'},
          }
        }

      },
      $ref: '#/definitions/ParsePatternObject'
    };

    const serializer = JsonSchema.getUnserializer();
    let first = await serializer.unserialize(jsonSchema) as IEntityRef;
    const properties = first.getPropertyRefs();
    const property = properties.filter(x => x.isPattern()).shift();
    expect(property).to.not.be.null;
    expect(property.isPattern()).to.be.true;
    expect(property.name).to.be.eq('^E_');

    const out = JsonSchema.serialize(first);
    expect(out).to.be.deep.eq(jsonSchema);
  }

}
