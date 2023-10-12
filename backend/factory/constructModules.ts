import "reflect-metadata";
import { Namespace, Server, ServerOptions, Socket } from "socket.io";
import { FiltersMap, GuardsMap, ListenersMetadata } from "./type";
import { TemplatedApp } from "uWebSockets.js";
import { DecoratorMetadataName } from "./DecoratorMetadataName";
import { ProviderContainer } from "./ProviderContainer";
import { ClassConstructor, GatewayConstructor, GatewayInstance, IdentifyInfo, InjectInfo, NamespaceOptions } from "./type";
import { bindBelongModules, findLinkedModules, findMatchedContainer, findMatchedContainers, useExceptionFilters, useGuards } from "./utils";
import { Response, ResponseError } from "./Response";
import { BaseGuard } from "./BaseGuard";

function createGlobalServer (app: TemplatedApp, serverOpt?: Partial<ServerOptions>) {
  const io = new Server(serverOpt);
  io.attachApp(app);
  return io;
}

function bindInjectProperty (
  identify: InjectInfo['identify'],
  target: object,
  propertyKey: InjectInfo['propertyKey'],
  cb?: InjectInfo['cb']
) {
  const belongModules: ClassConstructor[] | undefined = Reflect.getMetadata(DecoratorMetadataName.BelongModules, target);
  if (!belongModules || !belongModules.length) {
    throw new Error(`${target.constructor} unbind with module`);
  }

  const linkedModules = findLinkedModules(belongModules);
  const matchedContainers = findMatchedContainers(linkedModules);
  const matchedContainer = findMatchedContainer(matchedContainers, identify);

  if (!matchedContainer) {
    throw new Error(`${identify} has not been injected`);
  }
  const injectedValue = matchedContainer.get(identify);
  Reflect.set(target, propertyKey, injectedValue);
  if(cb) {
    cb(injectedValue);
  }
}

/**
 * mount listener
 * bind error filters
 * bind guards
 * bind pipes
 * bind interceptors
 */
function bindDecoratorListeners (target: GatewayInstance, socket: Socket) {
  const listeners: ListenersMetadata | undefined = Reflect.getMetadata(DecoratorMetadataName.EventListener, target);
  if(!listeners?.length) {
    return;
  }

  const filterMap: FiltersMap = Reflect.getMetadata(DecoratorMetadataName.Catch, target);
  const guardMap: GuardsMap = Reflect.getMetadata(DecoratorMetadataName.Guard, target);

  const belongModules: ClassConstructor[] | undefined = Reflect.getMetadata(DecoratorMetadataName.BelongModules, target);
  if (!belongModules || !belongModules.length) {
    throw new Error(`${target.constructor} unbind with module`);
  }

  const linkedModules = findLinkedModules(belongModules);
  /** 守卫、过滤、拦截、管道 不支持类mixin行为 只支持显式声明，因此过滤掉importsModule */
  const useSimplifiedModules = belongModules.concat(linkedModules.serverModules);
  const matchedContainers = findMatchedContainers(linkedModules);

  const gatewayExceptionFilters = filterMap?.get(DecoratorMetadataName.Catch);
  const gatewayGuardsMapChildren = guardMap?.get(DecoratorMetadataName.Guard);

  listeners.forEach(listener => {
    const exceptionFilters = filterMap?.get(listener.propertyKey);
    const guardsMapChildren = guardMap?.get(listener.propertyKey);
    const totalGuardsMapChildren = (guardsMapChildren ?? []).concat(gatewayGuardsMapChildren ?? []);
    const totalExceptionFilters = (exceptionFilters ?? []).concat(gatewayExceptionFilters ?? []);

    socket.on(listener.name, async (...args: unknown[]) => {
      try {
        const successName = `${listener.name}:success`;

        await useGuards(
          totalGuardsMapChildren,
          matchedContainers,
          useSimplifiedModules,
          socket,
          listener.name,
          args
        );

        const result: unknown = await listener.listener.call(target, socket, ...args);
        if (result instanceof Response) {
          socket.emit(successName, result);
          return;
        }
        socket.emit(successName, new Response({ data: result }));
      } catch (e) {
        const failName = `${listener.name}:fail`;
        const errorResponse = await useExceptionFilters(e, totalExceptionFilters, useSimplifiedModules, listener.name);
        if (errorResponse instanceof ResponseError) {
          socket.emit(failName, e);
          return;
        }
        if (e instanceof Object && 'message' in e && typeof e.message === 'string') {
          socket.emit(failName, new ResponseError(1, e.message));
          return;
        }
        socket.emit(failName, new ResponseError(0, 'Internal server error'));
      }
    })
  });
}

/** bind namespace and server */
function bindDecoratorValuesBeforeConnect (
  self: GatewayInstance,
  nsp: Namespace,
  ioInstance: Server
) {
  const nspPropertyKeys: string[] | undefined = Reflect.getMetadata(DecoratorMetadataName.NamespaceProperty, self);
  const serverPropertyKeys: string[] | undefined = Reflect.getMetadata(DecoratorMetadataName.ServerProperty, self);
  nspPropertyKeys?.forEach(key => {
    Reflect.set(self, key, nsp);
  });
  serverPropertyKeys?.forEach(key => {
    Reflect.set(self, key, ioInstance);
  });
}

const batchProviders: Array<{
  providers: ClassConstructor[],
  container: ProviderContainer,
  ChildModule: ClassConstructor
}> = [];
const batchGateways: Array<{
  gateways: GatewayConstructor[],
  ChildModule: ClassConstructor
}> = [];
const batchInjectInfos: Array<{
  instance: object
} & InjectInfo> = [];

