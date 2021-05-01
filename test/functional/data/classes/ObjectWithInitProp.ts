import {PlainObject} from './PlainObject';

export class ObjectWithInitProp {

  stringValue: string = 'string';

  numericValue: number = 123;

  boolValue: boolean = false;

  dateValue: Date = new Date(2021, 1, 1, 1, 1, 1, 0);

  arrValue: string[] = [];

  objValue: object = {};

  objArrValue: object[] = [];

  plainObjValue: PlainObject = new PlainObject();

  plainObjArrValue: PlainObject[] = [];


}
