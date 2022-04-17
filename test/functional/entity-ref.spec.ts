import 'reflect-metadata';
import {expect} from 'chai';
import {suite, test} from '@testdeck/mocha';
import {
  C_EVENT_ADD,
  DEFAULT_NAMESPACE,
  K_ENTITY_BUILT,
  METATYPE_CLASS_REF,
  METATYPE_ENTITY
} from '../../src/lib/Constants';
import {RegistryFactory} from '../../src/lib/registry/RegistryFactory';
import {AnnotatedEntity} from './data/classes/AnnotatedEntity';
import {AnnotatedEntityWithProp} from './data/classes/AnnotatedEntityWithProp';
import {MetadataRegistry} from '../../src/lib/registry/MetadataRegistry';
import {IEntityOptions} from '../../src/lib/options/IEntityOptions';
import {DynamicObjectSec} from './data/classes/DynamicObjectSec';
import {IEntityRef} from '../../src/api/IEntityRef';
import {IClassRef} from '../../src/api/IClassRef';
import {TestClass} from './data/classes/TestClass';
import {TestClassWithEmbedded} from './data/classes/TestClassWithEmbedded';
import {isLookupRegistry} from '../../src/api/ILookupRegistry';
import {Entity} from "../../src";


@suite('functional/entity-ref')
class EntityRefSpec {

  @test
  async 'lookup registry typed method'() {
    const registry = RegistryFactory.get();
    expect(isLookupRegistry(registry)).to.be.true;
    expect(isLookupRegistry({})).to.be.false;
  }

  @test
  async 'lookup registry for simple annotated class'() {
    const registry = RegistryFactory.get();
    const entityRef = registry.getEntityRefFor(AnnotatedEntity);
    const namespace = entityRef.getClassRef().getNamespace();
    const refs = entityRef.getPropertyRefs();
    expect(refs).to.have.length(0);
    expect(namespace).to.be.eq(DEFAULT_NAMESPACE);
  }

  @test
  async 'additional properties over static properties'() {
    Entity()
    class AddProp {

    }

    Object.defineProperty(AddProp, K_ENTITY_BUILT, {value: true, writable: false});
    const registry = RegistryFactory.get();
    const entityRef = registry.getEntityRefFor(AddProp);
    const namespace = entityRef.getClassRef().getNamespace();
    expect(namespace).to.be.eq(DEFAULT_NAMESPACE);
    expect(entityRef.getOptions()).to.deep.eq({
      [K_ENTITY_BUILT]: true,
      "metaType": "entity",
      "name": "AddProp",
      "namespace": "default",
      "target": AddProp
    });
  }

  @test
  async 'lookup registry for annotated class with properties'() {
    const registry = RegistryFactory.get();
    const entityRef = registry.getEntityRefFor(AnnotatedEntityWithProp);
    const namespace = entityRef.getClassRef().getNamespace();
    const refs = entityRef.getPropertyRefs();
    expect(refs).to.have.length(3);
    expect(namespace).to.be.eq(DEFAULT_NAMESPACE);
  }


  @test
  async 'dynamically add entity options and check that entity ref is created'() {
    const registry = RegistryFactory.get();
    let entityRefs = registry.filter(METATYPE_ENTITY, (x: IEntityRef) => x.getClassRef().name === DynamicObjectSec.name);
    expect(entityRefs).to.have.length(0);
    let classRefs = registry.filter(METATYPE_CLASS_REF, (x: IClassRef) => x.name === DynamicObjectSec.name);
    expect(classRefs).to.have.length(0);
    const waitForEventAdd = new Promise((resolve, reject) => {
      MetadataRegistry.$().once(C_EVENT_ADD, resolve);
    });

    MetadataRegistry.$().add(METATYPE_ENTITY, <IEntityOptions>{
      target: DynamicObjectSec,
      name: DynamicObjectSec.name
    });

    await waitForEventAdd;

    entityRefs = registry.filter(METATYPE_ENTITY, (x: IEntityRef) => x.getClassRef().name === DynamicObjectSec.name);
    expect(entityRefs).to.have.length(1);
    classRefs = registry.filter(METATYPE_CLASS_REF, (x: IClassRef) => x.name === DynamicObjectSec.name);
    expect(classRefs).to.have.length(1);

    MetadataRegistry.$().remove(METATYPE_ENTITY,
      x => x.target === DynamicObjectSec,
      false
    );
  }


