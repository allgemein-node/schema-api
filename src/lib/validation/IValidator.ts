export interface IValidator {

  name: string;

  fn: (value: any, options: any) => boolean;

  defaultOptions?: {
    message?: string
  };

  involveOnOptionKey?: string

}
