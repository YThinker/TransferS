import { Socket } from "socket.io";
import { BaseGuard } from "./BaseGuard";
import { DecoratorMetadataName } from "./DecoratorMetadataName";
import { ProviderContainer } from "./ProviderContainer";
import { ResponseError } from "./Response";
import { ClassConstructor, FindMatchedContainersParameters, GuardsMapChild, InjectInfo } from "./type";
import { BaseExceptionFilter } from "./BaseExceptionFilter";

export const findLinkedModules = (
  belongModules: ClassConstructor[]
) => {
  const extendModules: ClassConstructor[] = [];
  const serverModules: ClassConstructor[] = [];
  const globalExtendModules: ClassConstructor[] = [];
  belongModules.forEach(module => {
    const imports: ClassConstructor[] | undefined = Reflect.getMetadata(DecoratorMetadataName.Imports, module);
    if(imports?.length) {
      extendModules.push(...imports);
    }

    const servers: ClassConstructor[] | undefined = Reflect.getMetadata(DecoratorMetadataName.BelongServerModules, module);
    if(servers?.length) {
      serverModules.push(...servers);
    }
    servers?.forEach(serverModule => {
      const serverModuleImports: ClassConstructor[] | undefined = Reflect.getMetadata(DecoratorMetadataName.Imports, serverModule);
      if(serverModuleImports?.length) {
        globalExtendModules.push(...serverModuleImports);
      }
    });
  });

  return {
    modules: belongModules,
    extendModules,
    serverModules,
    globalExtendModules,
  }
}

export const findMatchedContainers = ({
  modules,
  extendModules,
  serverModules,
  globalExtendModules,
}: FindMatchedContainersParameters) => {
  const containers: Set<ProviderContainer> = new Set();
  const extendedContainers: Set<ProviderContainer> = new Set();
  const serverModuleContainers: Set<ProviderContainer> = new Set();
  const extendedGlobalContainers: Set<ProviderContainer> = new Set();

  modules.forEach(module => {
    containers.add(Reflect.getMetadata(DecoratorMetadataName.Container, module));
  });
  extendModules.forEach(module => {
    extendedContainers.add(Reflect.getMetadata(DecoratorMetadataName.Container, module));
  });
  serverModules.forEach(module => {
    serverModuleContainers.add(Reflect.getMetadata(DecoratorMetadataName.Container, module));
  });
  globalExtendModules.forEach(module => {
    extendedGlobalContainers.add(Reflect.getMetadata(DecoratorMetadataName.Container, module));
  });

  return Array.from(new Set([
    ...containers,
    ...extendedContainers,
    ...serverModuleContainers,
    ...extendedGlobalContainers
  ]));
}

export const findMatchedContainer = (
  matchedContainers: ProviderContainer[],
  identify: InjectInfo['identify'],
) => {
  return matchedContainers.find(container => {
    return container.isBound(identify);
  })
}

export const bindBelongModules = (
  instance: object,
  belongModule: (new () => object),
) => {
  const belongModules = Reflect.getMetadata(DecoratorMetadataName.BelongModules, instance) ?? [];
  belongModules.push(belongModule);
  Reflect.defineMetadata(DecoratorMetadataName.BelongModules, belongModules, instance);
}

export const useGuards = async (
  totalGuardsMapChildren: GuardsMapChild[],
  matchedContainers: ProviderContainer[],
  useSimplifiedModules: ClassConstructor[],
  socket: Socket,
  listenerName: string,
  args: unknown[],
) => {
  for (let guardMapChild of totalGuardsMapChildren) {
    const { guard, extra } = guardMapChild;
    const guardMatchedContainer = findMatchedContainer(matchedContainers, guard);
    const injectedGuard = guardMatchedContainer?.get<BaseGuard>(guard);
    const passResult = await injectedGuard?.pass(socket, listenerName, ...args, ...extra);
    if(passResult === false) {
      throw new ResponseError(403, `${guard} Guard Forbidden`);
    }
  }
  for (let Module of useSimplifiedModules) {
    if('pass' in Module && typeof Module.pass === 'function') {
      const passResult = await Module.pass(socket, ...args);
      if(passResult === false) {
        throw new ResponseError(403, `Guard Forbidden`);
      }
    }
  }
}

export const useExceptionFilters = async (
  e: unknown,
  totalExceptionFilters: BaseExceptionFilter[],
  useSimplifiedModules: ClassConstructor[],
  listenerName: string,
) => {
  let errorResponse = e;
  let filtered = false;
  for (let Filter of totalExceptionFilters) {
    const constraintType: Function = Reflect.getMetadata(DecoratorMetadataName.Exception, Filter);
    if ((constraintType && e instanceof constraintType) || !constraintType) {
      errorResponse = await Filter.catch(e, listenerName);
      filtered = true;
      break;
    }
  }
  if(!filtered) {
    for (let Module of useSimplifiedModules) {
      if('catch' in Module && typeof Module.catch === 'function') {
        errorResponse = await Module.catch(e, listenerName);
        break;
      }
    }
  }
  return errorResponse;
}