/**
 * construct gateway
 */
function constructGateways (
  gateways: (new () => GatewayInstance)[],
  io: Server,
  belongModule: (new () => object),
) {
  gateways.forEach(Gateway => {
    const isGateway = Reflect.getMetadata(DecoratorMetadataName.GatewayIdentify, Gateway);
    if(!isGateway) {
      throw new Error(`${Gateway} is not gateway class`);
    }
    const instance = new Gateway();

    bindBelongModules(instance, belongModule);

    const injectInfos: InjectInfo[] | undefined = Reflect.getMetadata(DecoratorMetadataName.InjectInfos, instance);
    injectInfos?.forEach(info => bindInjectProperty(info.identify, instance, info.propertyKey, info?.cb));

    const opt: NamespaceOptions = Reflect.getMetadata(DecoratorMetadataName.NamespaceOptions, Gateway);
    const { namespace } = opt ?? {};
    const nsp = io?.of(namespace ?? '/');
    bindDecoratorValuesBeforeConnect(instance, nsp, io);
    nsp.on('connection', (socket) => {
      bindDecoratorListeners(instance, socket);
      instance.onConnection?.(socket);
      socket.on('disconnect', (...args) => {
        if(instance?.onDisconnect) instance.onDisconnect.call(instance, ...args);
      });
      socket.on('disconnecting', (...args) => {
        if(instance?.onDisconnecting) instance.onDisconnecting.call(instance, ...args);
      });
    });
  });
}

/**
 * construct providers
 */
function constructProviders (
  providers: (new () => object)[],
  container: ProviderContainer,
  belongModule: (new () => object),
) {
  providers.forEach(Provider => {
    const identifyInfo: IdentifyInfo = Reflect.getMetadata(DecoratorMetadataName.InjectableIdentify, Provider);
    if(identifyInfo === undefined || identifyInfo === null) {
      throw new Error(`${Provider} is not injectable class`);
    }

    const instance = new Provider();
    const factoryInstance = identifyInfo.factory?.();
    bindBelongModules(instance, belongModule);

    if(container.isBound(identifyInfo.identify)) {
      return;
    }
    container.bindInstance(identifyInfo.identify, factoryInstance ?? instance);

    const injectInfos: InjectInfo[] | undefined = Reflect.getMetadata(DecoratorMetadataName.InjectInfos, instance);
    injectInfos?.forEach(info => batchInjectInfos.push({
      ...info,
      instance
    }));
  });
}

/**
 * construct child module
 * inject provider
 */
function constructChildModules (
  modules: ClassConstructor[],
  serverModule: ClassConstructor | null,
) {
  modules.forEach(ChildModule => {
    const container: ProviderContainer = Reflect.getMetadata(DecoratorMetadataName.Container, ChildModule);
    if(!container) {
      throw new Error(`${ChildModule} is not a module`);
    }
    /** constructe module */
    new ChildModule();

    const isServerModule = Reflect.getMetadata(DecoratorMetadataName.ServerModuleIdentify, ChildModule);
    if(!isServerModule) {
      const serverModules = Reflect.getMetadata(DecoratorMetadataName.BelongServerModules, ChildModule) ?? [];
      serverModules.push(serverModule);
      Reflect.defineMetadata(DecoratorMetadataName.BelongServerModules, serverModules, ChildModule);
    }

    const childModules = Reflect.getMetadata(DecoratorMetadataName.Modules, ChildModule);
    const providers: ClassConstructor[] | undefined = Reflect.getMetadata(DecoratorMetadataName.Providers, ChildModule);
    const gateways: GatewayConstructor[] | undefined = Reflect.getMetadata(DecoratorMetadataName.Gateways, ChildModule);
    if(Array.isArray(providers) && providers.length) {
      batchProviders.push({
        providers,
        container,
        ChildModule
      });
    }
    if(Array.isArray(gateways) && gateways.length) {
      batchGateways.push({
        gateways,
        ChildModule
      });
    }
    if(isServerModule && Array.isArray(childModules) && childModules.length) {
      constructChildModules(childModules, isServerModule ? ChildModule : serverModule);
    }
  });
}

/**
 * construct global instance of socket.io
 * construct module
 */
export function constructServerModules (
  app: TemplatedApp,
  modules: (new () => object)[],
  globalServerOpt?: Partial<ServerOptions> & {
    port?: number,
    appListener?: (app: TemplatedApp) => void;
  }
) {
  modules.forEach(ModuleItem => {
    const isServerModule = Reflect.getMetadata(DecoratorMetadataName.ServerModuleIdentify, ModuleItem);
    if(!isServerModule) {
      throw new Error(`${ModuleItem} is not server module`);
    }

    const serverOpts = Reflect.getMetadata(DecoratorMetadataName.ServerOptions, ModuleItem);
    const io = createGlobalServer(app, {
      ...globalServerOpt,
      ...serverOpts
    });

    constructChildModules([ModuleItem], null);
    batchProviders.forEach(batch => constructProviders(batch.providers, batch.container, batch.ChildModule));
    batchInjectInfos.forEach(batch => bindInjectProperty(batch.identify, batch.instance, batch.propertyKey));
    batchGateways.forEach(batch => constructGateways(batch.gateways, io, batch.ChildModule));
  });

  const port = globalServerOpt?.port ?? 3000
  if (typeof globalServerOpt?.appListener === 'function') {
    globalServerOpt.appListener(app);
  } else {
    app.listen(port, token => {
      if(!token) console.warn(`port ${port} already in use`);
    });
  }
}
