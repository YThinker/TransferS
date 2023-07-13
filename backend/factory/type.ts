import { Namespace, Server, Socket } from "socket.io";

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

export interface ModuleDecoratorParamters {
  modules?: Array<ClassConstructor>;
  providers?: Array<ClassConstructor>;
  gateways?: Array<GatewayConstructor>;
  imports?: Array<ClassConstructor>;
}

export interface InjectInfo {
  identify: unknown;
  propertyKey: string | symbol;
}
