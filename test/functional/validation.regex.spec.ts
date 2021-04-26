import 'reflect-metadata';
import {expect} from 'chai';
import {suite, test} from '@testdeck/mocha';
import {Validator} from '../../src/lib/validation/Validator';
import {Regex} from '../../src/decorators/validate/Regex';
import {JsonSchema} from '../../src/lib/json-schema/JsonSchema';
import {Property} from '../../src/decorators/Property';
import {ClassRef} from '../../src/lib/ClassRef';
import {IClassRef} from '../../src';

export class ValidRegex {

  @Property()
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
    expect(res).to.be.deep.eq([
      {
        metaType: 'property',
        property: 'onlyString',
        value: 'ab123',
        constraints: {
          'regex': 'Value of property "onlyString" doesn\'t match the regular expression "^\\w\\d+$".'
        }
      }
    ]);
  }

  @test
  async 'serialize as json schema'() {
    const res = JsonSchema.serialize(ClassRef.get(ValidRegex));
    // console.log(inspect(res, false, 10));
    expect(res).to.be.deep.eq({
      '$schema': 'http://json-schema.org/draft-07/schema#',
      definitions: {
        ValidRegex: {
          title: 'ValidRegex',
          type: 'object',
          properties: {
            onlyString: {
              type: 'string',
              pattern: '^\\w\\d+$',
            }
          }
        }
      },
      '$ref': '#/definitions/ValidRegex'
    });
  }

  @test
  async 'unserialize as json schema'() {
    const json = {
      '$schema': 'http://json-schema.org/draft-07/schema#',
      definitions: {
        ValidRegexUn: {
          title: 'ValidRegexUn',
          type: 'object',
          properties: {
            onlyString: {
              type: 'string',
              pattern: '^\\w\\d+$',
            }
          }
        }
      },
      '$ref': '#/definitions/ValidRegexUn'
    };

    const ref = await JsonSchema.unserialize(json, {rootAsEntity: false}) as IClassRef;
    const property = ref.getPropertyRef('onlyString');
    expect(property.getOptions()).to.be.deep.eq({
      'metaType': 'property',
      'namespace': 'default',
      'pattern': '^\\w\\d+$',
      'propertyName': 'onlyString',
      'target': ref.getClass(),
      'type': 'string'
    });


    const entry = ref.create<any>();
    entry.onlyString = 'a123';

    let res = await Validator.validate(entry, ref);
    expect(res).to.have.length(0);
    entry.onlyString = 'email@test';

    res = await Validator.validate(entry, ref);
    expect(res).to.have.length(1);
  }

}

