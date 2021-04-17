import * as _ from 'lodash';
import {ClassRef} from './ClassRef';
import {MERGE_TYPE, METATYPE_ENTITY, METATYPE_PROPERTY, XS_ANNOTATION_OPTIONS_CACHE} from './Constants';
import {ClassUtils} from '@allgemein/base';
import {MetadataStorage} from '@allgemein/base/libs/MetadataStorage';
import {IPropertyExtentions} from '../api/IPropertyExtentions';
import {IClassRef} from '../api/IClassRef';


export class AnnotationsHelper {

  static forPropertyOn(object: Function, property: string, options: any, merge?: MERGE_TYPE) {
    const source = ClassUtils.getFunction(object);
    const classRefs: ClassRef[] = ClassRef.filter(c => c.originalValue === source);

    for (const ref of classRefs) {
      let prop = ref.getPropertyRef(property);
      if (prop) {
        const pOptions = prop.getOptions();
        _.defaults(pOptions, options);
        if (ref.hasEntityRef()) {
          const eOptions = ref.getEntityRef().getOptions();
          _.defaults(eOptions, options);
        }
      }
    }

    MetadataStorage.key(XS_ANNOTATION_OPTIONS_CACHE).push(<IPropertyExtentions>{
      type: METATYPE_PROPERTY,
      object: source,
      property: property,
      options: options,
      merge: merge ? merge : 'default'
    });
  }


  static forEntityOn(object: Function, options: any, merge?: MERGE_TYPE) {
    const source = ClassUtils.getFunction(object);
    const classRefs: ClassRef[] = ClassRef.filter(c => c.originalValue === source);

    for (const ref of classRefs) {
      if (ref) {
        let pOptions = ref.getOptions();
        _.defaults(pOptions, options);
        if (ref.hasEntityRef()) {
          const eOptions = ref.getEntityRef().getOptions();
          _.defaults(eOptions, options);
        }
      }
    }

    MetadataStorage.key(XS_ANNOTATION_OPTIONS_CACHE).push(<IPropertyExtentions>{
      type: METATYPE_ENTITY,
      object: source,
      options: options,
      merge: merge
    });
  }

  static merge(classRef: IClassRef, options: any, property: string = null) {
    if (!classRef) {
      return;
    }

    const object = classRef.getClass(true);
    const addOns: IPropertyExtentions[] = _.filter(MetadataStorage.key(XS_ANNOTATION_OPTIONS_CACHE), (x: IPropertyExtentions) =>
      property ?
        (classRef.isPlaceholder ? ClassUtils.getClassName(x.object) === classRef.name : x.object === object) &&
        x.property === property &&
        x.type == METATYPE_PROPERTY :
        (classRef.isPlaceholder ? ClassUtils.getClassName(x.object) === classRef.name : x.object === object) &&
        x.type == METATYPE_ENTITY
    );

    if (addOns) {
      addOns.forEach(addOn => {
        const merge: MERGE_TYPE = _.get(addOn, 'merge', 'default');
        switch (merge) {
          case 'merge':
            for (const k of _.keys(addOn.options)) {
              if (_.isUndefined(options[k]) || _.isEmpty(options[k])) {
                options[k] = addOn.options[k];
              } else if (_.isArray(options[k])) {
                options[k].push(addOn.options[k]);
              } else {
                options[k] = [options[k], addOn.options[k]];
              }
            }
            break;
          case 'assign':
            _.assign(options, addOn.options);
            break;
          default:
            _.defaults(options, addOn.options);
        }

      });
    }
  }
}
