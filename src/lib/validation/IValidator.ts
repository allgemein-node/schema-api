export interface IValidator {

  name: string;

  fn: (value: any) => boolean;

  options?: {

    message?: string

  };

  involveOnOptionKey?: string

}
