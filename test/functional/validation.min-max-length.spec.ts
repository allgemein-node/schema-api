import 'reflect-metadata';
import {expect} from 'chai';
import {suite, test} from '@testdeck/mocha';
import {Validator} from './../../src/lib/validation/Validator';
import {MaxLength, MinLength} from '../../src/decorators/validate';
import {ClassRef, IClassRef, JsonSchema, Property} from '../../src';
import {inspect} from 'util';

export class ValidStrLength {

  @Property()
  @MinLength(4)
  minValue: string;

  @Property()
  @MaxLength(4)
  maxValue: string;

  @Property()
  @MinLength(4)
  @MaxLength(8)
  value: string;
}


@suite('functional/validations - min/max length of string')
class ValidationRequiredSpec {


  @test
  async 'validate all pass for empty'() {
    let newClass = new ValidStrLength();
    const res = await Validator.validate(newClass);
    expect(res).to.have.length(0);
  }


  @test
  async 'validate min length of value passing'() {
    let newClass = new ValidStrLength();
    newClass.minValue = 'hallo';
    const res = await Validator.validate(newClass);
    expect(res).to.have.length(0);
  }


  @test
  async 'validate min length of value failing'() {
    let newClass = new ValidStrLength();
    newClass.minValue = 'ha';
    const res = await Validator.validate(newClass);
    expect(res).to.have.length(1);
    expect(res).to.be.deep.eq(
      [
        {
          'constraints': {
            'minLength': 'Length of property "minValue" must be greeter then 4.'
          },
          'metaType': 'property',
          'property': 'minValue',
          'value': 'ha'
        }
      ]
    );
  }


  @test
  async 'validate max length of value passing'() {
    let newClass = new ValidStrLength();
    newClass.maxValue = 'hal';
    const res = await Validator.validate(newClass);
    expect(res).to.have.length(0);
  }

  @test
  async 'validate max length of value failing'() {
    let newClass = new ValidStrLength();
    newClass.maxValue = 'hallo ballo';
    const res = await Validator.validate(newClass);
    expect(res).to.have.length(1);
    expect(res).to.be.deep.eq(
      [
        {
          'constraints': {
            'maxLength': 'Length of property "maxValue" must be greeter then 4.'
          },
          'metaType': 'property',
          'property': 'maxValue',
          'value': 'hallo ballo'
        }
      ]
    );
  }


  @test
  async 'validate min/max length of value passing'() {
    let newClass = new ValidStrLength();
    newClass.value = 'hallo';
    const res = await Validator.validate(newClass);
    expect(res).to.have.length(0);
  }

  @test
  async 'validate min/max length of value failing'() {
    let newClass = new ValidStrLength();
    newClass.value = 'hallo ballo';
    let res = await Validator.validate(newClass);
    expect(res).to.have.length(1);
    expect(res).to.be.deep.eq(
      [
        {
          'constraints': {
            'maxLength': 'Length of property "value" must be greeter then 8.'
          },
          'metaType': 'property',
          'property': 'value',
          'value': 'hallo ballo'
        }
      ]
    );
    newClass.value = 'hal';
    res = await Validator.validate(newClass);
    expect(res).to.have.length(1);
    expect(res).to.be.deep.eq(
      [
        {
          'constraints': {
            'minLength': 'Length of property "value" must be greeter then 4.'
          },
          'metaType': 'property',
          'property': 'value',
          'value': 'hal'
        }
      ]
    );
  }


  @test
  async 'serialize as json schema'() {
    const res = JsonSchema.serialize(ClassRef.get(ValidStrLength));
    console.log(inspect(res, false, 10));
    expect(res).to.be.deep.eq({
      '$schema': 'http://json-schema.org/draft-07/schema#',
      definitions: {
        ValidStrLength: {
          title: 'ValidStrLength',
          type: 'object',
          properties: {
            minValue: {type: 'string', minLength: 4},
            maxValue: {type: 'string', maxLength: 4},
            value: {type: 'string', maxLength: 8, minLength: 4}
          }
        }
      },
      '$ref': '#/definitions/ValidStrLength'
    });
  }

  @test
  async 'unserialize as json schema'() {
    const json = {
      '$schema': 'http://json-schema.org/draft-07/schema#',
      definitions: {
        ValidStrLengthUnSer: {
          title: 'ValidStrLengthUnSer',
          type: 'object',
          properties: {
            minValue: {type: 'string', minLength: 5},
            maxValue: {type: 'string', maxLength: 6},
            value: {type: 'string', maxLength: 5, minLength: 6}
          }
        }
      },
      '$ref': '#/definitions/ValidStrLengthUnSer'
    };

    const ref = await JsonSchema.unserialize(json, {rootAsEntity: false}) as IClassRef;
    const property = ref.getPropertyRef('minValue');
    expect(property.getOptions()).to.be.deep.eq({
      'metaType': 'property',
      'minLength': 5,
      'namespace': 'default',
      'propertyName': 'minValue',
      'target': ref.getClass(),
      'type': 'string',
    });


    const entry = ref.create<any>();
    entry.minValue = 'a12355';

    let res = await Validator.validate(entry, ref);
    expect(res).to.have.length(0);
    entry.minValue = 'emai';

    res = await Validator.validate(entry, ref);
    expect(res).to.have.length(1);
  }


}

