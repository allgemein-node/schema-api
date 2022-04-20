import {Entity} from '../../../../src/decorators/Entity';
import {Namespace, Property} from "../../../../src";

@Namespace('embedded')
@Entity()
export class EntityWithNamespaceEmbedded {
  @Property()
  value: string;
}
