import { ResponseError } from "./Response";

export abstract class BaseExceptionFilter {
  abstract catch (e: unknown): Promise<ResponseError> | ResponseError
}
