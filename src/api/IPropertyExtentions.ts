// import {METADATA_AND_BIND_TYPE} from './Constants';

import {MERGE_TYPE, METADATA_TYPE} from '../lib/Constants';

export interface IPropertyExtentions {

  type: METADATA_TYPE,

  object: Function,

  property?: string,

  options: any

  merge?: MERGE_TYPE;

}
