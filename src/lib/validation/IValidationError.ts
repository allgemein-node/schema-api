export interface IValidationError {
  metaType?: 'entity' | 'property';
  property?: string;
  value?: string;
  constraints?: { [k: string]: string };
  type?: 'error' | 'validate';
  handle?: string;
}
