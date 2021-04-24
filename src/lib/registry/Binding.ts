import {METADATA_AND_BIND_TYPE} from '../Constants';

export class Binding {

  bindingType: METADATA_AND_BIND_TYPE;

  sourceType: METADATA_AND_BIND_TYPE;
  source: any;

  targetType: METADATA_AND_BIND_TYPE;
  target: any;

  static create(sType: METADATA_AND_BIND_TYPE, sName: any, tType: METADATA_AND_BIND_TYPE, tName: any) {
    let b = new Binding();
    b.bindingType = <METADATA_AND_BIND_TYPE>[sType, tType].join('_');
    b.sourceType = sType;
    b.targetType = tType;
    b.source = sName;
    b.target = tName;
    return b;
  }
}
