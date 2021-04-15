import {PlainObject} from './PlainObject';

export class ObjectWithInitProp02 {

  stringValue: string = 'string';

  numericValue: number = 123;

  boolValue: boolean = false;

  dateValue: Date = new Date();

  arrValue: string[] = [];

  objValue: object = {};

  objArrValue: object[] = [];

  plainObjValue: PlainObject = new PlainObject();

  plainObjArrValue: PlainObject[] = [];


}
