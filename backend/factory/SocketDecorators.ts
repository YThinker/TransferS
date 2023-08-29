import { DecoratorMetadataName } from "./DecoratorMetadataName";
import { BaseExceptionFilter } from "./BaseExceptionFilter";
import { BaseGuard } from "./BaseGuard";
import { ProviderContainer } from "./ProviderContainer";
import { ModuleDecoratorParamters, NamespaceOptions, InjectInfo, ServerModuleDecoratorParamters, ListenersMetadata, GuardsMap, FiltersMap, GuardsMapChild } from "./type";

/** 定义server模块，该模块为主模块 */
export function ServerModule({
  modules,
  serverOptions
}: ServerModuleDecoratorParamters): ClassDecorator {
  return function (target: Function) {
    Reflect.defineMetadata(DecoratorMetadataName.Modules, modules, target);
    Reflect.defineMetadata(DecoratorMetadataName.ServerModuleIdentify, true, target);
    Reflect.defineMetadata(DecoratorMetadataName.ServerOptions, serverOptions, target);
  }
}

/** 定义为模块 */
export function Module(moduleInfos?: ModuleDecoratorParamters): ClassDecorator {
  const {
    providers,
    gateways,
    imports,
  } = moduleInfos ?? {};
  return function (target: Function) {
    Reflect.defineMetadata(DecoratorMetadataName.Container, new ProviderContainer(), target);
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
export function Subscribe(eventName: string): MethodDecorator {
  return function (target: object, propertyKey: string | symbol, descriptor: any) {
    const listeners: ListenersMetadata[] = Reflect.getMetadata(DecoratorMetadataName.EventListener, target) ?? [];
    Reflect.defineMetadata(
      DecoratorMetadataName.EventListener,
      listeners.concat([{
        name: eventName,
        propertyKey,
        listener: descriptor.value,
      }]),
      target
    );
  }
}

/** GET */
export function Get(eventName?: string): MethodDecorator {
  return Subscribe(`get:${eventName}`);
}

/** POST */
export function Post(eventName?: string): MethodDecorator {
  return Subscribe(`post:${eventName}`);
}

/** PUT */
export function Put(eventName?: string): MethodDecorator {
  return Subscribe(`put:${eventName}`);
}

/** DELETE */
export function Delete(eventName?: string): MethodDecorator {
  return Subscribe(`delete:${eventName}`);
}

/** 错误捕获装饰器 */
export function Catch(filter: BaseExceptionFilter): MethodDecorator | ClassDecorator {
  return function (target: object, propertyKey?: string | symbol) {
    const map: FiltersMap = Reflect.getMetadata(DecoratorMetadataName.ExceptionFilter, target);
    if(propertyKey) {
      map.set(propertyKey, filter);
    } else {
      map.set(DecoratorMetadataName.ExceptionFilter, filter);
    }
    Reflect.defineMetadata(
      DecoratorMetadataName.ExceptionFilter,
      map,
      target
    );
  }
}

const mergeGuardConfig = (arr: GuardsMapChild[] | undefined, config: GuardsMapChild) =>
  Array.isArray(arr) ? arr.concat(config) : [config];
/** 守卫装饰器 */
export function Guard(guard: BaseGuard, ...args: unknown[]): MethodDecorator | ClassDecorator {
  return function (target: object, propertyKey?: string | symbol) {
    const map: GuardsMap = Reflect.getMetadata(DecoratorMetadataName.Guard, target);
    const guardConfig = {
      guard,
      extra: args,
    }
    if(propertyKey) {
      const functionGuards = map.get(propertyKey);
      map.set(propertyKey, mergeGuardConfig(functionGuards, guardConfig));
    } else {
      const gatewayGuards = map.get(DecoratorMetadataName.Guard);
      map.set(DecoratorMetadataName.ExceptionFilter, mergeGuardConfig(gatewayGuards, guardConfig));
    }
    Reflect.defineMetadata(
      DecoratorMetadataName.Guard,
      map,
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

export function Injectable (identify?: unknown, factory?: () => unknown): ClassDecorator {
  return function (target) {
    Reflect.defineMetadata(
      DecoratorMetadataName.InjectableIdentify,
      {
        identify: identify ?? target,
        factory,
      },
      target
    );
  }
}

export function Inject<T>(identify: unknown, cb?: (injectedValue: T) => void): PropertyDecorator {
  return function (target, propertyKey) {
    const infos: InjectInfo<T>[] = Reflect.getMetadata(DecoratorMetadataName.InjectInfos, target) ?? [];
    infos.push({
      identify,
      propertyKey,
      cb
    });
    Reflect.defineMetadata(DecoratorMetadataName.InjectInfos, infos, target);
  }
}
