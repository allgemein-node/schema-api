import {PlainObject02} from './PlainObject02';
import {Property} from '../../../../src';

export class ExtendedObject2 extends PlainObject02 {

  @Property()
  extValue: string;

}
