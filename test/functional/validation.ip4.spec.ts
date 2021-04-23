import 'reflect-metadata';
import {expect} from 'chai';
import {suite, test} from '@testdeck/mocha';
import {Validator} from './../../src/lib/validation/Validator';
import {Ip4, IP4_REGEX} from '../../src/decorators/validate/Ip4';


export class ValidIp4 {

  // detect by reflactions
  @Ip4()
  value: string;

}


@suite('functional/validations - ip4')
class ValidationIp4Spec {


  @test
  async 'ip4 regex tests'() {
    let r = IP4_REGEX.test('test');
    expect(r).to.be.false;

    r = IP4_REGEX.test('123.123.123.123');
    expect(r).to.be.true;
  }

  @test
  async 'validate object with undefined ip4 property'() {
    const newClass = new ValidIp4();
    let res = await Validator.validate(newClass);
    expect(res).to.have.length(0);
  }

  @test
  async 'validate object with empty string as ip4'() {
    const newClass = new ValidIp4();
    newClass.value = '';
    const res = await Validator.validate(newClass);
    expect(res).to.have.length(1);
    expect(res).to.be.deep.eq(
      [
        {
          'constraints': {
            'ip4': 'Value of property "value" must be a valid ip4 address.'
          },
          'metaType': 'property',
          'property': 'value',
          'value': ''
        }
      ]
    );
  }


  @test
  async 'validate object with wrong string as ip4'() {
    const newClass = new ValidIp4();
    newClass.value = '1.address.de';
    const res = await Validator.validate(newClass);
    expect(res).to.have.length(1);
    expect(res).to.be.deep.eq([
        {
          'constraints': {
            'ip4': 'Value of property "value" must be a valid ip4 address.'
          },
          'metaType': 'property',
          'property': 'value',
          'value': '1.address.de'
        }
      ]
    );
  }

  @test
  async 'validate object with correct value for ip4'() {
    const newClass = new ValidIp4();
    newClass.value = '123.123.123.123';
    const res = await Validator.validate(newClass);
    expect(res).to.have.length(0);
  }


}

