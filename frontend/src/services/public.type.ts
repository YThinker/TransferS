export enum REQUEST_METHOD {
  GET = 'get',
  POST = 'post',
  DELETE = 'delete',
  PUT = 'put'
}

export interface RequestOptions {
  key: string;
  method: REQUEST_METHOD;
  timeout?: number;
}

export interface StandardData<T = never> {
  success: boolean;
  message: string;
  data: T;
}
