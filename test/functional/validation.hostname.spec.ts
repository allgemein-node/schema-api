import 'reflect-metadata';
import {expect} from 'chai';
import {suite, test} from '@testdeck/mocha';
import {Validator} from './../../src/lib/validation/Validator';
import {Hostname} from '../../src/decorators/validate';
import {HOSTNAME_RFC1034_REGEX, HOSTNAME_RFC952_REGEX} from '../../src/decorators/validate/Hostname';


export class ValidHostname {

  // detect by reflactions
  @Hostname()
  hostname: string;

}


@suite('functional/validations - hostname')
class ValidationHostnameSpec {

  @test.skip
  async 'rfc 1034 regex tests'() {
    let r = HOSTNAME_RFC1034_REGEX.test('test');
    expect(r).to.be.false;

    r = HOSTNAME_RFC1034_REGEX.test('test.de');
    expect(r).to.be.true;
  }

  @test.skip
  async 'rfc 952 regex tests'() {
    let r = HOSTNAME_RFC952_REGEX.test('test');
    expect(r).to.be.false;

    r = HOSTNAME_RFC952_REGEX.test('test.de');
    expect(r).to.be.true;
  }

  @test
  async 'validate object with undefined hostname property'() {
    const newClass = new ValidHostname();
    let res = await Validator.validate(newClass);
    expect(res).to.have.length(0);
  }

  @test
  async 'validate object with empty string as hostname'() {
    const newClass = new ValidHostname();
    newClass.hostname = '';
    const res = await Validator.validate(newClass);
    expect(res).to.have.length(1);
    expect(res).to.be.deep.eq(
      [
        {
          'constraints': {
            'hostname': 'Value of property "hostname" must be a valid hostname.'
          },
          'metaType': 'property',
          'property': 'hostname',
          'value': ''
        }
      ]
    );
  }

  @test
  async 'validate object with wrong string as hostname'() {
    const newClass = new ValidHostname();
    newClass.hostname = '1.m.i.ladd.re.ss';
    const res = await Validator.validate(newClass);
    expect(res).to.have.length(1);
    expect(res).to.be.deep.eq(
      [
        {
          'constraints': {
            'hostname': 'Value of property "hostname" must be a valid hostname.'
          },
          'metaType': 'property',
          'property': 'hostname',
          "value": "1.m.i.ladd.re.ss"
        }
      ]
    );
  }

  @test
  async 'validate empty object with wrong string as hostname'() {
    const newClass = new ValidHostname();
    newClass.hostname = '1.address.de';
    const res = await Validator.validate(newClass);
    expect(res).to.have.length(1);
    expect(res).to.be.deep.eq([
        {
          'constraints': {
            'hostname': 'Value of property "hostname" must be a valid hostname.'
          },
          'metaType': 'property',
          'property': 'hostname',
          'value': '1.address.de'
        }
      ]
    );
  }

  @test
  async 'validate object with correct value for hostname'() {
    const newClass = new ValidHostname();
    newClass.hostname = 'test.de';
    const res = await Validator.validate(newClass);
    expect(res).to.have.length(0);
  }


}

