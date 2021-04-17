import 'reflect-metadata';
import {expect} from 'chai';
import {suite, test} from '@testdeck/mocha';
import {ValidEMail} from './data/classes/ValidEMail';
import {Validator} from './../../src/lib/validation/Validator';


@suite('functional/validations')
class ValidationsSpec {


  @test
  async 'validate email'() {
    const newClass = new ValidEMail();
    newClass.mail = '';
    let res = await Validator.validate(newClass);
    console.log(res);
    expect(res).to.have.length(1);

    newClass.mail = 'mailaddress';
    res = await Validator.validate(newClass);
    console.log(res);
    expect(res).to.have.length(1);

    newClass.mail = 'mailaddress@addedd';
    res = await Validator.validate(newClass);
    console.log(res);
    expect(res).to.have.length(1);

    newClass.mail = 'mailaddress@addedd.com';
    res = await Validator.validate(newClass);
    expect(res).to.have.length(0);
  }


}

