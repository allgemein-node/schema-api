
import {IObjectOptions} from '../lib/options/IObjectOptions';
import {MetadataStorage} from '@allgemein/base/libs/MetadataStorage';
import {METADATA_ENTITY_KEY, METADATA_OBJECT_KEY} from '..';


export function Object(options: IObjectOptions = {}) {
  return function (object: Function) {
    // classRefGet(object).setOptions(options);
    MetadataStorage.key(METADATA_OBJECT_KEY).push(options);
  };
}

