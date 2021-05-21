import {assign, defaults, filter, get, isArray, isEmpty, isObjectLike, isUndefined, keys, merge} from 'lodash';
import {ClassRef} from './ClassRef';
import {MERGE_TYPE, METATYPE_ENTITY, METATYPE_PROPERTY, XS_ANNOTATION_OPTIONS_CACHE} from './Constants';
import {ClassUtils, MetadataStorage} from '@allgemein/base';
import {IPropertyExtentions} from '../api/IPropertyExtentions';
import {IClassRef} from '../api/IClassRef';


export class AnnotationsHelper {

  static forPropertyOn(object: Function, property: string, options: any, merge?: MERGE_TYPE) {
    const source = ClassUtils.getFunction(object);
    const classRefs: IClassRef[] = ClassRef.filter(c => c.getClass() === source);

    for (const ref of classRefs) {
      let prop = ref.getPropertyRef(property);
      if (prop) {
        const pOptions = prop.getOptions();
        defaults(pOptions, options);
        if (ref.hasEntityRef()) {
          const eOptions = ref.getEntityRef().getOptions();
          defaults(eOptions, options);
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
    const classRefs: IClassRef[] = ClassRef.filter(c => c.getClass() === source);

    for (const ref of classRefs) {
      if (ref) {
        let pOptions = ref.getOptions();
        defaults(pOptions, options);
        if (ref.hasEntityRef()) {
          const eOptions = ref.getEntityRef().getOptions();
          defaults(eOptions, options);
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
    const addOns: IPropertyExtentions[] = filter(MetadataStorage.key(XS_ANNOTATION_OPTIONS_CACHE), (x: IPropertyExtentions) =>
      property ?
        (classRef.isPlaceholder ? ClassUtils.getClassName(x.object) === classRef.name : x.object === object) &&
        x.property === property &&
        x.type == METATYPE_PROPERTY :
        (classRef.isPlaceholder ? ClassUtils.getClassName(x.object) === classRef.name : x.object === object) &&
        x.type == METATYPE_ENTITY
    );

    if (addOns) {
      addOns.forEach(addOn => {
        const mergeType: MERGE_TYPE = get(addOn, 'merge', 'default');
        switch (mergeType) {
          case 'merge':
            for (const k of keys(addOn.options)) {
              if (isUndefined(options[k]) || isEmpty(options[k])) {
                // create if not present
                options[k] = addOn.options[k];
              } else if (isArray(options[k])) {
                // add to array
                options[k].push(addOn.options[k]);
              } else if (isObjectLike(options[k]) && isObjectLike(addOn.options[k])) {
                merge(options[k], addOn.options[k]);
              } else {
                // create array
                options[k] = [options[k], addOn.options[k]];
              }
            }
            break;
          case 'assign':
            assign(options, addOn.options);
            break;
          default:
            defaults(options, addOn.options);
        }

      });
    }
  }
}
