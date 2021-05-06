import 'reflect-metadata';
import {expect} from 'chai';
import {suite, test} from '@testdeck/mocha';
import {ClassRef} from '../../src/lib/ClassRef';
import {PlainObject} from './data/classes/PlainObject';
import {C_EVENT_ADD, DEFAULT_NAMESPACE, METATYPE_PROPERTY} from '../../src/lib/Constants';
import {IPropertyOptions} from '../../src/lib/options/IPropertyOptions';
import {MetadataRegistry} from '../../src/lib/registry/MetadataRegistry';
import {ExtendedObject} from './data/classes/ExtendedObject';
import {ObjectWithInitProp} from './data/classes/ObjectWithInitProp';
import {DynamicObject} from './data/classes/DynamicObject';
import {AnnotatedProperties} from './data/classes/AnnotatedProperties';
import {AnnotatedObjectWithRefs} from './data/classes/AnnotatedPropertiesWithRefs';
import {AnnotatedPrimatives} from './data/classes/AnnotatedPrimatives';
import {PlainObject02} from './data/classes/PlainObject02';
import {ObjectWithInitProp02} from './data/classes/ObjectWithInitProp02';


@suite('functional/class-ref')
class ClassRefSpec {


  /**
   * Create class ref dynamically for imported and named class.
   */
  @test
  async 'create class ref for empty plain class without properties'() {
    const classRef = ClassRef.get(PlainObject);
    const refs = classRef.getPropertyRefs();
    const namespace = classRef.getNamespace();
    expect(refs).to.have.length(0);
    expect(namespace).to.be.eq(DEFAULT_NAMESPACE);
  }


  /**
   * Create class ref dynamically for imported and named class,
   * also declaring property dynamically.
   */
  @test
  async 'create class ref for plain class dynamically properties'() {
    // declaring property
    MetadataRegistry.$().add(METATYPE_PROPERTY, <IPropertyOptions>{
      target: PlainObject02,
      propertyName: 'dynaProp'
    }, false);

    const classRef = ClassRef.get(PlainObject02);
    const namespace = classRef.getNamespace();
    expect(namespace).to.be.eq(DEFAULT_NAMESPACE);
    const refs = classRef.getPropertyRefs();
    expect(refs).to.have.length(1);

    // remove
    MetadataRegistry.$().remove(METATYPE_PROPERTY, x => x.propertyName === 'dynaProp' && x.target === PlainObject02, false);

    // TODO create new

    // TODO build from object
  }


  /**
   * create class ref from plain class with initializing properties
   */
  @test
  async 'create class ref from plain class with initializing properties'() {
    const classRef = ClassRef.get(ObjectWithInitProp);
    const namespace = classRef.getNamespace();
    expect(namespace).to.be.eq(DEFAULT_NAMESPACE);
    const refs = classRef.getPropertyRefs();
    expect(refs).to.have.length(9);
  }

  /**
   * override create class ref from plain class with initialized property
   */
  @test
  async 'override create class ref from plain class with initialized property'() {
    MetadataRegistry.$()
      .add(METATYPE_PROPERTY,
        <IPropertyOptions>{
          target: ObjectWithInitProp02,
          propertyName: 'plainObjArrValue',
          type: 'array',
          $target: PlainObject
        }, false);

    const classRef = ClassRef.get(ObjectWithInitProp02);
    const namespace = classRef.getNamespace();
    expect(namespace).to.be.eq(DEFAULT_NAMESPACE);
    const refs = classRef.getPropertyRefs();
    expect(refs).to.have.length(9);

    // remove
    MetadataRegistry.$().remove(METATYPE_PROPERTY,
      x =>
        x.propertyName === 'plainObjArrValue' &&
        x.target === ObjectWithInitProp02
    );
  }


