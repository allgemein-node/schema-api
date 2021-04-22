import 'reflect-metadata';
import {expect} from 'chai';
import {suite, test} from '@testdeck/mocha';
import {ValidEMail, ValidEMailRequired} from './data/classes/ValidEMail';
import {Validator} from './../../src/lib/validation/Validator';


@suite('functional/validations - email')
class ValidationEmailSpec {


  @test
  async 'validate empty object with mail'() {
    const newClass = new ValidEMail();
    let res = await Validator.validate(newClass);
    expect(res).to.have.length(0);
  }

  @test
  async 'validate empty object with emtpy string as mail'() {
    const newClass = new ValidEMail();
    newClass.mail = '';
    const res = await Validator.validate(newClass);
    expect(res).to.have.length(1);
    expect(res).to.be.deep.eq(
      [
        {
          metaType: 'property',
          property: 'mail',
          value: '',
          constraints: {
            'email': 'Value of property "mail" must be a valid email.'
          }
        }
      ]
    );
  }

  @test
  async 'validate empty object with wrong string as mail'() {
    const newClass = new ValidEMail();
    newClass.mail = 'mailaddress';
    const res = await Validator.validate(newClass);
    expect(res).to.have.length(1);
    expect(res).to.be.deep.eq(
      [
        {
          metaType: 'property',
          property: 'mail',
          value: 'mailaddress',
          constraints: {
            'email': 'Value of property "mail" must be a valid email.'
          }
        }
      ]
    );
  }

  @test
  async 'validate empty object with wrong string with @ as mail'() {
    const newClass = new ValidEMail();
    newClass.mail = 'mailaddress@addedd';
    const res = await Validator.validate(newClass);
    expect(res).to.have.length(1);
    expect(res).to.be.deep.eq([
        {
          metaType: 'property',
          property: 'mail',
          value: 'mailaddress@addedd',
          constraints: {
            'email': 'Value of property "mail" must be a valid email.'
          }
        }
      ]
    );
  }

  @test
  async 'validate empty object with correct value for mail'() {
    const newClass = new ValidEMail();
    newClass.mail = 'mailaddress@addedd.com';
    const res = await Validator.validate(newClass);
    expect(res).to.have.length(0);
  }


  @test
  async 'validate required email'() {
    const newClass = new ValidEMailRequired();
    // empty
    let res = await Validator.validate(newClass);
    expect(res).to.have.length(1);
    expect(res).to.be.deep.eq([
        {
          metaType: 'property',
          property: 'mailOtherMessage',
          value: undefined,
          constraints: {
            'email': 'Value of property "mailOtherMessage" must be a valid email.'
          }
        }
      ]
    );
  }

}

