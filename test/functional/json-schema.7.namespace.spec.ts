import 'reflect-metadata';
import {suite, test} from '@testdeck/mocha';
import {expect} from 'chai';
import {JsonSchema} from '../../src/lib/json-schema/JsonSchema';
import '../../src/decorators/validate';
import {EntityWithNamespaceFirst} from "./data/classes/EntityWithNamespaceFirst";
import {RegistryFactory} from "../../src/lib/registry/RegistryFactory";
import {ILookupRegistry} from "../../src/api/ILookupRegistry";

let registry: ILookupRegistry;

@suite('functional/json-schema-draft-07 - namespaces')
class JsonSchemaDraft07NamespaceSpec {

  static async before() {
    registry = RegistryFactory.get('first');
    const registry2 = RegistryFactory.get('embedded');
    const ready = await Promise.all([registry.ready(), registry2.ready()]);
  }

  @test
  async 'multi namespace serialize'() {
    const ref = registry.getEntityRefFor(EntityWithNamespaceFirst);
    const schema = JsonSchema.serialize(ref, {appendNamespace: true});
    expect(schema).to.deep.eq({
      '$schema': 'http://json-schema.org/draft-07/schema#',
      definitions: {
        EntityWithNamespaceFirst: {
          title: 'EntityWithNamespaceFirst',
          type: 'object',
          '$id': '#EntityWithNamespaceFirst',
          '$namespace': 'first',
          properties: {
            "ref": {
              "$ref": "#/definitions/EntityWithNamespaceEmbedded"
            },
            "value": {
              "type": "string"
            }
          }
        },
        EntityWithNamespaceEmbedded: {
          "$id": "#EntityWithNamespaceEmbedded",
          title: 'EntityWithNamespaceEmbedded',
          type: 'object',
          '$namespace': 'embedded',
          properties: {
            "value": {
              "type": "string"
            }
          }
        }
      },
      '$ref': '#/definitions/EntityWithNamespaceFirst'
    })
  }

  @test
  async 'multi namespace deserialize'() {
    const schema = {
      '$schema': 'http://json-schema.org/draft-07/schema#',
      definitions: {
        EntityWithNamespaceThird: {
          title: 'EntityWithNamespaceThird',
          type: 'object',
          '$id': '#EntityWithNamespaceThird',
          '$namespace': 'first',
          properties: {
            "ref": {
              "$ref": "#/definitions/EntityWithNamespaceEmbedded"
            },
            "value": {
              "type": "string"
            }
          }
        },
        EntityWithNamespaceEmbedded: {
          "$id": "#EntityWithNamespaceEmbedded",
          title: 'EntityWithNamespaceEmbedded',
          type: 'object',
          '$namespace': 'embedded',
          properties: {
            "value": {
              "type": "string"
            }
          }
        }
      },
      '$ref': '#/definitions/EntityWithNamespaceThird'
    };

    const refs = await JsonSchema.unserialize(schema);
    const schemaOut = JsonSchema.serialize(refs, {appendNamespace: true});
    expect(schemaOut).to.deep.eq(schema);

  }

}
