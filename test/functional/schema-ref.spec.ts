import 'reflect-metadata';
import {expect} from 'chai';
import {suite, test} from '@testdeck/mocha';
import {Schema} from '../../src/decorators/Schema';
import {Entity} from '../../src/decorators/Entity';
import {Property} from '../../src/decorators/Property';
import {RegistryFactory} from '../../src/lib/registry/RegistryFactory';


@Schema({name: 'simpleschema'})
@Entity()
export class EntityWithSchema {

  @Property()
  value: string;

  @Property()
  numericValue: number;

  @Property()
  numericValue2: number;

}


@suite('functional/schema-ref')
class SchemaRefSpec {


  @test
  async 'check if schema added'() {
    let entityRef = RegistryFactory.get().getEntityRefFor(EntityWithSchema);
    const schemaNames = entityRef.getOptions('schema');
    console.log(schemaNames);
    expect(schemaNames).to.be.deep.eq(['simpleschema']);
    const schemaRefs = entityRef.getSchemaRefs();
    expect(schemaRefs).to.have.length(1);
    expect(schemaRefs[0].name).to.be.eq('simpleschema');

    const entities = schemaRefs[0].getEntityRefs();
    expect(entities).to.have.length(1);

    entityRef = schemaRefs[0].getEntityRefFor('EntityWithSchema');
    expect(entityRef.name).to.be.eq('EntityWithSchema');

    entityRef = schemaRefs[0].getEntityRefFor(EntityWithSchema);
    expect(entityRef.name).to.be.eq('EntityWithSchema');

    expect(entityRef.getOptions()).to.be.deep.eq({
      'metaType': 'entity',
      'name': 'EntityWithSchema',
      'namespace': 'default',
      'schema': [
        'simpleschema'
      ],
      'target': entityRef.getClass()
    });

  }

}

