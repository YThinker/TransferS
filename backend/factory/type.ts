import { Namespace, Server, ServerOptions, Socket } from "socket.io";
import { BaseGuard } from "./BaseGuard";
import { BaseExceptionFilter } from "./BaseExceptionFilter";

export interface NamespaceOptions {
  namespace?: string;
}

export type ClassConstructor = (new (...args: unknown[]) => object)

export interface GatewayInstance {
  socket?: Socket;
  namespace?: Namespace;
  server?: Server;
  [key: string | number | symbol]: any;
}

export type GatewayConstructor = (new (...args: unknown[]) => GatewayInstance);

export type Listener = (socket: Socket, ...args: unknown[]) => Promise<unknown> | unknown;
export type ListenersMetadata = Array<{
  name: string,
  propertyKey: string | symbol,
  listener: Listener,
}>

export interface ServerModuleDecoratorParamters {
  modules?: Array<ClassConstructor>,
  serverOptions?: Partial<ServerOptions>,
}

export interface ModuleDecoratorParamters {
  providers?: Array<ClassConstructor>;
  gateways?: Array<GatewayConstructor>;
  imports?: Array<ClassConstructor>;
}

export interface InjectInfo<T = unknown> {
  identify: unknown;
  propertyKey: string | symbol;
  cb?: (injectedValue: T) => void;
}

export type IdentifyInfo = {
  identify: unknown;
  factory?: () => void;
}

export interface ResponseParameters<T> {
  code?: number;
  success?: boolean;
  message?: string;
  data?: T;
}

export type FindMatchedContainersParameters = Record<'modules' | 'extendModules' | 'serverModules' | 'globalExtendModules', ClassConstructor[]>

export type GuardsMapChild = { guard: BaseGuard, extra: unknown[] }
export type GuardsMap = Map<string | symbol, Array<GuardsMapChild>>;

export type FiltersMap = Map<string | symbol, BaseExceptionFilter[]>;
