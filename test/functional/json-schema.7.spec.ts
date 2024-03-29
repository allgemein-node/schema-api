import * as _ from 'lodash';
import 'reflect-metadata';
import {suite, test} from '@testdeck/mocha';
import {expect} from 'chai';
import {JsonSchema} from '../../src/lib/json-schema/JsonSchema';
import {IClassRef, isClassRef} from '../../src/api/IClassRef';
import {DEFAULT_NAMESPACE, METATYPE_CLASS_REF, METATYPE_ENTITY, METATYPE_PROPERTY} from '../../src/lib/Constants';
import {IEntityRef, isEntityRef} from '../../src/api/IEntityRef';
import {PlainObject} from './data/classes/PlainObject';
import {ExtendedObject} from './data/classes/ExtendedObject';
import {ObjectWithInitProp} from './data/classes/ObjectWithInitProp';
import {ClassRef} from '../../src/lib/ClassRef';
import {AnnotatedPrimatives2} from './data/classes/AnnotatedPrimatives';
import {IJsonSchema7} from '../../src/lib/json-schema/JsonSchema7';
import {Validator} from '../../src/lib/validation/Validator';
import '../../src/decorators/validate';
import {ExtendedObject2} from './data/classes/ExtendedObject2';
import {IPropertyRef, Property, RegistryFactory} from '../../src';
import {PlainObject04} from './data/classes/PlainObject04';
import {isPropertyRef} from '../../src/api/IPropertyRef';

@suite('functional/json-schema-draft-07')
class JsonSchemaDraft07SerializationSpec {

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
      'stringValue',
      'boolValue', 'dateValue', 'numericValue', 'arrValue', 'objArrValue', 'objValue'
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


  @test
  async 'parse json schema with in namespace with already existing class name'() {
    const json: IJsonSchema7 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'Car',
      type: 'object',
      properties: {
        label: {
          type: 'string'
        }
      }
    };
    const classRefFirst = await JsonSchema.unserialize(json, {rootAsEntity: false}) as IClassRef;
    expect(isClassRef(classRefFirst)).to.be.true;
    expect(classRefFirst.name).to.be.eq(json.title);
    expect(classRefFirst.getNamespace()).to.be.eq(DEFAULT_NAMESPACE);

    let classRefs = classRefFirst.getRegistry().filter(METATYPE_CLASS_REF, (x: IClassRef) => x.name === 'Car');
    expect(classRefs).to.have.length(1);

    const classRefSecond = await JsonSchema.unserialize(json, {
      rootAsEntity: false,
      forceClassRefCreation: false
    }) as IClassRef;
    expect(isClassRef(classRefSecond)).to.be.true;
    expect(classRefSecond.name).to.be.eq(json.title);
    expect(classRefSecond.getNamespace()).to.be.eq(DEFAULT_NAMESPACE);

    classRefs = classRefFirst.getRegistry().filter(METATYPE_CLASS_REF, (x: IClassRef) => x.name === 'Car');
    expect(classRefs).to.have.length(1);

    const classRefThird = await JsonSchema.unserialize(json, {
      rootAsEntity: false,
      forceClassRefCreation: true
    }) as IClassRef;
    expect(isClassRef(classRefThird)).to.be.true;
    expect(classRefThird.name).to.be.eq(json.title);
    expect(classRefThird.getNamespace()).to.be.eq(DEFAULT_NAMESPACE);

