import 'reflect-metadata';
import {suite, test} from '@testdeck/mocha';
import {expect} from 'chai';
import {RegistryFactory} from '../../src/lib/registry/RegistryFactory';
import {TestRegistry} from './data/registry/TestRegistry';
import {ClassRef} from '../../src/lib/ClassRef';
import {PlainObject} from './data/classes/PlainObject';
import {MultiRefObject} from './data/classes/MultiRefObject';
import {DefaultNamespacedRegistry} from '../../src/lib/registry/DefaultNamespacedRegistry';


@suite('functional/registry')
class RegistrySpec {

  static before() {
    RegistryFactory.register('test', new TestRegistry('test'));
  }


  @test
  async 'create simple class in new registry'() {
    const refInClass = ClassRef.get(PlainObject, 'test');
    expect(refInClass.getRegistry()).to.be.instanceOf(TestRegistry);
  }

  @test
  async 'compare refs of the same object from different repos'() {
    const refInTest = ClassRef.get(MultiRefObject, 'test');
    const refInAnother = ClassRef.get(MultiRefObject, 'tester');
    expect(refInAnother.getRegistry()).to.be.instanceOf(DefaultNamespacedRegistry);
    expect(refInTest.getRegistry()).to.be.instanceOf(TestRegistry);
    expect(refInAnother).to.be.not.eq(refInTest);
    expect(refInAnother.getClass()).to.be.eq(refInTest.getClass());

    const namespaces = RegistryFactory.getNamespaces();
    expect(namespaces).to.include('test')
    expect(namespaces).to.include('tester')
  }

}

