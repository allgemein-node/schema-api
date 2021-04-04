import {Property} from '../../../../src/decorators/Property';
import {PlainObject} from './PlainObject';

export class AnnotatedObjectWithRefs {

  @Property()
  plain: PlainObject;

  @Property(PlainObject)
  plainRef: object;

  @Property(() => PlainObject)
  plainRefByFunc: object;

  @Property({type: PlainObject})
  plainRefByType: object;

  @Property({type: () => PlainObject})
  plainRefByTypeFunc: object;

  @Property()
  arrPlain: PlainObject[];

  @Property({type: PlainObject, cardinality: 0})
  arrPlainRefByType: object[];

  @Property({type: () => PlainObject, cardinality: 0})
  arrPlainRefByTypeFunc: object[];

}