  @test
  async 'create new object of given simple class'() {
    const registry = RegistryFactory.get();
    const entityRef = registry.getEntityRefFor(TestClass);
    const namespace = entityRef.getClassRef().getNamespace();
    const refs = entityRef.getPropertyRefs();
    expect(refs).to.have.length(5);
    expect(namespace).to.be.eq(DEFAULT_NAMESPACE);

    const object = entityRef.create<TestClass>();
    expect(object).to.instanceOf(TestClass);

    const entityRef2 = registry.getEntityRefFor(object);
    expect(entityRef).to.be.eq(entityRef2);
  }


  @test
  async 'build class from plain object - with default settings: filter undefined properties'() {
    const registry = RegistryFactory.get();
    const entityRef = registry.getEntityRefFor(TestClass);
    const namespace = entityRef.getClassRef().getNamespace();
    const refs = entityRef.getPropertyRefs();
    expect(refs).to.have.length(5);
    expect(namespace).to.be.eq(DEFAULT_NAMESPACE);

    const obj = {
      str: 'present',
      str2: 'nopresent',
      nr: 100,
      nr2: -100,
    };

    let object = entityRef.build<TestClass>(obj);
    expect(object).to.instanceOf(TestClass);
    expect(object).to.be.deep.eq({
      str: 'present',
      nr: 100,
      '__CLASS__': 'TestClass',
      '__NS__': 'default'
    });
  }

  @test
  async 'build class from plain object - createAndCopy mode pass undeifned properties'() {
    const registry = RegistryFactory.get();
    const entityRef = registry.getEntityRefFor(TestClass);
    const namespace = entityRef.getClassRef().getNamespace();
    const refs = entityRef.getPropertyRefs();
    expect(refs).to.have.length(5);
    expect(namespace).to.be.eq(DEFAULT_NAMESPACE);

    const obj = {
      str: 'present',
      str2: 'nopresent',
      nr: 100,
      nr2: -100,
    };

    const object = entityRef.build<TestClass>(obj, {
      createAndCopy: true
    });
    expect(object).to.instanceOf(TestClass);
    expect(object).to.be.deep.eq({
      '__CLASS__': 'TestClass',
      '__NS__': 'default',
      str: 'present',
      str2: 'nopresent',
      nr: 100,
      nr2: -100,
    });
  }


  @test
  async 'build class from object with embedded entity in single ref field'() {
    const registry = RegistryFactory.get();
    const entityRef = registry.getEntityRefFor(TestClassWithEmbedded);
    const namespace = entityRef.getClassRef().getNamespace();
    const refs = entityRef.getPropertyRefs();
    expect(refs).to.have.length(2);
    expect(namespace).to.be.eq(DEFAULT_NAMESPACE);

    const obj = {
      single: {
        str: 'data',
        nr: 100
      }
    };

    const object = entityRef.build<TestClassWithEmbedded>(obj);
    expect(object).to.instanceOf(TestClassWithEmbedded);
    expect(object).to.be.deep.eq({
      '__CLASS__': 'TestClassWithEmbedded',
      '__NS__': 'default',
      single: {
        str: 'data',
        nr: 100,
        '__CLASS__': 'TestClass',
        '__NS__': 'default'
      }
    });
    expect(object.single).to.instanceOf(TestClass);
  }


  @test
  async 'build class from object with embedded entities in multiple ref field'() {
    const registry = RegistryFactory.get();
    const entityRef = registry.getEntityRefFor(TestClassWithEmbedded);
    const namespace = entityRef.getClassRef().getNamespace();
    const refs = entityRef.getPropertyRefs();
    expect(refs).to.have.length(2);
    expect(namespace).to.be.eq(DEFAULT_NAMESPACE);

    const obj = {
      '__CLASS__': 'TestClassWithEmbedded',
      '__NS__': 'default',
      multiple: [
        {
          str: 'data',
          nr: 100,
          '__CLASS__': 'TestClass',
          '__NS__': 'default'
        },
        {
          str: 'welt',
          nr: 101,
          '__CLASS__': 'TestClass',
          '__NS__': 'default'

        }
      ]
    };

    const object = entityRef.build<TestClassWithEmbedded>(obj);
    expect(object).to.instanceOf(TestClassWithEmbedded);
    expect(object).to.be.deep.eq({
      '__CLASS__': 'TestClassWithEmbedded',
      '__NS__': 'default',
      'multiple': [
        {
          '__CLASS__': 'TestClass',
          '__NS__': 'default',
          'nr': 100,
          'str': 'data'
        },
        {
          '__CLASS__': 'TestClass',
          '__NS__': 'default',
          'nr': 101,
          'str': 'welt'
        }
      ]
    });
    expect(object.multiple[0]).to.instanceOf(TestClass);
    expect(object.multiple[1]).to.instanceOf(TestClass);
  }


}

