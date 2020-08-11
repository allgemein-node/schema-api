import * as _ from 'lodash';
import {ClassRef} from './ClassRef';
import {XS_ANNOTATION_OPTIONS_CACHE, XS_TYPE_ENTITY, XS_TYPE_PROPERTY} from './Constants';
import {IClassRef} from './IClassRef';

import {ClassUtils, MetaArgs} from '@allgemein/base/browser';
import {IPropertyExtentions} from './IPropertyExtentions';


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

    MetaArgs.key(XS_ANNOTATION_OPTIONS_CACHE).push(<IPropertyExtentions>{
      type: XS_TYPE_PROPERTY,
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

    MetaArgs.key(XS_ANNOTATION_OPTIONS_CACHE).push(<IPropertyExtentions>{
      type: XS_TYPE_ENTITY,
      object: source,
      options: options
    });
  }

  static merge(classRef: IClassRef, options: any, property: string = null) {
    if (!classRef) {
      return;
    }

    const object = classRef.getClass(true);
    const addOns = _.filter(MetaArgs.key(XS_ANNOTATION_OPTIONS_CACHE), (x: IPropertyExtentions) =>
      property ?
        (classRef.isPlaceholder ? ClassUtils.getClassName(x.object) === classRef.name : x.object === object) &&
        x.property === property &&
        x.type == XS_TYPE_PROPERTY :
        (classRef.isPlaceholder ? ClassUtils.getClassName(x.object) === classRef.name : x.object === object) &&
        x.type == XS_TYPE_ENTITY
    );

    if (addOns) {
      addOns.forEach(addOn => {
        _.defaults(options, addOn.options);
      });
    }
  }
}
