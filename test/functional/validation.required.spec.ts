import 'reflect-metadata';
import {expect} from 'chai';
import {suite, test} from '@testdeck/mocha';
import {Validator} from './../../src/lib/validation/Validator';
import {Required} from '../../src/decorators/validate/Required';

export class ValidRequired {

  notReq: string;

  @Required()
  someValue: string;

  @Required({message: 'something else should happen for field %propertyName'})
  someValueReq: string;

}


@suite('functional/validations - required')
class ValidationRequiredSpec {


  @test
  async 'validate empty with required'() {
    let newClass = new ValidRequired();
    const res = await Validator.validate(newClass);
    expect(res).to.have.length(2);
    expect(res).to.be.deep.eq([
      {
        metaType: 'property',
        property: 'someValue',
        value: undefined,
        constraints: {required: 'Property "someValue" is required.'}
      },
      {
        metaType: 'property',
        property: 'someValueReq',
        value: undefined,
        constraints: {required: 'something else should happen for field someValueReq'}
      }
    ]);
  }

  @test
  async 'validate setted with required'() {
    let newClass = new ValidRequired();
    newClass.notReq = 'hallo';
    newClass.someValueReq = 'some thing';
    newClass.someValue = '';

    const res = await Validator.validate(newClass);
    expect(res).to.have.length(0);
  }

}

