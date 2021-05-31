import 'reflect-metadata';
import {suite, test} from '@testdeck/mocha';
import {expect} from 'chai';
import {JsonSchema} from '../../src/lib/json-schema/JsonSchema';
import '../../src/decorators/validate';
import {SchemaUtils} from '../../src/lib/SchemaUtils';
import {ClassRef, IEntityOptions, IEntityRef, METATYPE_ENTITY, RegistryFactory} from '../../src';


@suite('functional/json-schema-draft-07 - anonymous')
class JsonSchemaDraft07SerializationSpec {


  @test
  async 'anonymous class'() {
    const anon = SchemaUtils.clazzAnonymous();
    const serialized = JsonSchema.serialize(anon);
    expect(serialized).to.deep.eq({
      '$ref': '#/definitions/anonymous',
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'definitions': {
        'anonymous': {
          'properties': {},
          'title': 'anonymous',
          'type': 'object'
        }
      }
    });
  }

  @test
  async 'anonymous entity ref'() {
    const anon = SchemaUtils.clazzAnonymous();
    const entityRef = RegistryFactory.get('anon').create(METATYPE_ENTITY, <IEntityOptions>{
      target: anon,
      metaType: METATYPE_ENTITY,
      name: 'hallo'
    }) as IEntityRef;
    const serialized = JsonSchema.serialize(entityRef);
    expect(serialized).to.deep.eq({
      '$ref': '#/definitions/hallo',
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'definitions': {
        'hallo': {
          '$id': '#hallo',
          'properties': {},
          'title': 'hallo',
          'type': 'object'
        }
      }
    });
  }


  @test
  async 'anonymous class ref'() {
    const anon = SchemaUtils.clazzAnonymous();
    const entityRef = ClassRef.get(anon);
    const serialized = JsonSchema.serialize(entityRef);
    expect(serialized).to.deep.eq({
      '$ref': '#/definitions/anonymous',
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'definitions': {
        'anonymous': {
          'properties': {},
          'title': 'anonymous',
          'type': 'object'
        }
      }
    });
  }

  @test
  async 'named class'() {
    const anon = SchemaUtils.clazz('Test');
    const serialized = JsonSchema.serialize(anon);
    expect(serialized).to.deep.eq({
      '$ref': '#/definitions/Test',
      '$schema': 'http://json-schema.org/draft-07/schema#',
      'definitions': {
        'Test': {
          'properties': {},
          'title': 'Test',
          'type': 'object'
        }
      }
    });
  }

}
