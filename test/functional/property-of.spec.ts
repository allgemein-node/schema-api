import 'reflect-metadata';
import {expect} from 'chai';
import {suite, test} from '@testdeck/mocha';
import {Entity} from '../../src/decorators/Entity';
import {Property} from '../../src/decorators/Property';
import {RegistryFactory} from '../../src/lib/registry/RegistryFactory';
import {PropertyOf} from '../../src';


@Entity()
export class ObjectToExtend {

  @Property()
  value: string;

}


@PropertyOf('append', ObjectToExtend)
export class AppendedProperty {

  @Property()
  key: string;

  @Property()
  nr: number;

}


@suite('functional/property-of')
class PropertyOfSpec {

  static before() {
    RegistryFactory.reset();
  }

  @test
  async 'check if property of is appended'() {
    const entity = RegistryFactory.get().getEntityRefFor(ObjectToExtend);
    const properties = entity.getPropertyRefs();
    expect(properties).to.have.length(2);
    expect(properties.map(x => x.name)).to.be.deep.eq(['value', 'append']);

    const prop = properties.find(x => x.name === 'append');
    expect(prop.getType()).to.be.eq(AppendedProperty);

    const x = {
      value: 'test',
      append: {
        key: 'nr',
        nr: 123
      }
    };
    const builtEntity = entity.build(x);
    expect(builtEntity).to.be.deep.eq({
      '__CLASS__': 'ObjectToExtend',
      '__NS__': 'default',
      'append': {
        '__CLASS__': 'AppendedProperty',
        '__NS__': 'default',
        'key': 'nr',
        'nr': 123
      },
      'value': 'test'
    });
  }


  @test.skip
  async 'to json schema'() {

  }


  @test.skip
  async 'from json schema'() {

  }
}