  @test
  async 'dynamically attach property on already created class ref'() {
    const classRef = ClassRef.get(DynamicObject);
    const namespace = classRef.getNamespace();
    expect(namespace).to.be.eq(DEFAULT_NAMESPACE);
    let refs = classRef.getPropertyRefs();
    expect(refs).to.have.length(0);

    const waitForEventAdd = new Promise((resolve, reject) => {
      MetadataRegistry.$().once(C_EVENT_ADD, resolve);
    });

    MetadataRegistry.$().add(METATYPE_PROPERTY, <IPropertyOptions>{
      target: DynamicObject,
      propertyName: 'strValue',
      type: 'string'

    });

    await waitForEventAdd;

    refs = classRef.getPropertyRefs();
    expect(refs).to.have.length(1);

    const prop = classRef.getPropertyRef('strValue');
    expect(prop).to.not.null;
    expect(prop.getClassRef()).to.be.eq(classRef);
    expect(prop.getType()).to.be.eq('string');

    // remove
    MetadataRegistry.$().remove(METATYPE_PROPERTY,
      x =>
        x.propertyName === 'strValue' &&
        x.target === DynamicObject
    );
  }


  /**
   * ClassRef for class which inherits another class
   *
   * class X {
   *   prop = 'abc'
   * }
   *
   * class Y extends X {
   *   prop2 = 'abc'
   * }
   *
   * Two class refs for X and Y where properties from X a listed in Y by "getProperties"
   */
  @test
  async 'class ref for class inherits another'() {
    const classRef = ClassRef.get(ExtendedObject);
    const namespace = classRef.getNamespace();
    expect(namespace).to.be.eq(DEFAULT_NAMESPACE);
    const refs = classRef.getExtends();
    expect(refs).to.have.length(1);
  }

  @test
  async 'class ref for class inherits another and they properties'() {
    const classRef = ClassRef.get(ExtendedObject);
    const namespace = classRef.getNamespace();
    expect(namespace).to.be.eq(DEFAULT_NAMESPACE);
    const refs = classRef.getExtends();
    expect(refs).to.have.length(1);
  }


  /**
   * Create class ref dynamically for imported and named class.
   */
  @test
  async 'create class ref anonymous'() {
    const classRef = ClassRef.get('PlainObjectAnonymous');
    const classRef2 = ClassRef.get('PlainObjectAnonymous');
    expect(classRef).to.be.eq(classRef2);
  }



  @test
  async 'property declared over annotation'() {
    const classRef = ClassRef.get(AnnotatedProperties);
    const namespace = classRef.getNamespace();
    expect(namespace).to.be.eq(DEFAULT_NAMESPACE);
    let refs = classRef.getPropertyRefs();
    expect(refs).to.have.length(3);

    let prop = classRef.getPropertyRef('strValue');
    expect(prop).to.not.null;
    expect(prop.getClassRef()).to.be.eq(classRef);
    expect(prop.getType()).to.be.eq('string');

    prop = classRef.getPropertyRef('strValueOverride');
    expect(prop).to.not.null;
    expect(prop.getClassRef()).to.be.eq(classRef);
    expect(prop.getType()).to.be.eq('string');

    prop = classRef.getPropertyRef('strValueAsNumber');
    expect(prop).to.not.null;
    expect(prop.getClassRef()).to.be.eq(classRef);
    expect(prop.getType()).to.be.eq('number');
  }


