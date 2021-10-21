import 'reflect-metadata';
import {suite, test} from '@testdeck/mocha';
import {expect} from 'chai';
import {RegistryFactory} from '../../src/lib/registry/RegistryFactory';
import {TestRegistry} from './data/registry/TestRegistry';
import {ClassRef} from '../../src/lib/ClassRef';
import {PlainObject} from './data/classes/PlainObject';
import {MultiRefObject} from './data/classes/MultiRefObject';
import {DefaultNamespacedRegistry} from '../../src/lib/registry/DefaultNamespacedRegistry';
import {PlainObjectWithDeclaredArray} from './data/classes/PlainObjectWithDeclaredArray';


@suite('functional/registry')
class RegistrySpec {

  static before() {
    RegistryFactory.register('test', TestRegistry);
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
    expect(namespaces).to.include('test');
    expect(namespaces).to.include('tester');
  }


  @test
  async 'check if registry handle unannotated "array" property correctly'() {
    const REGNAME = 'unanno';
    const registry = RegistryFactory.get(REGNAME);
    const refUnanno = ClassRef.get(PlainObjectWithDeclaredArray, REGNAME);
    const props = refUnanno.getPropertyRefs();
    expect(props).to.have.length(1);
    expect(props[0].getOptions('default')).to.deep.eq([
      'plain',
      'object',
      'with',
      'array'
    ]);
  }


  @test
  async 'check if registry not supporting "unannotated" properties works correctly'() {
    const REGNAME = 'unanno2';
    const registry = RegistryFactory.get(REGNAME, {detectUnannotatedProperties: false});
    const refUnanno = ClassRef.get(PlainObjectWithDeclaredArray, REGNAME);
    const props = refUnanno.getPropertyRefs();
    expect(props).to.have.length(0);
  }
}

