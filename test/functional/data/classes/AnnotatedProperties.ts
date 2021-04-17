import {Property} from '../../../../src/decorators/Property';

export class AnnotatedProperties {

  // detect by reflactions
  @Property()
  strValue: string;

  @Property({type: 'string'})
  strValueOverride: string;

  @Property({type: 'number'})
  strValueAsNumber: string;

}
