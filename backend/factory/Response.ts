import { ResponseParameters } from "./type";

export class Response<T = unknown> {
  code?: number;
  success: boolean = true;
  message: string = 'success';
  data?: T = undefined;

  constructor({
    code,
    success,
    message,
    data
  }: ResponseParameters<T>) {
    this.code = code;
    this.success = success ?? true;
    this.message = message ?? 'success';
    this.data = data;
  }
}

export class ResponseError {
  code: number;
  message: string;

  constructor(code: number, message: string) {
    this.code = code;
    this.message = message;
  }
}
