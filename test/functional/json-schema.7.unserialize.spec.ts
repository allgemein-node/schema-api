import * as _ from 'lodash';
import {suite, test} from '@testdeck/mocha';
import 'reflect-metadata';
import {expect} from 'chai';
import {JsonSchema} from '../../src/lib/json-schema/JsonSchema';
import {IJsonSchema7} from '../../src/lib/metadata/JsonSchema7';
import {IClassRef, isClassRef} from '../../src/api/IClassRef';
import {DEFAULT_NAMESPACE} from '../../src/lib/Constants';
import {IEntityRef, isEntityRef} from '../../src/api/IEntityRef';

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

    property = properties.find(x => x.name === 'boolValue');
    expect(property.getType()).to.be.eq('boolean');

    property = properties.find(x => x.name === 'dateValue');
    expect(property.getType()).to.be.eq('date');

    property = properties.find(x => x.name === 'numericValue');
    expect(property.getType()).to.be.eq('number');

    property = properties.find(x => x.name === 'arrValue');
    type = property.getType();
    expect(type).to.be.eq('object');

    property = properties.find(x => x.name === 'objArrValue');
    type = property.getType();
    expect(type).to.be.eq('object');

    property = properties.find(x => x.name === 'objValue');
    type = property.getType();
    expect(type).to.be.eq('object');

  }

  @test
  async 'parse json schema for simple class with primitive properties as entity ref'() {
    const json: IJsonSchema7 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'SimpleEntityWitProps',
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
    expect(isEntityRef(classRef)).to.be.true;
    expect(isClassRef(classRef)).to.be.false;
    expect(classRef.name).to.be.eq(json.title);
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

    property = properties.find(x => x.name === 'boolValue');
    expect(property.getType()).to.be.eq('boolean');

    property = properties.find(x => x.name === 'dateValue');
    expect(property.getType()).to.be.eq('date');

    property = properties.find(x => x.name === 'numericValue');
    expect(property.getType()).to.be.eq('number');

    property = properties.find(x => x.name === 'arrValue');
    type = property.getType();
    expect(type).to.be.eq('object');

    property = properties.find(x => x.name === 'objArrValue');
    type = property.getType();
    expect(type).to.be.eq('object');

    property = properties.find(x => x.name === 'objValue');
    type = property.getType();
    expect(type).to.be.eq('object');

  }

  @test
  async 'parse json schema for simple class with reference properties '() {
    const json: IJsonSchema7 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $ref: '#/definitions/ParseSimpleObjWithRef',
      definitions: {
        RefObj: {
          type: 'object',
          properties: {}
        },
        ParseSimpleObjWithRef: {
          type: 'object',
          properties: {
            ref: {
              $ref: '#/definitions/RefObj'
            }
          }
        }
      }
    };
    const classRef = await JsonSchema.unserialize(json) as IEntityRef;
    expect(isEntityRef(classRef)).to.be.true;
    expect(isClassRef(classRef)).to.be.false;
    expect(classRef.name).to.be.eq('ParseSimpleObjWithRef');
    expect(classRef.getClassRef().getNamespace()).to.be.eq(DEFAULT_NAMESPACE);
    const properties = classRef.getPropertyRefs();
    expect(properties).to.have.length(1);

    const property = _.first(properties);
    expect(isClassRef(property.getType())).to.be.true;
    expect(isClassRef(property.getTargetRef())).to.be.true;
    expect(property.isReference()).to.be.true;
    expect(property.getTargetRef().name).to.be.eq('RefObj');
  }

  @test
  async 'parse json schema for simple class with properties in inherited class'() {
    const json: IJsonSchema7 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $ref: '#/definitions/ParseSimpleExtendedObjectWithExtProp',
      definitions: {
        ExtendingObjectWithProp: {
          type: 'object',
          properties: {
            'stringValue': {
              'type': 'string'
            }
          }
        },
        ParseSimpleExtendedObjectWithExtProp: {
          type: 'object',
          properties: {},
          allOf: [{$ref: '#/definitions/ExtendingObjectWithProp'}]
        }
      }
    };
    const classRef = await JsonSchema.unserialize(json) as IEntityRef;
    expect(isEntityRef(classRef)).to.be.true;
    expect(isClassRef(classRef)).to.be.false;
    expect(classRef.name).to.be.eq('ParseSimpleExtendedObjectWithExtProp');
    expect(classRef.getClassRef().getNamespace()).to.be.eq(DEFAULT_NAMESPACE);
    expect(classRef.getClassRef().getExtends()).to.have.length(1);
    let properties = classRef.getClassRef().getPropertyRefs();
    expect(properties).to.have.length(1);
    expect(_.first(properties).name).to.be.eq('stringValue');
    expect(_.first(properties).getType()).to.be.eq('string');

    const extendedClassRef = _.first(classRef.getClassRef().getExtends());
    expect(isEntityRef(extendedClassRef)).to.be.false;
    expect(isClassRef(extendedClassRef)).to.be.true;
    expect(extendedClassRef.name).to.be.eq('ExtendingObjectWithProp');
    expect(extendedClassRef.getNamespace()).to.be.eq(DEFAULT_NAMESPACE);
    expect(extendedClassRef.getExtends()).to.have.length(0);
    properties = extendedClassRef.getPropertyRefs();
    expect(properties).to.have.length(1);
    expect(_.first(properties).name).to.be.eq('stringValue');
    expect(_.first(properties).getType()).to.be.eq('string');
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


  @test.skip
  async 'parse json schema with unknown options for class ref'() {


  }

  @test.skip
  async 'parse json schema with unknown options for entity ref'() {


  }

  @test.skip
  async 'parse json schema with unknown options for properties'() {


  }
}
