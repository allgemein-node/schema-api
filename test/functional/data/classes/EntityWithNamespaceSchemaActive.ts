import {Schema} from '../../../../src/decorators/Schema';
import {Entity} from '../../../../src/decorators/Entity';
import {Property} from '../../../../src/decorators/Property';
import {Namespace} from '../../../../src';

@Namespace('other')
@Schema({name: 'active'})
@Entity()
export class EntityWithNamespaceSchemaActive {

  @Property()
  value: string;

  @Property()
  numericValue: number;

  @Property()
  numericValue2: number;

}
