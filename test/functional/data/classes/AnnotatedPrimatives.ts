import {Property} from '../../../../src/decorators/Property';
import {PlainObject} from './PlainObject';

export class AnnotatedPrimatives {

  @Property()
  strValue: string;

  @Property()
  numberValue: number;

  @Property()
  dateValue: Date;

  @Property()
  boolValue: boolean;

  @Property()
  nullValue: null;

}


export class AnnotatedPrimatives2 {

  @Property()
  strValue: string;

  @Property()
  numberValue: number;

  @Property()
  dateValue: Date;

  @Property()
  boolValue: boolean;

  @Property()
  nullValue: null;

}
