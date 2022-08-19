import * as _ from 'lodash';
import 'reflect-metadata';
import {suite, test} from '@testdeck/mocha';
import {expect} from 'chai';
import {JsonSchema} from '../../src/lib/json-schema/JsonSchema';
import {IClassRef, isClassRef} from '../../src/api/IClassRef';
import {DEFAULT_NAMESPACE, METATYPE_PROPERTY} from '../../src/lib/Constants';
import {IEntityRef, isEntityRef} from '../../src/api/IEntityRef';
import {IJsonSchema7} from '../../src/lib/json-schema/JsonSchema7';
import '../../src/decorators/validate';
import {FileUtils} from "@allgemein/base";
import {keys} from "lodash";
import {ClassRef, IParseOptions} from "../../src";

@suite('functional/json-schema-draft-07 - property order')
class JsonSchemaDraft07SerializationSpec {


  @test
  async 'parse json schema with check correct property order'() {
    const json = await FileUtils.getJson(__dirname + '/data/json/slm_abstgv_sc_cg_map_v2.schema.json');

    const classRefs = await JsonSchema.unserialize(json, {
      cwd: __dirname + '/data/json',
      return: "class-refs",
    }) as IClassRef[];

    expect(classRefs).to.have.length(1);

    expect(classRefs.map(x => x.name)).to.deep.eq(['SlmAbstgvScCgMapV2']);
    expect(classRefs.find(x => x.name === 'SlmAbstgvScCgMapV2').getPropertyRefs().map(x => x.name)).to.deep.eq([
      "id",
      "abschl",
      "stg",
      "vert",
      "pversion",
      "fach",
      "tu",
      "sc",
      "cg",
      "his_sap",
      "sap_his"
    ]);
  }


  @test
  async 'parse json schema with check correct property order - for namespace'() {
    const json = await FileUtils.getJson(__dirname + '/data/json/slm_abstgv_sc_cg_map_v2.schema.json');
    const arrDef: string[] = ['type', 'metaType', 'propertyName', 'properties'];
    const classRefs = await JsonSchema.unserialize(json, {
      namespace: 'prop-order',
      collector: [
        {
          type: METATYPE_PROPERTY,
          fn: (key: string, data: any, options: IParseOptions) => {
            // passing all properties
            const r = {};
            keys(data)
              .filter(k => !(arrDef.indexOf(k) >= 0 || k.startsWith('$')))
              .map(x => r[x] = data[x]);
            return r;
          }
        }
      ]
    }) as any[];


    expect(classRefs).to.have.length(1);

    expect(classRefs.map(x => x.name)).to.deep.eq(['slm_abstgv_sc_cg_map_v2']);
    expect(classRefs.find(x => x.name === 'slm_abstgv_sc_cg_map_v2').getPropertyRefs().map((x: any) => x.name)).to.deep.eq([
      "id",
      "abschl",
      "stg",
      "vert",
      "pversion",
      "fach",
      "tu",
      "sc",
      "cg",
      "his_sap",
      "sap_his"
    ]);

    const ref = ClassRef.get('SlmAbstgvScCgMapV2');

    expect(ref.getPropertyRefs().map((x: any) => x.name)).to.deep.eq([
      "id",
      "abschl",
      "stg",
      "vert",
      "pversion",
      "fach",
      "tu",
      "sc",
      "cg",
      "his_sap",
      "sap_his"
    ]);
  }


}
