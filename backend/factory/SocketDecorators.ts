import { Socket, Namespace, Server, ServerOptions } from "socket.io";

/** 注入Metadata的name */
export enum DecoratorMetadataName {
  ChildModules = '[[childmodules]]',
  ServerOptions = '[[serveroptions]]',
  NamespaceModule = '[[wsopt]]',
  EventListener = '[[listener]]',
  ServerProperty = '[[serverprop]]',
  NamespaceProperty = '[[namespaceprop]]',
  SocketProperty = '[[socketprop]]'
}

export interface ChildModuleClass {
  socket?: Socket,
  namespace?: Namespace,
  server?: Server,
  [key: string | number | symbol]: any
}
/** 定义server模块，该模块为主模块 */
export function ServerModule(childModules?: ChildModuleClass[], serverOpt?: Partial<ServerOptions>): ClassDecorator {
  return function (target: Function) {
    Reflect.defineMetadata(DecoratorMetadataName.ChildModules, childModules, target);
    Reflect.defineMetadata(DecoratorMetadataName.ServerOptions, serverOpt, target);
  }
}

/** 定义namespace模块 */
export interface NamespaceOptions {
  namespace?: string;
}
export function NamespaceModule(namespaceOpt?: NamespaceOptions): ClassDecorator {
  return function (target: Function) {
    Reflect.defineMetadata(DecoratorMetadataName.NamespaceModule, namespaceOpt,target);
  }
}

/** 订阅消息装饰器 */
export type ListenersMetadata = Array<{
  name: string,
  listener: (...args: any[]) => void
}>
export function Subscribe(eventName?: string): MethodDecorator {
  return function (target: any, _, descriptor) {
    const listeners = Reflect.getMetadata(DecoratorMetadataName.EventListener, target) ?? [];
    Reflect.defineMetadata(
      DecoratorMetadataName.EventListener,
      listeners.concat([{
        name: eventName,
        listener: descriptor.value,
      }]),
      target
    );
  }
}

export function WebsocketServer(target: object, propertyKey: string | symbol) {
  Reflect.defineMetadata(DecoratorMetadataName.ServerProperty, true, target, propertyKey)
}

export function WebsocketNamespace(target: object, propertyKey: string | symbol) {
  Reflect.defineMetadata(DecoratorMetadataName.NamespaceProperty, true, target, propertyKey)
}

export function SocketInstance(target: object, propertyKey: string | symbol) {
  Reflect.defineMetadata(DecoratorMetadataName.SocketProperty, true, target, propertyKey)
}
