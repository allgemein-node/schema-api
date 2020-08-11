import {ISchemaOptions} from '../lib/options/ISchemaOptions';
import {MetadataStorage} from '@allgemein/base/libs/MetadataStorage';
import {METADATA_OBJECT_KEY, METADATA_SCHEMA_KEY} from '..';


export function Schema(options: ISchemaOptions) {
  return function (object: Function) {
    MetadataStorage.key(METADATA_SCHEMA_KEY).push(options);
  };
}

