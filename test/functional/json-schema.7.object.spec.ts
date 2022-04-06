import 'reflect-metadata';
import {suite, test} from '@testdeck/mocha';
import {expect} from 'chai';
import {JsonSchema} from '../../src/lib/json-schema/JsonSchema';
import {PlainObject} from './data/classes/PlainObject';
import {ExtendedObject} from './data/classes/ExtendedObject';
import {ObjectWithInitProp} from './data/classes/ObjectWithInitProp';
import '../../src/decorators/validate';
import {ObjectWithEmptyProps} from "./data/classes/ObjectWithEmptyProps";
import {T_STRING} from "../../src";

@suite('functional/json-schema-draft-07 - plain objects')
class JsonSchemaDraft07SerializationSpec {


  /**
   * Generate json schema for simple plain object without properties.
   */
  @test
  async 'generate json schema for simple plain object without properties'() {
    const schema = JsonSchema.serialize(PlainObject);
    expect(schema).to.be.deep.eq({
      $ref: '#/definitions/PlainObject',
      $schema: 'http://json-schema.org/draft-07/schema#',
      definitions: {
        PlainObject: {
          type: 'object',
          title: 'PlainObject',
          properties: {}
        }
      }
    });
  }


  /**
   * Generate json schema for simple plain object without properties.
   */
  @test
  async 'generate json schema for simple plain object without properties and attach target'() {
    const schema = JsonSchema.serialize(PlainObject, {appendTarget: true});
    expect(schema).to.be.deep.eq({
      $ref: '#/definitions/PlainObject',
      $schema: 'http://json-schema.org/draft-07/schema#',
      definitions: {
        PlainObject: {
          type: 'object',
          title: 'PlainObject',
          $target: PlainObject,
          properties: {}
        }
      }
    });
  }

  @test
  async 'generate simple schema for extended object'() {
    const schema = JsonSchema.serialize(ExtendedObject);
    expect(schema).to.be.deep.eq({
        $ref: '#/definitions/ExtendedObject',
        $schema: 'http://json-schema.org/draft-07/schema#',
        definitions: {
          ExtendedObject: {
            type: 'object',
            title: 'ExtendedObject',
            // $target: ExtendedObject,
            properties: {},
            allOf: [{$ref: '#/definitions/PlainObject'}]
          },
          PlainObject: {
            type: 'object',
            title: 'PlainObject',
            // $target: PlainObject,
            properties: {},
          }
        }
      }
    );
  }


  @test
  async 'generate schema for class with properties'() {
    const schema = JsonSchema.serialize(ObjectWithInitProp);
    expect(schema).to.be.deep.eq({
      '$ref': '#/definitions/ObjectWithInitProp',
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'definitions': {
        'ObjectWithInitProp': {
          'properties': {
            'arrValue': {
              'default': [],
              'items': {
                'type': 'object'
              },
              'type': 'array'
            },
            'boolValue': {
              'default': false,
              'type': 'boolean'
            },
            'dateValue': {
              'default': '2021-02-01T00:01:01.000Z',
              'format': 'date-time',
              'type': 'string'
            },
            'numericValue': {
              'default': 123,
              'type': 'number'
            },
            'objArrValue': {
              'default': [],
              'items': {
                'type': 'object'
              },
              'type': 'array'
            },
            'objValue': {
              'default': {},
              'type': 'object'
            },
            'plainObjArrValue': {
              'default': [],
              'items': {
                'type': 'object'
              },
              'type': 'array'
            },
            'plainObjValue': {
              '$ref': '#/definitions/PlainObject',
              'default': {},
            },
            'stringValue': {
              'default': 'string',
              'type': 'string'
            }
          },
          'title': 'ObjectWithInitProp',
          'type': 'object'
        },
        'PlainObject': {
          'properties': {},
          'title': 'PlainObject',
          'type': 'object'
        }
      }
    });
  }


  @test
  async 'use default settings for undetectable types'() {
    const schema = JsonSchema.serialize(ObjectWithEmptyProps, {ignoreUnknownType: false, defaultTypeHint: T_STRING});
    expect(schema).to.be.deep.eq({
      "$ref": "#/definitions/ObjectWithEmptyProps",
      "$schema": "http://json-schema.org/draft-07/schema#",
      "definitions": {
        "ObjectWithEmptyProps": {
          "properties": {
            "nullDefined": {
              "type": "string"
            },
            "nullNull": {
              "type": "string"
            },
            "nullUndefined": {
              "type": "undefined"
            },
            "undefinedDefined": {
              "type": "undefined"
            }
          },
          "title": "ObjectWithEmptyProps",
          "type": "object"
        }
      }
    });
  }


  @test
  async 'serialize only decorated values'() {
    const schema = JsonSchema.serialize(ObjectWithEmptyProps, {onlyDecorated: true});
    expect(schema).to.be.deep.eq(
      {
        "$ref": "#/definitions/ObjectWithEmptyProps",
        "$schema": "http://json-schema.org/draft-07/schema#",
        "definitions": {
          "ObjectWithEmptyProps": {
            "properties": {},
            "title": "ObjectWithEmptyProps",
            "type": "object"
          }
        }
      });
  }

}
