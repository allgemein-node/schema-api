import {IsEmail} from '../../../../src/decorators/validate/IsEmail';

export class ValidEMail {

  // detect by reflactions
  @IsEmail()
  mail: string;

  @IsEmail({message: 'something else should happen for field %propertyName'})
  mailOtherMessage: string;

}


export class ValidEMailRequired {

  @IsEmail({required: true})
  mailOtherMessage: string;

}
