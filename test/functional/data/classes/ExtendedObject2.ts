import {Property} from '../../../../src';
import {PlainObject03} from './PlainObject03';

export class ExtendedObject2 extends PlainObject03 {

  @Property()
  extValue: string;

}
