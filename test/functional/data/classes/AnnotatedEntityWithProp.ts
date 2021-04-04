import {Entity} from '../../../../src/decorators/Entity';
import {Property} from '../../../../src/decorators/Property';

@Entity()
export class AnnotatedEntityWithProp {

  @Property()
  strValue: string;

  @Property({type: 'string'})
  strValueOverride: string;

  @Property({type: 'number'})
  strValueAsNumber: string;

}
