import {IsEmail} from '../../../../src/decorators/validate/IsEmail';
import {Required} from '../../../../src';

export class ValidEMail {

  // detect by reflactions
  @IsEmail()
  mail: string;

  @IsEmail({message: 'something else should happen for field %propertyName'})
  mailOtherMessage: string;

}


export class ValidEMailRequired {

  @Required()
  @IsEmail()
  mailOtherMessage: string;

}
