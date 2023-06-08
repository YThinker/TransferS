import { Namespace, Server, ServerOptions, Socket } from "socket.io";
import { ChildModuleClass, DecoratorMetadataName, ListenersMetadata, NamespaceOptions } from "./SocketDecorators";
import { TemplatedApp } from "uWebSockets.js";

function createGlobalServer (app: TemplatedApp, serverOpt?: Partial<ServerOptions>) {
  const io = new Server(serverOpt);
  io.attachApp(app);
  return io;
}

function bindDecoratorListeners (self: ChildModuleClass, socket: Socket) {
  /** mount listener */
  const listeners: ListenersMetadata = Reflect.getMetadata(DecoratorMetadataName.EventListener, self);
  listeners?.forEach(listener => {
    socket.on(listener.name, (...args: any) => listener.listener.call(self, socket, ...args))
  });
}

function analyseDecoratorValues (self: ChildModuleClass) {
  const map = new Map<DecoratorMetadataName, string>();
  const ownKeys = Object.keys(self);
  for(let key of ownKeys) {
    /** get websocket client socket propertyKey */
    if(Reflect.getMetadata(DecoratorMetadataName.SocketProperty, self, key)) {
      map.set(DecoratorMetadataName.SocketProperty, key);
      continue;
    }
    /** get websocket namespace propertyKey */
    if(Reflect.getMetadata(DecoratorMetadataName.NamespaceProperty, self, key)) {
      map.set(DecoratorMetadataName.NamespaceProperty, key);
      continue;
    }
    /** get websocket server propertyKey */
    if(Reflect.getMetadata(DecoratorMetadataName.ServerProperty, self, key)) {
      map.set(DecoratorMetadataName.ServerProperty, key);
      continue;
    }
  }
  return map;
}

/** bind namespace and server */
function bindDecoratorValuesBeforeConnect (
  map: Map<DecoratorMetadataName, string>,
  self: ChildModuleClass,
  nsp: Namespace,
  ioInstance: Server
) {
  const nspPropertyKey = map.get(DecoratorMetadataName.NamespaceProperty);
  const serverPropertyKey = map.get(DecoratorMetadataName.ServerProperty);
  if(nspPropertyKey) {
    Reflect.set(self, nspPropertyKey, nsp);
  }
  if(serverPropertyKey) {
    Reflect.set(self, serverPropertyKey, ioInstance);
  }
}

/** bind socket */
function bindDecoratorValuesAfterConnect (
  map: Map<DecoratorMetadataName, string>,
  self: ChildModuleClass,
  socket: Socket
) {
  const socketPropertyKey = map.get(DecoratorMetadataName.SocketProperty);
  if(socketPropertyKey) {
    Reflect.set(self, socketPropertyKey, socket);
  }
}

/**
 * construct child module
 * inject provider
 */
function constructChildModule (
  modules: (new () => ChildModuleClass)[],
  io: Server
) {
  modules.forEach(ModuleItem => {
    const instance = new ModuleItem();
    const opt: NamespaceOptions = Reflect.getMetadata(DecoratorMetadataName.NamespaceModule, ModuleItem);
    const { namespace } = opt ?? {};
    const nsp = io?.of(namespace ?? '/');
    const decoratorMap = analyseDecoratorValues(instance);
    bindDecoratorValuesBeforeConnect(decoratorMap, instance, nsp, io);
    nsp.on('connection', (socket) => {
      bindDecoratorValuesAfterConnect(decoratorMap, instance, socket);
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
 * construct global instance of socket.io
 * construct module
 */
export function constructModule (
  app: TemplatedApp,
  modules: (new () => any)[],
  globalServerOpt?: Partial<ServerOptions>
) {
  modules.forEach(ModuleItem => {
    const childModules = Reflect.getMetadata(DecoratorMetadataName.ChildModules, ModuleItem);
    const serverOpts = Reflect.getMetadata(DecoratorMetadataName.ServerOptions, ModuleItem);
    const io = createGlobalServer(app, {
      ...globalServerOpt,
      ...serverOpts
    });
    constructChildModule(childModules, io);
  });
}
