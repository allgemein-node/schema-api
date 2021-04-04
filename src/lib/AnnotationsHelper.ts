import * as _ from 'lodash';
import {ClassRef} from './ClassRef';
import {XS_ANNOTATION_OPTIONS_CACHE, METATYPE_ENTITY, METATYPE_PROPERTY} from './Constants';
import {ClassUtils} from '@allgemein/base';
import {MetadataStorage} from '@allgemein/base/libs/MetadataStorage';
import {IPropertyExtentions} from '../api/IPropertyExtentions';
import {IClassRef} from '../api/IClassRef';


export class AnnotationsHelper {

  static forPropertyOn(object: Function, property: string, options: any) {
    const source = ClassUtils.getFunction(object);
    const classRefs: ClassRef[] = ClassRef.filter(c => c.originalValue === source);

    for (const ref of classRefs) {
      let prop = ref.getPropertyRef(property);
      if (prop) {
        const pOptions = prop.getOptions();
        _.defaults(pOptions, options);
        if (ref.isEntity) {
          const eOptions = ref.getEntityRef().getOptions();
          _.defaults(eOptions, options);
        }
      }
    }

    MetadataStorage.key(XS_ANNOTATION_OPTIONS_CACHE).push(<IPropertyExtentions>{
      type: METATYPE_PROPERTY,
      object: source,
      property: property,
      options: options
    });
  }


  static forEntityOn(object: Function, options: any) {
    const source = ClassUtils.getFunction(object);
    const classRefs: ClassRef[] = ClassRef.filter(c => c.originalValue === source);

    for (const ref of classRefs) {
      if (ref) {
        let pOptions = ref.getOptions();
        _.defaults(pOptions, options);
        if (ref.isEntity) {
          const eOptions = ref.getEntityRef().getOptions();
          _.defaults(eOptions, options);
        }
      }
    }

    MetadataStorage.key(XS_ANNOTATION_OPTIONS_CACHE).push(<IPropertyExtentions>{
      type: METATYPE_ENTITY,
      object: source,
      options: options
    });
  }

  static merge(classRef: IClassRef, options: any, property: string = null) {
    if (!classRef) {
      return;
    }

    const object = classRef.getClass(true);
    const addOns = _.filter(MetadataStorage.key(XS_ANNOTATION_OPTIONS_CACHE), (x: IPropertyExtentions) =>
      property ?
        (classRef.isPlaceholder ? ClassUtils.getClassName(x.object) === classRef.name : x.object === object) &&
        x.property === property &&
        x.type == METATYPE_PROPERTY :
        (classRef.isPlaceholder ? ClassUtils.getClassName(x.object) === classRef.name : x.object === object) &&
        x.type == METATYPE_ENTITY
    );

    if (addOns) {
      addOns.forEach(addOn => {
        _.defaults(options, addOn.options);
      });
    }
  }
}
