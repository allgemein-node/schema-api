export interface IJsonSchemaUnserializer {

  uri(): string;

  unserialize(data: string): any;

}
