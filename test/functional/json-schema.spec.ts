import {suite, test} from '@testdeck/mocha';
import {PlainObject} from './data/classes/PlainObject';
import {expect} from 'chai';
import {JsonSchemaSerializer} from '../../src/lib/converter/JsonSchemaSerializer';
import 'reflect-metadata';
import {ExtendedObject} from './data/classes/ExtendedObject';
import {ObjectWithInitProp} from './data/classes/ObjectWithInitProp';
import {ClassRef} from '../../src/lib/ClassRef';
import {AnnotatedPrimatives2} from './data/classes/AnnotatedPrimatives';
import {inspect} from 'util';

@suite('functional/json-schema')
class JsonSchemaSpec {

  /**
   * Generate json schema for simple plain object without properties.
   */
  @test
  async 'generate json schema for simple plain object without properties'() {
    const serializer = new JsonSchemaSerializer();
    const schema = serializer.serialize(PlainObject);
    expect(schema).to.be.deep.eq({
      '$ref': '#/definitions/PlainObject',
      '$schema': 'http://json-schema.org/draft-07/schema#',
      definitions: {
        PlainObject: {type: 'object', '$target': PlainObject, properties: {}}
      }
    });
  }


  /**
   * Generate json schema for extend object
   */
  @test
  async 'generate simple schema for extended object'() {
    const serializer = new JsonSchemaSerializer();
    const schema = serializer.serialize(ExtendedObject);
    expect(schema).to.be.deep.eq({
        '$ref': '#/definitions/ExtendedObject',
        '$schema': 'http://json-schema.org/draft-07/schema#',
        definitions: {
          ExtendedObject: {
            type: 'object',
            $target: ExtendedObject,
            properties: {},
            allOf: [{$ref: '#/definitions/PlainObject'}]
          },
          PlainObject: {
            type: 'object',
            $target: PlainObject,
            properties: {},
          }

        }
      }
    );
  }


  /**
   * Generate json schema for extend object
   */
  @test
  async 'generate schema for class with properties'() {
    const serializer = new JsonSchemaSerializer();
    const schema = serializer.serialize(ObjectWithInitProp);
    expect(schema).to.be.deep.eq({
      '$ref': '#/definitions/ObjectWithInitProp',
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'definitions': {
        'ObjectWithInitProp': {
          '$target': ObjectWithInitProp,
          'properties': {
            'arrValue': {
              'type': 'array'
            },
            'boolValue': {
              'type': 'boolean',
            },
            'dateValue': {
              'format': 'date-time',
              'type': 'string'
            },
            'numericValue': {
              'type': 'number'
            },
            'objArrValue': {
              'type': 'array'
            },
            'objValue': {
              'type': 'object'
            },
            'plainObjArrValue': {
              'type': 'array'
            },
            'plainObjValue': {
              '$target': PlainObject,
              'type': 'object',
              $ref: '#/definitions/PlainObject'
            },
            'stringValue': {
              'type': 'string'
            },
          },
          'type': 'object'
        }
      }
    });
  }


  /**
   * Generate json schema for extend object
   */
  @test
  async 'generate schema for annotated class ref with primative properties'() {
    const serializer = new JsonSchemaSerializer();
    const ref = ClassRef.get(AnnotatedPrimatives2);

    const schema = serializer.serialize(ref);
    console.log(inspect(schema, false, 10));
    expect(schema).to.be.deep.eq({
      '$schema': 'http://json-schema.org/draft-07/schema#',
      '$ref': '#/definitions/AnnotatedPrimatives2',
      'definitions': {
        'AnnotatedPrimatives2': {
          '$target': ref,
          'properties': {
            'boolValue': {
              'type': 'boolean'
            },
            'dateValue': {
              'format': 'date-time',
              'type': 'string'
            },
            'nullValue': {
              'type': 'string'
            },
            'numberValue': {
              'type': 'number'
            },
            'strValue': {
              'type': 'string'
            }
          },
          'type': 'object'
        }
      }
    });
  }
}

