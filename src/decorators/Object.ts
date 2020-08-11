
import {IObjectOptions} from '../lib/options/IObjectOptions';


export function Object(options: IObjectOptions = {}) {
  return function (object: Function) {
    // classRefGet(object).setOptions(options);
  };
}

