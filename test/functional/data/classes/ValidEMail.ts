import {IsEmail} from '../../../../src/decorators/validate/IsEmail';

export class ValidEMail {

  // detect by reflactions
  @IsEmail()
  mail: string;


}
