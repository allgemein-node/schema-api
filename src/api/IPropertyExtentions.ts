// import {METADATA_AND_BIND_TYPE} from './Constants';

import {METADATA_AND_BIND_TYPE} from '../lib/Constants';

export interface IPropertyExtentions {

  type: METADATA_AND_BIND_TYPE,

  object: Function,

  property?: string,

  options: any

}
