import {IClassRef, isClassRef} from "../api/IClassRef";
import {IEntityRef, isEntityRef} from "../api/IEntityRef";
import {ClassUtils} from "@allgemein/base";

export function getClassName(klass: Function | IClassRef | IEntityRef) {
  if (isEntityRef(klass)) {
    return klass.getClassRef().name;
  } else if (isClassRef(klass)) {
    return klass.name;
  } else {
    return ClassUtils.getClassName(klass);
  }
}
