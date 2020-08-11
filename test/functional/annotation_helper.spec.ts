import {AnnotationsHelper, ClassRef, XS_ANNOTATION_OPTIONS_CACHE} from '../../src';
import {MetadataStorage} from '@allgemein/base/libs/MetadataStorage';
import {suite, test} from '@testdeck/mocha';


@suite('functional/annotation_helper')
class AnnotationsHelperSpec {


  @test.skip
  async 'annotation on existent'() {
    class Anno01 {
    }

    AnnotationsHelper.forEntityOn(Anno01, {test: true});

    const cache = MetadataStorage.key(XS_ANNOTATION_OPTIONS_CACHE);

    console.log(cache);
    const classRef = ClassRef.get(Anno01);
    const options = {};
    AnnotationsHelper.merge(classRef, options);
    console.log(options);
  }

}

