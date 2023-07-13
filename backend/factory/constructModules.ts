import "reflect-metadata";
import { Namespace, Server, ServerOptions, Socket } from "socket.io";
import { ListenersMetadata } from "./SocketDecorators";
import { TemplatedApp } from "uWebSockets.js";
import { DecoratorMetadataName } from "./DecoratorMetadataName";
import { ProviderContainer } from "./ProviderContainer";
import { ClassConstructor, GatewayConstructor, GatewayInstance, InjectInfo, NamespaceOptions } from "./type";

function createGlobalServer (app: TemplatedApp, serverOpt?: Partial<ServerOptions>) {
  const io = new Server(serverOpt);
  io.attachApp(app);
  return io;
}

function bindInjectProperty (identify: unknown, target: object, propertyKey: string | symbol) {
  const belongModules: ClassConstructor[] | undefined = Reflect.getMetadata(DecoratorMetadataName.BelongModules, target);
  if (!belongModules || !belongModules.length) {
    throw new Error(`${target.constructor} unbind with module`);
  }

  const containers: Set<ProviderContainer> = new Set();
  const extendedContainers: Set<ProviderContainer> = new Set();
  const serverModuleContainers: Set<ProviderContainer> = new Set();
  const extendedGlobalContainers: Set<ProviderContainer> = new Set();
  belongModules.forEach(module => {
    containers.add(Reflect.getMetadata(DecoratorMetadataName.Container, module));

    const imports: ClassConstructor[] | undefined = Reflect.getMetadata(DecoratorMetadataName.Imports, module);
    imports?.forEach(importModule => {
      extendedContainers.add(Reflect.getMetadata(DecoratorMetadataName.Container, importModule));
    });

    const serverModules: ClassConstructor[] | undefined = Reflect.getMetadata(DecoratorMetadataName.BelongServerModules, module);
    serverModules?.forEach(serverModule => {
      serverModuleContainers.add(Reflect.getMetadata(DecoratorMetadataName.Container, serverModule));
      const serverModuleImports: ClassConstructor[] | undefined = Reflect.getMetadata(DecoratorMetadataName.Imports, module);
      serverModuleImports?.forEach(importModule => {
        extendedGlobalContainers.add(Reflect.getMetadata(DecoratorMetadataName.Container, importModule));
      });
    });
  });

  const matchedContainer = [
    ...containers,
    ...extendedContainers,
    ...serverModuleContainers,
    ...extendedGlobalContainers
  ].find(container => {
    return container.isBound(identify);
  })

  if (!matchedContainer) {
    throw new Error(`${identify} has not been injected`);
  }
  Reflect.set(target, propertyKey, matchedContainer.get(identify));
}

function bindDecoratorListeners (self: GatewayInstance, socket: Socket) {
  /** mount listener */
  const listeners: ListenersMetadata | undefined = Reflect.getMetadata(DecoratorMetadataName.EventListener, self);
  listeners?.forEach(listener => {
    socket.on(listener.name, (...args: any) => listener.listener.call(self, socket, ...args))
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

/** bind socket */
function bindDecoratorValuesAfterConnect (
  self: GatewayInstance,
  socket: Socket
) {
  const socketPropertyKeys: string[] | undefined = Reflect.getMetadata(DecoratorMetadataName.SocketProperty, self);
  socketPropertyKeys?.forEach(key => {
    Reflect.set(self, key, socket);
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

    const belongModules = Reflect.getMetadata(DecoratorMetadataName.BelongModules, instance) ?? [];
    belongModules.push(belongModule);
    Reflect.defineMetadata(DecoratorMetadataName.BelongModules, belongModules, instance);

    const injectInfos: InjectInfo[] | undefined = Reflect.getMetadata(DecoratorMetadataName.InjectInfos, instance);
    injectInfos?.forEach(info => bindInjectProperty(info.identify, instance, info.propertyKey));

    const opt: NamespaceOptions = Reflect.getMetadata(DecoratorMetadataName.NamespaceOptions, Gateway);
    const { namespace } = opt ?? {};
    const nsp = io?.of(namespace ?? '/');
    bindDecoratorValuesBeforeConnect(instance, nsp, io);
    nsp.on('connection', (socket) => {
      bindDecoratorValuesAfterConnect(instance, socket);
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
    const identify = Reflect.getMetadata(DecoratorMetadataName.InjectableIdentify, Provider);
    if(identify === undefined || identify === null) {
      throw new Error(`${Provider} is not injectable class`);
    }

    const instance = new Provider();
    const belongModules = Reflect.getMetadata(DecoratorMetadataName.BelongModules, instance) ?? [];
    belongModules.push(belongModule);
    Reflect.defineMetadata(DecoratorMetadataName.BelongModules, belongModules, instance);

    if(container.isBound(identify)) {
      return;
    }
    container.bindInstance(identify, instance);

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
  io: Server,
  serverModule: ClassConstructor | null,
) {
  modules.forEach(ChildModule => {
    const container: ProviderContainer = Reflect.getMetadata(DecoratorMetadataName.Container, ChildModule);
    if(!container) {
      throw new Error(`${ChildModule} is not a module`);
    }

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
    if(Array.isArray(childModules) && childModules.length) {
      constructChildModules(childModules, io, isServerModule ? ChildModule : serverModule);
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
      return;
    }
    const serverOpts = Reflect.getMetadata(DecoratorMetadataName.ServerOptions, ModuleItem);
    const io = createGlobalServer(app, {
      ...globalServerOpt,
      ...serverOpts
    });

    constructChildModules([ModuleItem], io, null);
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