    classRefs = classRefFirst.getRegistry().filter(METATYPE_CLASS_REF, (x: IClassRef) => x.name === 'Car');
    expect(classRefs).to.have.length(1);

  }


  @test
  async 'parse json schema with unknown options for class ref'() {
    const json: IJsonSchema7 & any = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      title: 'HiddenData',
      hidden: 'data',
      properties: {}
    };
    const classRefFirst = await JsonSchema.unserialize(json, {rootAsEntity: false}) as IClassRef;
    expect(isClassRef(classRefFirst)).to.be.true;
    expect(classRefFirst.getNamespace()).to.be.eq(DEFAULT_NAMESPACE);
    const opts = classRefFirst.getOptions();
    expect(opts.hidden).to.be.eq('data');
  }


  @test
  async 'parse json schema with unknown options for entity ref'() {
    const json: IJsonSchema7 & any = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      title: 'HiddenData2',
      hidden: 'data2',
      properties: {}
    };
    const classRefFirst = await JsonSchema.unserialize(json, {forceClassRefCreation: true}) as IClassRef;
    expect(isEntityRef(classRefFirst)).to.be.true;
    expect(classRefFirst.getNamespace()).to.be.eq(DEFAULT_NAMESPACE);
    const opts = classRefFirst.getOptions();
    expect(opts.hidden).to.be.eq('data2');
  }

  @test
  async 'parse json schema with unknown options for properties'() {
    const json: IJsonSchema7 & any = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      title: 'HiddenData3',
      properties: {
        hiddenValue: {
          type: 'string',
          hallo: 'welt'
        }
      }
    };
    const classRefFirst = await JsonSchema.unserialize(json, {forceClassRefCreation: true}) as IClassRef;
    expect(isEntityRef(classRefFirst)).to.be.true;
    expect(classRefFirst.getNamespace()).to.be.eq(DEFAULT_NAMESPACE);

    const properties = classRefFirst.getPropertyRefs();
    expect(properties).to.have.length(1);
    const options = properties.map(x => x.getOptions()).shift();
    expect(options.hallo).to.be.eq('welt');

  }


  /**
   * Generate json schema for simple plain object without properties.
   */
  @test
  async 'generate json schema for class ref with additional class options'() {
    class SerializeWithClassRefOptions {

      @Property()
      value: null;
    }

    const ref = ClassRef.get(SerializeWithClassRefOptions);
    ref.setOption('hallo', {hidden: 'prop'});


    const schema = JsonSchema.serialize(ref);
    expect(schema).to.be.deep.eq({
      $ref: '#/definitions/SerializeWithClassRefOptions',
      $schema: 'http://json-schema.org/draft-07/schema#',
      definitions: {
        SerializeWithClassRefOptions: {
          'hallo': {
            'hidden': 'prop'
          },
          'properties': {
            'value': {
              'type': 'string'
            }
          },
          type: 'object',
          title: 'SerializeWithClassRefOptions',
        }
      }
    });
  }


  /**
   * Generate json schema for simple plain object without properties.
   */
  @test
  async 'parse json schema for class ref with additional class options'() {
    const json = {
      $ref: '#/definitions/SerializeWithClassRefOptions2',
      $schema: 'http://json-schema.org/draft-07/schema#',
      definitions: {
        SerializeWithClassRefOptions2: {
          'hallo': {
            'hidden': 'prop'
          },
          'properties': {
            'value': {
              'type': 'string'
            }
          },
          type: 'object',
          title: 'SerializeWithClassRefOptions2',
        }
      }
    };
    const ref = await JsonSchema.unserialize(json) as IEntityRef;
    expect(ref.getOptions()).to.be.deep.eq({
      'hallo': {
        'hidden': 'prop'
      },
      'metaType': 'entity',
      'name': 'SerializeWithClassRefOptions2',
      'namespace': 'default',
      'target': ref.getClass()
    });
  }

  /**
   * Generate json schema for simple plain object without properties.
   */
  @test
  async 'generate json schema for class ref with additional property options'() {
    class SerializeWithClassRefPropOptions {

      @Property()
      value: null;
    }

    const ref = ClassRef.get(SerializeWithClassRefPropOptions);
    ref.getPropertyRef('value').setOption('hidden', {great: 'value'});


    const schema = JsonSchema.serialize(ref);
    expect(schema).to.be.deep.eq({
      $ref: '#/definitions/SerializeWithClassRefPropOptions',
      $schema: 'http://json-schema.org/draft-07/schema#',
      definitions: {
        SerializeWithClassRefPropOptions: {
          'properties': {
            'value': {
              'type': 'string',
              'hidden': {
                'great': 'value'
              }
            }
          },
          type: 'object',
          title: 'SerializeWithClassRefPropOptions',
        }
      }
    });
  }


  /**
   * Generate json schema for simple plain object without properties.
   */
  @test
  async 'parse json schema for class ref with additional property options'() {
    const json = {
      $ref: '#/definitions/SerializeWithClassRefPropOptions2',
      $schema: 'http://json-schema.org/draft-07/schema#',
      definitions: {
        SerializeWithClassRefPropOptions2: {
          'properties': {
            'value': {
              'type': 'string',
              'hidden': {
                'great': 'value'
              }
            }
          },
          type: 'object',
          title: 'SerializeWithClassRefPropOptions2',
        }
      }
    };


    const ref = await JsonSchema.unserialize(json) as IEntityRef;
    expect(ref.getPropertyRef('value').getOptions()).to.be.deep.eq({
      'hidden': {
        'great': 'value'
      },
      'metaType': 'property',
      'namespace': 'default',
      'propertyName': 'value',
      'target': ref.getClass(),
      'type': 'string'
    });
  }


  @test
  async 'generate schema for annotated class ref with primative properties'() {
    const ref = ClassRef.get(AnnotatedPrimatives2);
    const schema = JsonSchema.serialize(ref);
    expect(schema).to.be.deep.eq({
      '$schema': 'http://json-schema.org/draft-07/schema#',
      '$ref': '#/definitions/AnnotatedPrimatives2',
      'definitions': {
        'AnnotatedPrimatives2': {
          'title': 'AnnotatedPrimatives2',
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


  @test
  async 'generate schema for annotated class ref with post process'() {
    const ref = ClassRef.get(AnnotatedPrimatives2);
    const schema = JsonSchema.serialize(ref, {
      postProcess: (src, dst, serializer) => {
        if (isPropertyRef(src)) {
          dst.checked = true;
        } else {
          dst.passing = true;
        }
      }
    });
    expect(schema).to.be.deep.eq({
      '$schema': 'http://json-schema.org/draft-07/schema#',
      '$ref': '#/definitions/AnnotatedPrimatives2',
      'definitions': {
        'AnnotatedPrimatives2': {
          'title': 'AnnotatedPrimatives2',
          'properties': {
            'boolValue': {
              'type': 'boolean',
              checked: true
            },
            'dateValue': {
              'format': 'date-time',
              'type': 'string',
              checked: true
            },
            'nullValue': {
              'type': 'string',
              checked: true
            },
            'numberValue': {
              'type': 'number',
              checked: true
            },
            'strValue': {
              'type': 'string',
              checked: true
            }
          },
          passing: true,
          'type': 'object'
        }
      }
    });
  }

  @test
  async 'parse and generate schema for primative properties'() {
    const schema = {
      '$schema': 'http://json-schema.org/draft-07/schema#',
      '$ref': '#/definitions/PrimativeClass',
      'definitions': {
        'PrimativeClass': {
          '$id': '#PrimativeClass',
          'type': 'object',
          'title': 'PrimativeClass',
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
          }
        }
      }
    };
    const entityRef = await JsonSchema.unserialize(schema) as IEntityRef;
    expect(entityRef.name).to.be.eq('PrimativeClass');
    const properties = entityRef.getPropertyRefs();
    expect(properties).to.have.length(5);
    expect(properties.map(x => x.name)).to.be.deep.eq([
      'boolValue', 'dateValue', 'nullValue', 'numberValue', 'strValue'
    ]);

    const generatedSchema = JsonSchema.serialize(entityRef);
    expect(generatedSchema).to.be.deep.eq(schema);
  }


  @test
  async 'parse json schema with validation settings'() {
    const json: IJsonSchema7 & any = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      title: 'PersonData',
      properties: {
        email: {
          type: 'string',
          format: 'email'
        }
      }
    };
    const classRefFirst = await JsonSchema.unserialize(json, {forceClassRefCreation: true}) as IClassRef;
    expect(isEntityRef(classRefFirst)).to.be.true;
    expect(classRefFirst.getNamespace()).to.be.eq(DEFAULT_NAMESPACE);

    const properties = classRefFirst.getPropertyRefs();
    expect(properties).to.have.length(1);
    const options = properties.map(x => x.getOptions()).shift();
    expect(options).to.be.deep.include({
      'format': 'email',
      'metaType': 'property',
      'namespace': 'default',
      'propertyName': 'email',
      'type': 'string'
    });

    const entry = classRefFirst.create<any>();
    entry.email = 'test';
    let validate = await Validator.validate(entry, classRefFirst);
    expect(validate).to.have.length(1);
    expect(validate).to.be.deep.eq([
        {
          metaType: 'property',
          property: 'email',
          value: 'test',
          constraints: {
            'email': 'Value of property "email" must be a valid email.'
          }
        }
      ]
    );


    entry.email = 'test@test.com';
    validate = await Validator.validate(entry, classRefFirst);
    expect(validate).to.have.length(0);

  }


  @test
  async 'parse json schema with validation settings and additional options'() {
    const json: IJsonSchema7 & any = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      '$id': '#PersonDataReg',
      type: 'object',
      title: 'PersonDataReg',
      properties: {
        name: {
          type: 'string',
          validate: 'regex',
          pattern: 'Rob[a-z]+'
        }
      }
    };
    const classRefFirst = await JsonSchema.unserialize(json, {forceClassRefCreation: true}) as IClassRef;
    expect(isEntityRef(classRefFirst)).to.be.true;
    expect(classRefFirst.getNamespace()).to.be.eq(DEFAULT_NAMESPACE);

    const properties = classRefFirst.getPropertyRefs();
    expect(properties).to.have.length(1);
    const options = properties.map(x => x.getOptions()).shift();
    expect(options).to.be.deep.eq({
      'metaType': 'property',
      'namespace': 'default',
      'propertyName': 'name',
      'type': 'string',
      target: classRefFirst.getClass(),
      'validate': 'regex',
      'pattern': 'Rob[a-z]+'
    });

    const entry = classRefFirst.create<any>();
    entry.name = 'test';
    let validate = await Validator.validate(entry, classRefFirst);
    expect(validate).to.have.length(1);
    expect(validate).to.be.deep.eq([
        {
          'constraints': {
            'regex': 'Value of property "name" doesn\'t match the regular expression "Rob[a-z]+".',
          },
          'metaType': 'property',
          'property': 'name',
          'value': 'test'
        }
      ]
    );

    entry.name = 'Robocop';
    validate = await Validator.validate(entry, classRefFirst);
    expect(validate).to.have.length(0);

    const schema = JsonSchema.serialize(classRefFirst);
    // console.log(inspect(schema, false, 10));

    expect(schema).to.be.deep.eq({
      '$schema': 'http://json-schema.org/draft-07/schema#',
      definitions: {
        PersonDataReg: {
          '$id': '#PersonDataReg',
          title: 'PersonDataReg',
          type: 'object',
          properties: {
            name: {
              pattern: 'Rob[a-z]+',
              type: 'string',
              validate: 'regex'
            }
          }
        }
      },
      '$ref': '#/definitions/PersonDataReg'
    });

    const initialSchemaCopy = _.cloneDeep(json);
    delete initialSchemaCopy['$schema'];
    expect(schema.definitions['PersonDataReg']).to.be.deep.eq(initialSchemaCopy);
  }


  @test
  async 'generate schema for multiple classes'() {
    const serializer = JsonSchema.getSerializer();
    let first = serializer.serialize(ClassRef.get(AnnotatedPrimatives2));
    expect(first).to.be.deep.eq({
      '$schema': 'http://json-schema.org/draft-07/schema#',
      definitions: {
        AnnotatedPrimatives2: {
          title: 'AnnotatedPrimatives2',
          type: 'object',
          properties: {
            strValue: {type: 'string'},
            numberValue: {type: 'number'},
            dateValue: {type: 'string', format: 'date-time'},
            boolValue: {type: 'boolean'},
            nullValue: {type: 'string'}
          }
        }
      },
      '$ref': '#/definitions/AnnotatedPrimatives2'
    });
    first = serializer.serialize(ClassRef.get(PlainObject04));
    expect(first).to.be.deep.eq({
        '$schema': 'http://json-schema.org/draft-07/schema#',
        definitions: {
          AnnotatedPrimatives2: {
            title: 'AnnotatedPrimatives2',
            type: 'object',
            properties: {
              strValue: {type: 'string'},
              numberValue: {type: 'number'},
              dateValue: {type: 'string', format: 'date-time'},
              boolValue: {type: 'boolean'},
              nullValue: {type: 'string'}
            }
          },
          PlainObject04: {title: 'PlainObject04', type: 'object', properties: {}}
        },
        anyOf: [
          {'$ref': '#/definitions/AnnotatedPrimatives2'},
          {'$ref': '#/definitions/PlainObject04'}
        ]
      }
    );
    first = serializer.serialize(ClassRef.get(ExtendedObject2));
    expect(first).to.be.deep.eq({
        '$schema': 'http://json-schema.org/draft-07/schema#',
        definitions: {
          AnnotatedPrimatives2: {
            title: 'AnnotatedPrimatives2',
            type: 'object',
            properties: {
              strValue: {type: 'string'},
              numberValue: {type: 'number'},
              dateValue: {type: 'string', format: 'date-time'},
              boolValue: {type: 'boolean'},
              nullValue: {type: 'string'}
            }
          },
          PlainObject04: {title: 'PlainObject04', type: 'object', properties: {}},
          PlainObject03: {
            title: 'PlainObject03', type: 'object',
            properties: {
              'internValue': {
                'default': 'local',
                'type': 'string'
              }
            }
          },
          ExtendedObject2: {
            title: 'ExtendedObject2',
            type: 'object',
            'properties': {
              'extValue': {
                'type': 'string'
              },
              'internValue': {
                'default': 'local',
                'type': 'string'
              }
            },
            allOf: [{'$ref': '#/definitions/PlainObject03'}]
          }
        },
        anyOf: [
          {'$ref': '#/definitions/AnnotatedPrimatives2'},
          {'$ref': '#/definitions/PlainObject04'},
          {'$ref': '#/definitions/ExtendedObject2'}
        ]
      }
    );
    first = serializer.serialize(ClassRef.get(ExtendedObject2));
    expect(first).to.be.deep.eq({
        $schema: 'http://json-schema.org/draft-07/schema#',
        definitions: {
          AnnotatedPrimatives2: {
            title: 'AnnotatedPrimatives2',
            type: 'object',
            properties: {
              strValue: {type: 'string'},
              numberValue: {type: 'number'},
              dateValue: {type: 'string', format: 'date-time'},
              boolValue: {type: 'boolean'},
              nullValue: {type: 'string'}
            }
          },
          PlainObject04: {title: 'PlainObject04', type: 'object', properties: {}},
          ExtendedObject2: {
            title: 'ExtendedObject2',
            type: 'object',
            properties: {
              extValue: {type: 'string'},
              'internValue': {
                'default': 'local',
                'type': 'string'
              }
            },
            allOf: [{'$ref': '#/definitions/PlainObject03'}]
          },
          PlainObject03: {
            title: 'PlainObject03', type: 'object', properties: {
              'internValue': {
                'default': 'local',
                'type': 'string'
              }
            }
          }
        },
        anyOf: [
          {'$ref': '#/definitions/AnnotatedPrimatives2'},
          {'$ref': '#/definitions/PlainObject04'},
          {'$ref': '#/definitions/ExtendedObject2'}
        ]
      }
    );
  }

  @test
  async 'parse multiple classes from single schema'() {
    const jsonSchema = {
      '$schema': 'http://json-schema.org/draft-07/schema#',
      definitions: {
        ParseTAnnotatedPrimatives2: {
          title: 'ParseTAnnotatedPrimatives2',
          type: 'object',
          properties: {
            strValue: {type: 'string'},
            numberValue: {type: 'number'},
            dateValue: {type: 'string', format: 'date-time'},
            boolValue: {type: 'boolean'},
            nullValue: {type: 'string'}
          }
        },
        ParseTPlainObject: {title: 'ParseTPlainObject', type: 'object', properties: {}},
        ParseTExtendedObject: {
          title: 'ParseTExtendedObject',
          type: 'object',
          properties: {},
          allOf: [{'$ref': '#/definitions/ParseTPlainObject'}]
        },
        ParseTExtendedObject2: {
          title: 'ParseTExtendedObject2',
          type: 'object',
          properties: {extValue: {type: 'string'}},
          allOf: [{'$ref': '#/definitions/ParseTPlainObject02'}]
        },
        ParseTPlainObject02: {title: 'ParseTPlainObject02', type: 'object', properties: {}}
      },
      anyOf: [
        {'$ref': '#/definitions/ParseTAnnotatedPrimatives2'},
        {'$ref': '#/definitions/ParseTPlainObject'},
        {'$ref': '#/definitions/ParseTExtendedObject'},
        {'$ref': '#/definitions/ParseTExtendedObject2'}
      ]
    };

    const serializer = JsonSchema.getUnserializer();
    let first = await serializer.unserialize(jsonSchema) as IEntityRef[];

    expect(first).to.have.length(4);
    const res = RegistryFactory.get().filter(METATYPE_CLASS_REF, (x: IClassRef) => /^ParseT.*/.test(x.name));
    expect(res).to.have.length(5);

    const r = first.find(x => x.name === 'ParseTAnnotatedPrimatives2');
    const prop = r.getPropertyRefs();
    expect(prop).to.have.length(5);
    expect(prop.map(x => x.name)).to.be.deep.eq([
      'strValue',
      'numberValue',
      'dateValue',
      'boolValue',
      'nullValue'
    ]);

    const r2 = first.find(x => x.name === 'ParseTExtendedObject2') as IEntityRef;
    const prop2 = r2.getPropertyRefs();
    expect(prop2).to.have.length(1);
    expect(prop2.map(x => x.name)).to.be.deep.eq([
      'extValue'
    ]);

    const extend = r2.getClassRef().getExtend();
    expect(extend.name).to.be.eq('ParseTPlainObject02');

  }


  @test
  async 'parse schema without class names'() {
    const CONFIG_SCHEMA = {
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'type': 'object',
      'properties': {
        'app': {
          'type': 'object',
          'properties': {
            'name': {
              'type': 'string',
            },
            'path': {
              'type': 'string',
            },
            'enableShutdownOnUncaughtException': {
              'type': 'boolean',
            }
          }
        }
      }
    };

    const unserialized = await JsonSchema.unserialize(
      CONFIG_SCHEMA, {className: 'Config', namespace: 'config', rootAsEntity: false});
    const entries = RegistryFactory.get('config').list(METATYPE_CLASS_REF);
    expect(entries).to.have.length(2);
    expect(entries.map((x: IClassRef) => x.name)).to.deep.eq(['Config', 'App']);

    const ref = entries.find(((x: IClassRef) => x.name === 'Config')) as IClassRef;
    const refProps = ref.getPropertyRefs();
    expect(refProps).to.have.length(1);
    expect(refProps[0].isReference()).to.be.true;
    expect(refProps[0].name).to.be.eq('app');
    const refRef = refProps[0].getTargetRef();
    const refRefProps = refRef.getPropertyRefs();
    expect(refRefProps).to.have.length(3);
    expect(refRefProps.map((x: IPropertyRef) => x.name)).to.deep.eq(['name', 'path', 'enableShutdownOnUncaughtException']);
  }

  @test
  async 'parse multiple schemas after another extending previous structure'() {
    const NAMESPACE = 'myconfig';
    const CONFIG_SCHEMA = {
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'type': 'object',
      'description': 'hallo',
      'properties': {
        'app': {
          '$id': 'App',
          'type': 'object',
          'properties': {
            'name': {
              'type': 'string',
            },
          }
        }
      }
    };

    // add new property, do not override property
    const CONFIG_SCHEMA2 = {
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'type': 'object',
      'properties': {
        'app': {
          'type': 'object',
          'properties': {
            'path': {
              'type': 'string',
            },
          }
        }
      }
    };

    // add new property, do not override property
    const CONFIG_SCHEMA3 = {
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'type': 'object',
      'properties': {
        'server': {
          '$id': 'App',
          'type': 'object',
          'description': 'server stuff',
          'properties': {
            'host': {
              'type': 'string',
              'format': 'hostname',
              'description': 'some hostname'
            },
          }
        }
      }
    };

    // -----------------------------------
    // load schema 1
    //
    await JsonSchema.unserialize(CONFIG_SCHEMA, {className: 'Config', namespace: NAMESPACE, rootAsEntity: false});
    let classRefs = RegistryFactory.get(NAMESPACE).list(METATYPE_CLASS_REF);
    let entityRefs = RegistryFactory.get(NAMESPACE).list(METATYPE_ENTITY);
    let propertyRefs = RegistryFactory.get(NAMESPACE).list(METATYPE_PROPERTY);
    expect(classRefs).to.have.length(2);
    expect(classRefs.map((x: IClassRef) => x.name)).to.deep.eq(['Config', 'App']);
    expect(entityRefs).to.have.length(1);
    expect(entityRefs.map((x: IEntityRef) => x.name)).to.deep.eq(['App']);
    expect(propertyRefs).to.have.length(2);
    expect(propertyRefs.map((x: IPropertyRef) => x.name)).to.deep.eq(['name', 'app']);

    let ref = classRefs.find(((x: IClassRef) => x.name === 'Config')) as IClassRef;
    let refProps = ref.getPropertyRefs();
    expect(refProps).to.have.length(1);
    expect(refProps[0].isReference()).to.be.true;
    expect(refProps[0].name).to.be.eq('app');
    let refRef = refProps[0].getTargetRef();
    let refRefProps = refRef.getPropertyRefs();
    expect(refRefProps).to.have.length(1);
    expect(refRefProps.map((x: IPropertyRef) => x.name)).to.deep.eq(['name']);

    // -----------------------------------
    // load schema 2
    //
    await JsonSchema.unserialize(CONFIG_SCHEMA2, {className: 'Config', namespace: NAMESPACE, rootAsEntity: false});
    classRefs = RegistryFactory.get(NAMESPACE).list(METATYPE_CLASS_REF);
    entityRefs = RegistryFactory.get(NAMESPACE).list(METATYPE_ENTITY);
    propertyRefs = RegistryFactory.get(NAMESPACE).list(METATYPE_PROPERTY);
    expect(classRefs).to.have.length(2);
    expect(classRefs.map((x: IClassRef) => x.name)).to.deep.eq(['Config', 'App']);
    expect(entityRefs).to.have.length(1);
    expect(entityRefs.map((x: IEntityRef) => x.name)).to.deep.eq(['App']);
    expect(propertyRefs).to.have.length(3);
    expect(propertyRefs.map((x: IPropertyRef) => x.name)).to.deep.eq(['name', 'app', 'path']);

    ref = classRefs.find(((x: IClassRef) => x.name === 'Config')) as IClassRef;
    refProps = ref.getPropertyRefs();
    expect(refProps).to.have.length(1);
    expect(refProps[0].isReference()).to.be.true;
    expect(refProps[0].name).to.be.eq('app');
    refRef = refProps[0].getTargetRef();
    refRefProps = refRef.getPropertyRefs();
    expect(refRefProps).to.have.length(2);
    expect(refRefProps.map((x: IPropertyRef) => x.name)).to.deep.eq(['name', 'path']);


    // -----------------------------------
    // load schema 3
    //
    await JsonSchema.unserialize(CONFIG_SCHEMA3, {
      className: 'Config', namespace: NAMESPACE, rootAsEntity: false
    });
    classRefs = RegistryFactory.get(NAMESPACE).list(METATYPE_CLASS_REF);
    entityRefs = RegistryFactory.get(NAMESPACE).list(METATYPE_ENTITY);
    propertyRefs = RegistryFactory.get(NAMESPACE).list(METATYPE_PROPERTY);
    expect(classRefs).to.have.length(3);
    expect(classRefs.map((x: IClassRef) => x.name)).to.deep.eq(['Config', 'App', 'Server']);
    expect(entityRefs).to.have.length(2);
    expect(entityRefs.map((x: IEntityRef) => x.name)).to.deep.eq(['App', 'Server']);
    expect(propertyRefs).to.have.length(5);
    expect(propertyRefs.map((x: IPropertyRef) => x.name)).to.deep.eq([
      'name',
      'app',
      'path',
      'host',
      'server'
    ]);

    ref = classRefs.find(((x: IClassRef) => x.name === 'Config')) as IClassRef;
    refProps = ref.getPropertyRefs();
    expect(refProps).to.have.length(2);
    expect(refProps[0].isReference()).to.be.true;
    expect(refProps[0].name).to.be.eq('app');
    refRef = refProps[0].getTargetRef();
    refRefProps = refRef.getPropertyRefs();
    expect(refRefProps).to.have.length(2);
    expect(refRefProps.map((x: IPropertyRef) => x.name)).to.deep.eq(['name', 'path']);

    const res = JsonSchema.serialize(ref);
    // console.log(inspect(res, false, 10));
    expect(res).to.be.deep.eq({
      '$schema': 'http://json-schema.org/draft-07/schema#',
      definitions: {
        Config: {
          title: 'Config',
          type: 'object',
          description: 'hallo',
          properties: {
            app: {'$ref': '#/definitions/App'},
            server: {'$ref': '#/definitions/Server'}
          }
        },
        App: {
          $id: '#App',
          title: 'App',
          type: 'object',
          properties: {name: {type: 'string'}, path: {type: 'string'}}
        },
        Server: {
          $id: '#Server',
          title: 'Server',
          type: 'object',
          description: 'server stuff',
          properties: {host: {type: 'string', format: 'hostname', 'description': 'some hostname'}}
        }
      },
      '$ref': '#/definitions/Config'
    });


    const ser = JsonSchema.getSerializer();
    for (const entity of entityRefs as IEntityRef[]) {
      ser.serialize(entity);
    }
    // console.log(inspect(res, false, 10));
    expect(ser.getJsonSchema()).to.be.deep.eq({
      '$schema': 'http://json-schema.org/draft-07/schema#',
      definitions: {
        App: {
          $id: '#App',
          title: 'App',
          type: 'object',
          properties: {name: {type: 'string'}, path: {type: 'string'}}
        },
        Server: {
          $id: '#Server',
          title: 'Server',
          type: 'object',
          description: 'server stuff',
          properties: {host: {type: 'string', format: 'hostname', 'description': 'some hostname'}}
        }
      },
      'anyOf': [
        {
          '$ref': '#/definitions/App'
        },
        {
          '$ref': '#/definitions/Server'
        }
      ]
    });
  }


  @test
  async 'parse schema with cyclic ref'() {
    const data_x =
      {
        $schema: 'http://json-schema.org/draft-07/schema#',
        definitions: {
          Car: {
            title: 'Car',
            type: 'object',
            metadata: {type: 'regular'},
            properties: {
              id: {
                type: 'number',
                metadata: {
                  propertyName: 'id',
                  mode: 'regular',
                  options: {primary: true}
                },
                tableType: 'column'
              },
              name: {
                type: 'string',
                metadata: {propertyName: 'name', mode: 'regular', options: {}},
                tableType: 'column'
              },
              driver: {
                type: 'array',
                items: {'$ref': '#/definitions/Driver'},
                metadata: {
                  propertyName: 'driver',
                  isLazy: false,
                  relationType: 'one-to-many',
                  options: {}
                },
                tableType: 'relation'
              }
            }
          },
          Driver: {
            title: 'Driver',
            type: 'object',
            metadata: {type: 'regular'},
            properties: {
              id: {
                type: 'number',
                metadata: {
                  propertyName: 'id',
                  mode: 'regular',
                  options: {primary: true}
                },
                tableType: 'column'
              },
              firstName: {
                type: 'string',
                metadata: {propertyName: 'firstName', mode: 'regular', options: {}},
                tableType: 'column'
              },
              lastName: {
                type: 'string',
                metadata: {propertyName: 'lastName', mode: 'regular', options: {}},
                tableType: 'column'
              },
              car: {
                $ref: '#/definitions/Car',
                metadata: {
                  propertyName: 'car',
                  relationType: 'many-to-one',
                  isLazy: false,
                  options: {}
                },
                tableType: 'relation'
              }
            }
          }
        },
        '$ref': '#/definitions/Car'
      };

    data_x.definitions['Car2'] = _.cloneDeep(data_x.definitions['Car']);
    data_x.definitions['Car2'].title = 'Car2';
    data_x.definitions['Car2'].$id = '#Car2';
    data_x.$ref = '#/definitions/Car2';

    const res = await JsonSchema.unserialize(data_x, {namespace: 'cyclic'});
    expect(isEntityRef(res)).to.be.true;
    expect((res as IEntityRef).name).to.be.eq('Car2');
    const c = RegistryFactory.get('cyclic').list(METATYPE_CLASS_REF);
    expect(c.map((x: any) => x.name)).to.be.deep.eq(['Car2', 'Driver', 'Car']);
    const schema = JsonSchema.serialize(res, {
      deleteReferenceKeys: false, postProcess: (src, dst) => {
        if (_.has(dst, 'cardinality')) {
          delete dst.cardinality;
        }
      }
    });
    expect(schema).to.be.deep.eq(data_x);

  }


}
