import {METATYPE_CLASS_REF, METATYPE_EMBEDDABLE, METATYPE_ENTITY, METATYPE_NAMESPACE} from '../lib/Constants';
import {MetadataRegistry} from '../lib/registry/MetadataRegistry';
import {IAttributeOptions} from '../lib/options/IAttributeOptions';

export function Namespace(ns: string) {
  return function (object: Function) {
    const options: IAttributeOptions = {
      target: object,
      targetTypes: [
        METATYPE_ENTITY,
        METATYPE_CLASS_REF,
        METATYPE_EMBEDDABLE
      ],
      attributes: {
        namespace: ns
      }
    };
    MetadataRegistry.$().add(METATYPE_NAMESPACE, options, false);
  };
}

