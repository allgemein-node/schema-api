import {Property} from '../../../../src/decorators/Property';
import {Entity} from '../../../../src/decorators/Entity';

@Entity()
export class TestClass {

  // detect by reflactions
  @Property()
  str: string;

  @Property()
  nr: number;

  @Property()
  bool: boolean;

  @Property()
  obj: object;

  @Property()
  date: Date;


}
