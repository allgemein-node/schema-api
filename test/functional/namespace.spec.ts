import 'reflect-metadata';
import {expect} from 'chai';
import {suite, test} from '@testdeck/mocha';
import {Entity} from '../../src/decorators/Entity';
import {Property} from '../../src/decorators/Property';
import {RegistryFactory} from '../../src/lib/registry/RegistryFactory';
import {Namespace} from '../../src';


@Entity()
export class EntityWithDefault {

  @Property()
  value: string;

}

@Entity({namespace: 'testspace'})
export class EntityWithPassedNamespace {

  @Property()
  value: string;

}

@Namespace('myspace')
@Entity()
export class EntityWithAnnotatedNamespace {

  @Property()
  value: string;

}

@suite('functional/namespace')
class NamespaceSpec {

  static before() {
    RegistryFactory.reset();
  }

  @test
  async 'check if namespace informations are present'() {
    const targets = RegistryFactory.getTargets();
    expect(targets.map(x => x.name)).to.contain.members(['EntityWithDefault', 'EntityWithPassedNamespace', 'EntityWithAnnotatedNamespace']);

    const namespaces = RegistryFactory.getDeclaredNamespaces();
    expect(namespaces.map(x => x.namespace)).to.contain.members(['default', 'testspace', 'myspace']);
  }

  @test
  async 'add entity to namespace registry if no namespace declared'() {
    const ref = RegistryFactory.get('myspace').getEntityRefFor(EntityWithDefault);
    expect(ref.getNamespace()).to.be.eq('myspace');
  }

  @test
  async 'fails add entity to another namespace registry if namespace is declared'() {
    expect(() => {
      const ref = RegistryFactory.get('myspace').getEntityRefFor(EntityWithPassedNamespace);
    }).to.throws('namespace for entity is testspace the namespace of this registry is myspace');

    expect(() => {
      const ref = RegistryFactory.get('testspace').getEntityRefFor(EntityWithAnnotatedNamespace);
    }).to.throws('namespace for entity is myspace the namespace of this registry is testspace');
  }

  @test
  async 'add entity to destinated declared namespace registry'() {
    let ref = RegistryFactory.get('testspace').getEntityRefFor(EntityWithPassedNamespace);
    expect(ref.getNamespace()).to.be.eq('testspace');

     ref = RegistryFactory.get('myspace').getEntityRefFor(EntityWithAnnotatedNamespace);
    expect(ref.getNamespace()).to.be.eq('myspace');
  }

}

