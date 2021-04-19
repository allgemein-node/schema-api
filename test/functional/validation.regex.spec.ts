import 'reflect-metadata';
import {expect} from 'chai';
import {suite, test} from '@testdeck/mocha';
import {Validator} from '../../src/lib/validation/Validator';
import {Regex} from '../../src/decorators/validate/Regex';


export class ValidRegex {

  @Regex(/^\w\d+$/)
  onlyString: string;


}


@suite('functional/validations - regex')
class ValidationRegexSpec {

  @test
  async 'validate regex - only string - empty'() {
    let newClass = new ValidRegex();
    const res = await Validator.validate(newClass);
    expect(res).to.have.length(0);
  }

  @test
  async 'validate regex - only string - match'() {
    let newClass = new ValidRegex();
    newClass.onlyString = 'a123';
    const res = await Validator.validate(newClass);
    expect(res).to.have.length(0);
  }


  @test
  async 'validate regex - only string - fail'() {
    let newClass = new ValidRegex();
    newClass.onlyString = 'ab123';
    const res = await Validator.validate(newClass);
    expect(res).to.have.length(1);
    console.log(res);
    expect(res).to.be.deep.eq([
      {
        metaType: 'property',
        property: 'onlyString',
        value: 'ab123',
        constraints: {
          regex: `Value of property "onlyString" doesn't match the regular expression "%options.source".`
        }
      }
    ]);
  }

}

