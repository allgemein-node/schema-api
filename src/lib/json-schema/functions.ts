import {IJsonSchema7} from "./JsonSchema7";
import {assign} from "lodash";
import {REFLECT_DESIGN_TYPE, T_ARRAY, T_OBJECT} from "../Constants";


export function setDefaultArray(schema: IJsonSchema7) {
  assign(schema, {
    type: T_ARRAY,
    items: {
      type: T_OBJECT
    }
  });
}

export function getReflectedType(clazz: Function, propertyName: string) {
  return Reflect && Reflect.getMetadata ?
    Reflect.getMetadata(REFLECT_DESIGN_TYPE, clazz, propertyName) : undefined;

}
