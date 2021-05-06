import 'reflect-metadata';
import {expect} from 'chai';
import {suite, test} from '@testdeck/mocha';
import {ClassRef, IClassRef, JsonSchema, Validator} from '../../src';
import {ValidRegex} from './validation.regex.spec';


@suite('functional/validations - uri-reference')
class ValidationUriReferenceSpec {


  @test.skip
  async 'TODO'() {
    expect([]).to.have.length(0);
  }


  @test.skip
  async 'serialize as json schema'() {
  }

  @test.skip
  async 'unserialize as json schema'() {
  }

}

