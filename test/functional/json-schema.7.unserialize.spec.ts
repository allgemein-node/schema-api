import * as _ from 'lodash';
import {suite, test} from '@testdeck/mocha';
import 'reflect-metadata';
import {expect} from 'chai';
import {JsonSchema} from '../../src/lib/json-schema/JsonSchema';
import {IJsonSchema7} from '../../src/lib/metadata/JsonSchema7';
import {IClassRef, isClassRef} from '../../src/api/IClassRef';
import {DEFAULT_NAMESPACE} from '../../src/lib/Constants';
import {IEntityRef, isEntityRef} from '../../src/api/IEntityRef';
import {PlainObject} from './data/classes/PlainObject';
import {inspect} from 'util';

@suite('functional/json-schema-draft-07-unserialize')
class JsonSchemaDraft07UnSerializeSpec {

  @test
  async 'parse json schema and create class ref'() {
    const json: IJsonSchema7 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'ParseSimpleObjectDirect',
      type: 'object',
      properties: {}
    };
    const classRef = await JsonSchema.unserialize(json, {rootAsEntity: false}) as IClassRef;
    expect(isClassRef(classRef)).to.be.true;
    expect(isEntityRef(classRef)).to.be.false;
    expect(classRef.isAnonymous()).to.be.false;
    expect(classRef.name).to.be.eq(json.title);
    expect(classRef.getNamespace()).to.be.eq(DEFAULT_NAMESPACE);
  }


  @test
  async 'parse json schema and create entity ref'() {
    const json: IJsonSchema7 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'ParseSimpleObjectDirect02',
      type: 'object',
      properties: {}
    };
    const classRef = await JsonSchema.unserialize(json, {rootAsEntity: true}) as IEntityRef;
    expect(isClassRef(classRef)).to.be.false;
    expect(isEntityRef(classRef)).to.be.true;
    expect(classRef.getClassRef().isAnonymous()).to.be.false;
    expect(classRef.name).to.be.eq(json.title);
    expect(classRef.getNamespace()).to.be.eq(DEFAULT_NAMESPACE);
  }

  @test
  async 'parse json schema and create unnamed class ref'() {
    const json: IJsonSchema7 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {}
    };
    const classRef = await JsonSchema.unserialize(json, {rootAsEntity: true}) as IClassRef;
    expect(isEntityRef(classRef)).to.be.false;
    expect(isClassRef(classRef)).to.be.true;
    expect(classRef.isAnonymous()).to.be.true;
    expect(classRef.name).to.be.eq('anonymous');
    expect(classRef.getNamespace()).to.be.eq(DEFAULT_NAMESPACE);
  }

  @test
  async 'parse json schema with $ref key and create entity ref'() {
    const json: IJsonSchema7 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $ref: '#/definitions/ParseSimpleObjectDirect03',
      definitions: {
        ParseSimpleObjectDirect03: {
          type: 'object',
          properties: {}
        }
      }
    };
    const classRef = await JsonSchema.unserialize(json) as IEntityRef;
    expect(isEntityRef(classRef)).to.be.true;
    expect(isClassRef(classRef)).to.be.false;
    expect(classRef.name).to.be.eq('ParseSimpleObjectDirect03');
    expect(classRef.getClassRef().getNamespace()).to.be.eq(DEFAULT_NAMESPACE);
  }


  @test
  async 'parse json schema with internal allOf reference (as array)'() {
    const json: IJsonSchema7 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $ref: '#/definitions/ParseSimpleExtendedObject',
      definitions: {
        ExtendingObject: {
          type: 'object',
          properties: {}
        },
        ParseSimpleExtendedObject: {
          type: 'object',
          properties: {},
          allOf: [{$ref: '#/definitions/ExtendingObject'}]
        }
      }
    };
    const classRef = await JsonSchema.unserialize(json) as IEntityRef;
    expect(isEntityRef(classRef)).to.be.true;
    expect(isClassRef(classRef)).to.be.false;
    expect(classRef.name).to.be.eq('ParseSimpleExtendedObject');
    expect(classRef.getClassRef().getNamespace()).to.be.eq(DEFAULT_NAMESPACE);
    expect(classRef.getClassRef().getExtends()).to.have.length(1);

    const extendedClassRef = _.first(classRef.getClassRef().getExtends());
    expect(isEntityRef(extendedClassRef)).to.be.false;
    expect(isClassRef(extendedClassRef)).to.be.true;
    expect(extendedClassRef.name).to.be.eq('ExtendingObject');
    expect(extendedClassRef.getNamespace()).to.be.eq(DEFAULT_NAMESPACE);
    expect(extendedClassRef.getExtends()).to.have.length(0);
  }

  @test
  async 'parse json schema for simple class with primitive properties as class ref'() {
    const json: IJsonSchema7 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        'stringValue': {
          'type': 'string'
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
        'arrValue': {
          'type': 'array'
        },
        'objArrValue': {
          'type': 'array',
          'items': {
            type: 'object'
          }
        },
        'objValue': {
          'type': 'object'
        }
      }
    };
    const classRef = await JsonSchema.unserialize(json) as IClassRef;
    expect(isEntityRef(classRef)).to.be.false;
    expect(isClassRef(classRef)).to.be.true;
    expect(classRef.name).to.be.eq('anonymous');
    expect(classRef.getNamespace()).to.be.eq(DEFAULT_NAMESPACE);
    const properties = classRef.getPropertyRefs();
    expect(properties).to.have.length(7);

    const names = properties.map(x => x.name);
    expect(names).to.deep.eq([
      'stringValue', 'boolValue', 'dateValue', 'numericValue', 'arrValue', 'objArrValue', 'objValue'
    ]);


    let property = properties.find(x => x.name === 'stringValue');
    let type = property.getType();
    expect(type).to.be.eq('string');
    console.log(inspect(property, false, 10));

    property = properties.find(x => x.name === 'boolValue');
    expect(property.getType()).to.be.eq('boolean');
    console.log(inspect(property, false, 10));

    property = properties.find(x => x.name === 'dateValue');
    expect(property.getType()).to.be.eq('date');
    console.log(inspect(property, false, 10));

    property = properties.find(x => x.name === 'numericValue');
    expect(property.getType()).to.be.eq('number');
    console.log(inspect(property, false, 10));

    property = properties.find(x => x.name === 'arrValue');
    type = property.getType();
    expect(type).to.be.eq('object');
    console.log(inspect(property, false, 10));

    property = properties.find(x => x.name === 'objArrValue');
    type = property.getType();
    expect(type).to.be.eq('object');
    console.log(inspect(property, false, 10));

    property = properties.find(x => x.name === 'objValue');
    type = property.getType();
    expect(type).to.be.eq('object');
    console.log(inspect(property, false, 10));

  }

  @test.skip
  async 'parse json schema for simple class with primitive properties as entity ref'() {


  }

  @test.skip
  async 'parse json schema for simple class with reference properties '() {


  }

  @test.skip
  async 'parse json schema for simple class with properties in inherited class'() {


  }

  @test.skip
  async 'parse json schema with ref to follow files'() {


  }

  @test.skip
  async 'parse json schema with ref to follow http'() {


  }


  @test.skip
  async 'parse json schema with in namespace with already existing class name'() {


  }
}
