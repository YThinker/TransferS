import { ResponseError } from "./Response";

export abstract class BaseExceptionFilter {
  abstract catch (e: unknown, listenerName: string): Promise<ResponseError> | ResponseError
}
