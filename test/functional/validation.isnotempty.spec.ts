import 'reflect-metadata';
import {expect} from 'chai';
import {suite, test} from '@testdeck/mocha';
import {Validator} from './../../src/lib/validation/Validator';
import {IsNotEmpty} from '../../src/decorators/validate/IsNotEmpty';

export class ValidNotEmpty {


  @IsNotEmpty()
  someValue: string;

  @IsNotEmpty({message: 'something else should happen for field %propertyName'})
  someValueReq: string;

}


@suite('functional/validations - is not mepty')
class ValidationRequiredSpec {


  @test
  async 'validate empty with required'() {
    let newClass = new ValidNotEmpty();
    const res = await Validator.validate(newClass);
    expect(res).to.have.length(2);
    expect(res).to.be.deep.eq([
      {
        metaType: 'property',
        property: 'someValue',
        value: undefined,
        constraints: {'isNotEmpty': 'Property "someValue" must be set and be not empty.'}
      },
      {
        metaType: 'property',
        property: 'someValueReq',
        value: undefined,
        constraints: {'isNotEmpty': 'something else should happen for field someValueReq'}
      }
    ]);
  }


  @test
  async 'validate one correctly and the other empty must fail'() {
    let newClass = new ValidNotEmpty();
    newClass.someValueReq = 'some thing';
    newClass.someValue = '';

    const res = await Validator.validate(newClass);
    expect(res).to.have.length(1);
    expect(res).to.be.deep.eq([
      {
        'constraints': {
          'isNotEmpty': 'Property "someValue" must be set and be not empty.'
        },
        'metaType': 'property',
        'property': 'someValue',
        'value': ''
      }
    ]);
  }


  @test
  async 'validate both correctly'() {
    let newClass = new ValidNotEmpty();
    newClass.someValueReq = 'some thing';
    newClass.someValue = 'ds ds';

    const res = await Validator.validate(newClass);
    expect(res).to.have.length(0);
  }

}

