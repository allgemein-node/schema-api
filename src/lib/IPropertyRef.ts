import {IClassRef} from "./IClassRef";
import {IEntityRef} from "./IEntityRef";
import {IPropertyRefMetadata} from "./metadata/IPropertyRefMetadata";
import {IBaseRef} from "./IBaseRef";
import {IBuildOptions} from "./IBuildOptions";

export interface IPropertyRef extends IBaseRef {

  label(): string;

  isIdentifier(): boolean;

  isReference(): boolean;

  isEntityReference(): boolean;

  getEntityRef(): IEntityRef;

  getType(): string;

  getSourceRef(): IClassRef;

  getTargetRef(): IClassRef;

  isCollection(): boolean;

  convert(i: any, options?: IBuildOptions): any;

  toJson(follow?: boolean): IPropertyRefMetadata;

  get(instance: any): any;
}
