import * as _ from 'lodash';
import 'reflect-metadata';
import {suite, test} from '@testdeck/mocha';
import {expect} from 'chai';
import {JsonSchema} from '../../src/lib/json-schema/JsonSchema';
import {IClassRef, isClassRef} from '../../src/api/IClassRef';
import {DEFAULT_NAMESPACE} from '../../src/lib/Constants';
import {IEntityRef, isEntityRef} from '../../src/api/IEntityRef';
import {IJsonSchema7} from '../../src/lib/json-schema/JsonSchema7';
import '../../src/decorators/validate';

@suite('functional/json-schema-draft-07 - cross refs')
class JsonSchemaDraft07SerializationSpec {


  @test
  async 'parse json schema with ref to follow http'() {
    const json: IJsonSchema7 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $ref: 'https://raw.githubusercontent.com/allgemein-node/schema-api/master/test/functional/data/json/person.schema.json'
    };
    const classRef = await JsonSchema.unserialize(json) as IEntityRef;
    expect(isEntityRef(classRef)).to.be.true;
    expect(isClassRef(classRef)).to.be.false;
    expect(classRef.name).to.be.eq('Person');
    expect(classRef.getClassRef().getNamespace()).to.be.eq(DEFAULT_NAMESPACE);
    let properties = classRef.getClassRef().getPropertyRefs();
    expect(properties).to.have.length(4);
    expect(_.first(properties).name).to.be.eq('firstname');
    expect(_.first(properties).getType()).to.be.eq('string');
  }


  @test
  async 'parse json schema with ref to follow files'() {
    const json: IJsonSchema7 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $ref: 'file:///' + __dirname + '/data/json/person.schema.json'
    };
    const classRef = await JsonSchema.unserialize(json, {
      className: 'PersonSecond',
      ignoreDeclared: true
    }) as IEntityRef;
    expect(isEntityRef(classRef)).to.be.true;
    expect(isClassRef(classRef)).to.be.false;
    expect(classRef.name).to.be.eq('PersonSecond');
    expect(classRef.getClassRef().getNamespace()).to.be.eq(DEFAULT_NAMESPACE);
    let properties = classRef.getClassRef().getPropertyRefs();
    expect(properties).to.have.length(4);
    expect(_.first(properties).name).to.be.eq('firstname');
    expect(_.first(properties).getType()).to.be.eq('string');
  }


  @test
  async 'parse json schema with ref to follow relative'() {
    const json: IJsonSchema7 = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $ref: __dirname + '/data/json/process.json'
    };
    const classRefs = await JsonSchema.unserialize(json, {
      cwd: __dirname + '/data/json',
      return: 'class-refs'
    }) as IClassRef[];

    expect(classRefs).to.have.length(2);
    expect(classRefs.map(x => x.name)).to.deep.eq(['Process', 'Lawyer']);
    expect(classRefs.find(x => x.name === 'Process').getPropertyRefs().map(x => x.name)).to.deep.eq(['id', 'label', 'autor']);
    expect(classRefs.find(x => x.name === 'Lawyer').getPropertyRefs().map(x => x.name)).to.deep.eq(['id', 'firstName', 'lastName']);
    const lawyer = classRefs.find(x => x.name === 'Process').getPropertyRefs().find(x => x.name === 'autor');
    expect(lawyer.getTargetRef()).to.be.eq(classRefs.find(x => x.name === 'Lawyer'));
  }


}
