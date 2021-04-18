import {Required} from '../../../../src/decorators/validate/Required';

export class ValidRequired {

  notReq: string;

  @Required()
  someValue: string;

  @Required({message: 'something else should happen for field %propertyName'})
  someValueReq: string;

}

