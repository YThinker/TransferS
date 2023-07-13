import { ServerOptions } from "socket.io";
import { DecoratorMetadataName } from "./DecoratorMetadataName";
import { ProviderContainer } from "./ProviderContainer";
import { ModuleDecoratorParamters, NamespaceOptions, ClassConstructor, InjectInfo } from "./type";

/** 定义server模块，该模块为主模块 */
export function ServerModule(
  serverOpt?: Partial<ServerOptions>,
): ClassDecorator {
  return function (target: Function) {
    Reflect.defineMetadata(DecoratorMetadataName.ServerModuleIdentify, true, target);
    Reflect.defineMetadata(DecoratorMetadataName.ServerOptions, serverOpt, target);
  }
}

/** 定义为模块 */
export function Module({
  modules,
  providers,
  gateways,
  imports,
}: ModuleDecoratorParamters): ClassDecorator {
  return function (target: Function) {
    Reflect.defineMetadata(DecoratorMetadataName.Container, new ProviderContainer(), target);
    Reflect.defineMetadata(DecoratorMetadataName.Modules, modules, target);
    Reflect.defineMetadata(DecoratorMetadataName.Providers, providers, target);
    Reflect.defineMetadata(DecoratorMetadataName.Gateways, gateways, target);
    Reflect.defineMetadata(DecoratorMetadataName.Imports, imports, target);
  }
}

/** 定义gateway模块 */
export function Gateway(namespaceOpt?: NamespaceOptions): ClassDecorator {
  return function (target: Function) {
    Reflect.defineMetadata(DecoratorMetadataName.GatewayIdentify, true, target);
    Reflect.defineMetadata(DecoratorMetadataName.NamespaceOptions, namespaceOpt, target);
  }
}

/** 订阅消息装饰器 */
export type ListenersMetadata = Array<{
  name: string,
  listener: (...args: unknown[]) => void
}>
export function Subscribe(eventName?: string): MethodDecorator {
  return function (target: object, _, descriptor) {
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
  const keyMap = Reflect.getMetadata(DecoratorMetadataName.ServerProperty, target) || [];
  Reflect.defineMetadata(DecoratorMetadataName.ServerProperty, keyMap.concat(propertyKey), target);
}

export function WebsocketNamespace(target: object, propertyKey: string | symbol) {
  const keyMap = Reflect.getMetadata(DecoratorMetadataName.NamespaceProperty, target) || [];
  Reflect.defineMetadata(DecoratorMetadataName.NamespaceProperty, keyMap.concat(propertyKey), target);
}

export function SocketInstance(target: object, propertyKey: string | symbol) {
  const keyMap = Reflect.getMetadata(DecoratorMetadataName.SocketProperty, target) || [];
  Reflect.defineMetadata(DecoratorMetadataName.SocketProperty, keyMap.concat(propertyKey), target);
}

export function Injectable (identify?: unknown) {
  return function (target: ClassConstructor) {
    Reflect.defineMetadata(DecoratorMetadataName.InjectableIdentify, identify ?? target, target);
  }
}

export function Inject (identify: unknown) {
  return function (target: object, propertyKey: string) {
    const infos: InjectInfo[] = Reflect.getMetadata(DecoratorMetadataName.InjectInfos, target) ?? [];
    infos.push({
      identify,
      propertyKey
    });
    Reflect.defineMetadata(DecoratorMetadataName.InjectInfos, infos, target);
  }
}