  @test
  async 'property declared over annotation with refs'() {
    const classRef = ClassRef.get(AnnotatedObjectWithRefs);
    const namespace = classRef.getNamespace();
    expect(namespace).to.be.eq(DEFAULT_NAMESPACE);
    let refs = classRef.getPropertyRefs();
    expect(refs).to.have.length(8);

    let prop = classRef.getPropertyRef('plain');
    expect(prop).to.not.null;
    expect(prop.getClassRef()).to.be.eq(classRef);
    expect(prop.getType()).to.be.eq(PlainObject);
    expect(prop.isCollection()).to.be.false;
    expect(prop.isReference()).to.be.true;

    prop = classRef.getPropertyRef('plainRef');
    expect(prop).to.not.null;
    expect(prop.getClassRef()).to.be.eq(classRef);
    expect(prop.getType()).to.be.eq(PlainObject);
    expect(prop.isCollection()).to.be.false;
    expect(prop.isReference()).to.be.true;

    prop = classRef.getPropertyRef('plainRefByFunc');
    expect(prop).to.not.null;
    expect(prop.getClassRef()).to.be.eq(classRef);
    expect(prop.getType()).to.be.eq(PlainObject);
    expect(prop.isCollection()).to.be.false;
    expect(prop.isReference()).to.be.true;

    prop = classRef.getPropertyRef('plainRefByType');
    expect(prop).to.not.null;
    expect(prop.getClassRef()).to.be.eq(classRef);
    expect(prop.getType()).to.be.eq(PlainObject);
    expect(prop.isCollection()).to.be.false;
    expect(prop.isReference()).to.be.true;

    prop = classRef.getPropertyRef('plainRefByTypeFunc');
    expect(prop).to.not.null;
    expect(prop.getClassRef()).to.be.eq(classRef);
    expect(prop.getType()).to.be.eq(PlainObject);
    expect(prop.isCollection()).to.be.false;
    expect(prop.isReference()).to.be.true;


    prop = classRef.getPropertyRef('arrPlain');
    expect(prop).to.not.null;
    expect(prop.getClassRef()).to.be.eq(classRef);
    expect(prop.getType()).to.be.eq('object');
    expect(prop.isCollection()).to.be.true;
    expect(prop.isReference()).to.be.false;


    prop = classRef.getPropertyRef('arrPlainRefByType');
    expect(prop).to.not.null;
    expect(prop.getClassRef()).to.be.eq(classRef);
    expect(prop.getType()).to.be.eq(PlainObject);
    expect(prop.isCollection()).to.be.true;
    expect(prop.isReference()).to.be.true;

    prop = classRef.getPropertyRef('arrPlainRefByTypeFunc');
    expect(prop).to.not.null;
    expect(prop.getClassRef()).to.be.eq(classRef);
    expect(prop.getType()).to.be.eq(PlainObject);
    expect(prop.isCollection()).to.be.true;
    expect(prop.isReference()).to.be.true;

  }


  @test
  async 'autodetect primative properties over annotation'() {
    const classRef = ClassRef.get(AnnotatedPrimatives);
    const namespace = classRef.getNamespace();
    expect(namespace).to.be.eq(DEFAULT_NAMESPACE);
    let refs = classRef.getPropertyRefs();
    expect(refs).to.have.length(5);

    let prop = classRef.getPropertyRef('strValue');
    expect(prop).to.not.null;
    expect(prop.getClassRef()).to.be.eq(classRef);
    expect(prop.getType()).to.be.eq('string');
    expect(prop.isReference()).to.be.false;

    prop = classRef.getPropertyRef('numberValue');
    expect(prop).to.not.null;
    expect(prop.getClassRef()).to.be.eq(classRef);
    expect(prop.getType()).to.be.eq('number');
    expect(prop.isReference()).to.be.false;

    prop = classRef.getPropertyRef('dateValue');
    expect(prop).to.not.null;
    expect(prop.getClassRef()).to.be.eq(classRef);
    expect(prop.getType()).to.be.eq('date');
    expect(prop.isReference()).to.be.false;

    prop = classRef.getPropertyRef('boolValue');
    expect(prop).to.not.null;
    expect(prop.getClassRef()).to.be.eq(classRef);
    expect(prop.getType()).to.be.eq('boolean');
    expect(prop.isReference()).to.be.false;

    prop = classRef.getPropertyRef('nullValue');
    expect(prop).to.not.null;
    expect(prop.getClassRef()).to.be.eq(classRef);
    expect(prop.getType()).to.be.eq('string');
    expect(prop.isReference()).to.be.false;
  }

}

