import {Property} from '../../../../src/decorators/Property';
import {Entity} from '../../../../src/decorators/Entity';
import {TestClass} from './TestClass';

@Entity()
export class TestClassWithEmbedded {

  // detect by reflactions
  @Property()
  single: TestClass;

  @Property(() => TestClass)
  multiple: TestClass[];

}
