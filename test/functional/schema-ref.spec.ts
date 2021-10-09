import 'reflect-metadata';
import {expect} from 'chai';
import {suite, test} from '@testdeck/mocha';

import {RegistryFactory} from '../../src/lib/registry/RegistryFactory';

import {EntityWithSchemaSimple} from './data/classes/EntityWithSchemaSimple';
import {EntityWithNamespaceSchemaSimple} from './data/classes/EntityWithNamespaceSchemaSimple';

const OTHER_NAMESPACE = 'other'

@suite('functional/schema-ref')
class SchemaRefSpec {


  @test
  async 'check if schema added to default namespace (drained)'() {
    // const EntityWithSchemaSimple = (await import('./data/classes/EntityWithSchemaSimple')).EntityWithSchemaSimple;
    let entityRef = RegistryFactory.get().getEntityRefFor(EntityWithSchemaSimple);
    const schemaNames = entityRef.getOptions('schema');
    expect(schemaNames).to.be.deep.eq(['simpleschema']);
    const schemaRefs = entityRef.getSchemaRefs();
    expect(schemaRefs).to.have.length(1);
    expect(schemaRefs[0].name).to.be.eq('simpleschema');

    const entities = schemaRefs[0].getEntityRefs();
    expect(entities).to.have.length(1);

    entityRef = schemaRefs[0].getEntityRefFor('EntityWithSchemaSimple');
    expect(entityRef.name).to.be.eq('EntityWithSchemaSimple');

    entityRef = schemaRefs[0].getEntityRefFor(EntityWithSchemaSimple);
    expect(entityRef.name).to.be.eq('EntityWithSchemaSimple');

    expect(entityRef.getOptions()).to.be.deep.eq({
      'metaType': 'entity',
      'name': 'EntityWithSchemaSimple',
      'namespace': 'default',
      'schema': [
        'simpleschema'
      ],
      'target': entityRef.getClass()
    });


    const schemaRefs2 = RegistryFactory.get().getSchemaRefs();
    const schemaFiltered = schemaRefs2.filter(x => x.name === 'simpleschema');
    expect(schemaFiltered).to.have.length(1);
    const entityRefs = schemaFiltered.shift().getEntityRefs();
    expect(entityRefs).to.have.length(1);

  }


  @test
  async 'check if schema added dynamically to default namespace by trigger'() {
    const reg = RegistryFactory.get();
    const EntityWithSchemaActive = (await import('./data/classes/EntityWithSchemaActive')).EntityWithSchemaActive;
    await reg.ready();
    // await new Promise(resolve => {
    //   setTimeout(() => resolve(null), 20);
    // });

    let schemaRefs = reg.getSchemaRefs();
    const filtered = schemaRefs.filter(x => x.name === 'active');
    expect(filtered).to.have.length(1);
    const entityRefs = filtered.shift().getEntityRefs();
    expect(entityRefs).to.have.length(1);
  }


  @test
  async 'check if schema added dynamically to default namespace by trigger (timeouted)'() {
    const reg = RegistryFactory.get();
    setTimeout(async () => {
      (await import('./data/classes/EntityWithSchemaTimeout'));
    }, 100);
    let schemaRefs = reg.getSchemaRefs();
    let filtered = schemaRefs.filter(x => x.name === 'timeout');
    expect(filtered).to.have.length(0);

    await new Promise(resolve => {
      setTimeout(() => resolve(null), 100);
    });
    await reg.ready();


    schemaRefs = reg.getSchemaRefs();
    filtered = schemaRefs.filter(x => x.name === 'timeout');
    expect(filtered).to.have.length(1);
    const entityRefs = filtered.shift().getEntityRefs();
    expect(entityRefs).to.have.length(1);
  }


  @test
  async 'check if schema added to other namespace (drained)'() {
    // const EntityWithSchemaSimple = (await import('./data/classes/EntityWithSchemaSimple')).EntityWithSchemaSimple;
    let entityRef = RegistryFactory.get(OTHER_NAMESPACE).getEntityRefFor(EntityWithNamespaceSchemaSimple);
    const schemaNames = entityRef.getOptions('schema');
    expect(schemaNames).to.be.deep.eq(['simple']);
    const schemaRefs = entityRef.getSchemaRefs();
    expect(schemaRefs).to.have.length(1);
    expect(schemaRefs[0].name).to.be.eq('simple');

    const entities = schemaRefs[0].getEntityRefs();
    expect(entities).to.have.length(1);

    entityRef = schemaRefs[0].getEntityRefFor('EntityWithNamespaceSchemaSimple');
    expect(entityRef.name).to.be.eq('EntityWithNamespaceSchemaSimple');

    entityRef = schemaRefs[0].getEntityRefFor(EntityWithNamespaceSchemaSimple);
    expect(entityRef.name).to.be.eq('EntityWithNamespaceSchemaSimple');

    expect(entityRef.getOptions()).to.be.deep.eq({
      'metaType': 'entity',
      'name': 'EntityWithNamespaceSchemaSimple',
      'namespace': OTHER_NAMESPACE,
      'schema': [
        'simple'
      ],
      'target': entityRef.getClass()
    });


    const schemaRefs2 = RegistryFactory.get(OTHER_NAMESPACE).getSchemaRefs();
    const schemaFiltered = schemaRefs2.filter(x => x.name === 'simple');
    expect(schemaFiltered).to.have.length(1);
    const entityRefs = schemaFiltered.shift().getEntityRefs();
    expect(entityRefs).to.have.length(1);

  }


  @test
  async 'check if schema added dynamically to other namespace by trigger'() {
    const reg = RegistryFactory.get(OTHER_NAMESPACE);
    const EntityWithSchemaActive = (await import('./data/classes/EntityWithNamespaceSchemaActive')).EntityWithNamespaceSchemaActive;
    await reg.ready();
    let schemaRefs = reg.getSchemaRefs();
    const filtered = schemaRefs.filter(x => x.name === 'active');
    expect(filtered).to.have.length(1);
    const entityRefs = filtered.shift().getEntityRefs();
    expect(entityRefs).to.have.length(1);
  }


  @test
  async 'check if schema added dynamically to other namespace by trigger (timeouted)'() {
    const reg = RegistryFactory.get(OTHER_NAMESPACE);
    setTimeout(async () => {
      (await import('./data/classes/EntityWithNamespaceSchemaTimeout'));
    }, 100);
    let schemaRefs = reg.getSchemaRefs();
    let filtered = schemaRefs.filter(x => x.name === 'timeout');
    expect(filtered).to.have.length(0);

    await new Promise(resolve => {
      setTimeout(() => resolve(null), 100);
    });
    await reg.ready();


    schemaRefs = reg.getSchemaRefs();
    filtered = schemaRefs.filter(x => x.name === 'timeout');
    expect(filtered).to.have.length(1);
    const entityRefs = filtered.shift().getEntityRefs();
    expect(entityRefs).to.have.length(1);
  }


}

