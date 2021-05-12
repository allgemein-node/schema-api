import 'reflect-metadata';
import {expect} from 'chai';
import {suite, test} from '@testdeck/mocha';
import {Validator} from './../../src/lib/validation/Validator';
import {Ip6, IP6_REGEX} from '../../src/decorators/validate/Ip6';


export class ValidIp6 {

  // detect by reflactions
  @Ip6()
  value: string;

}


@suite('functional/validations - ip6')
class ValidationIp4Spec {


  @test
  async 'ip6 regex tests'() {
    let r = IP6_REGEX.test('test');
    expect(r).to.be.false;

    r = IP6_REGEX.test('2a00:1450:400a:804::2004');
    expect(r).to.be.true;
  }

  @test
  async 'validate object with undefined ip6 property'() {
    const newClass = new ValidIp6();
    let res = await Validator.validate(newClass);
    expect(res).to.have.length(1);
  }

  @test
  async 'validate object with empty string as ip6'() {
    const newClass = new ValidIp6();
    newClass.value = '';
    const res = await Validator.validate(newClass);
    expect(res).to.have.length(1);
    expect(res).to.be.deep.eq(
      [
        {
          'constraints': {
            "ip6": "Value of property \"value\" must be a valid ip6 address."
          },
          'metaType': 'property',
          'property': 'value',
          'value': ''
        }
      ]
    );
  }


  @test
  async 'validate object with wrong string as ip6'() {
    const newClass = new ValidIp6();
    newClass.value = '1.address.de';
    const res = await Validator.validate(newClass);
    expect(res).to.have.length(1);
    expect(res).to.be.deep.eq([
        {
          'constraints': {
            "ip6": "Value of property \"value\" must be a valid ip6 address."
          },
          'metaType': 'property',
          'property': 'value',
          'value': '1.address.de'
        }
      ]
    );
  }

  @test
  async 'validate object with correct value for ip6'() {
    const newClass = new ValidIp6();
    newClass.value = '2a00:1450:400a:804::2004';
    const res = await Validator.validate(newClass);
    expect(res).to.have.length(0);
  }


  @test.skip
  async 'serialize as json schema'() {
  }

  @test.skip
  async 'unserialize as json schema'() {
  }



}

