import {suite, test} from 'mocha-typescript';
import {AnnotationsHelper, ClassRef, XS_ANNOTATION_OPTIONS_CACHE} from '../../src';
import {MetaArgs} from 'commons-base';


@suite('functional/annotation_helper')
class AnnotationsHelperSpec {


  @test.skip
  async 'annotation on existent'() {
    class Anno01 {
    }

    AnnotationsHelper.forEntityOn(Anno01, {test: true});

    const cache = MetaArgs.key(XS_ANNOTATION_OPTIONS_CACHE);

    console.log(cache);
    const classRef = ClassRef.get(Anno01);
    const options = {};
    AnnotationsHelper.merge(classRef, options);
    console.log(options);
  }

}

