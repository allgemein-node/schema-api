import 'reflect-metadata';
import {expect} from 'chai';
import {suite, test} from '@testdeck/mocha';
import {DataContainer, IsEmail, Property, Required} from '../../src';

class ValidateInContainer {
  // @IsEmail()
  @Property()
  email: string;
}


class ValidateInContainerWithRequiredField {
  @Required()
  @IsEmail()
  @Property()
  email: string;
}

@suite('functional/data-container')
class DataContainerSpec {


  @test
  async 'validate empty object with mail'() {
    const newentry = new ValidateInContainer();
    const dataContainer = new DataContainer(newentry);
    let res = await dataContainer.validate();
    expect(res).to.be.true;
  }

  @test
  async 'validate empty object with required mail'() {
    const newentry = new ValidateInContainerWithRequiredField();
    const dataContainer = new DataContainer(newentry);
    let res = await dataContainer.validate();
    expect(res).to.be.false;
    expect(dataContainer.hasErrors()).to.be.true;
    expect(dataContainer.errors).to.be.deep.eq([{
      'constraints': {
        'required': 'Property "email" is required.'
      },
      'property': 'email',
      'type': 'validate',
      'value': undefined
    },
      {
        'constraints': {
          'email': 'Value of property "email" must be a valid email.'
        },
        'property': 'email',
        'type': 'validate',
        'value': undefined
      }]);
  }

  @test
  async 'validate object with passing mail'() {
    const newentry = new ValidateInContainer();
    newentry.email = 'test@test.de';
    const dataContainer = new DataContainer(newentry);
    let res = await dataContainer.validate();
    expect(res).to.be.true;
  }
}

