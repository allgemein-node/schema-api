//
// import {MetadataStorage} from '@allgemein/base/libs/MetadataStorage';
// import {suite, test} from '@testdeck/mocha';
// import {AnnotationsHelper} from '../../src/lib/AnnotationsHelper';
// import {XS_ANNOTATION_OPTIONS_CACHE} from '../../src/lib/Constants';
// import {ClassRef} from '../../src/lib/ClassRef';
//
//
// @suite('functional/annotation_helper')
// class AnnotationsHelperSpec {
//
//
//   @test.skip
//   async 'annotation on existent'() {
//     class Anno01 {
//     }
//
//     AnnotationsHelper.forEntityOn(Anno01, {test: true});
//
//     const cache = MetadataStorage.key(XS_ANNOTATION_OPTIONS_CACHE);
//
//     console.log(cache);
//     const classRef = ClassRef.get(Anno01);
//     const options = {};
//     AnnotationsHelper.merge(classRef, options);
//     console.log(options);
//   }
//
// }
//
