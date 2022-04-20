import {Entity} from '../../../../src/decorators/Entity';
import {Namespace,} from '../../../../src/decorators/Namespace';
import {Property} from '../../../../src/decorators/Property';
import {EntityWithNamespaceEmbedded} from './EntityWithNamespaceEmbedded';

@Namespace('first')
@Entity()
export class EntityWithNamespaceFirst {

  @Property()
  value: string;

  @Property()
  ref: EntityWithNamespaceEmbedded;

}
