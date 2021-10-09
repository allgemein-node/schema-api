import {Schema} from '../../../../src/decorators/Schema';
import {Entity} from '../../../../src/decorators/Entity';
import {Property} from '../../../../src/decorators/Property';
import {Namespace} from '../../../../src';

@Namespace('other')
@Schema({name: 'simple'})
@Entity()
export class EntityWithNamespaceSchemaSimple {

  @Property()
  value: string;

  @Property()
  numericValue: number;

  @Property()
  numericValue2: number;

}
