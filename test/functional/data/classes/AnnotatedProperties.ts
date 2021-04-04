import {Property} from '../../../../src/decorators/Property';
import {PlainObject} from './PlainObject';

export class AnnotatedProperties {

  // detect by reflactions
  @Property()
  strValue: string;

  @Property({type: 'string'})
  strValueOverride: string;

  @Property({type: 'number'})
  strValueAsNumber: string;

}
