import {Schema} from '../../../../src/decorators/Schema';
import {Entity} from '../../../../src/decorators/Entity';
import {Property} from '../../../../src/decorators/Property';

@Schema({name: 'timeout'})
@Entity()
export class EntityWithSchemaTimeout {

  @Property()
  value: string;

  @Property()
  numericValue: number;

  @Property()
  numericValue2: number;

}
