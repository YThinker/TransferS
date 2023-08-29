import { DecoratorMetadataName } from "./DecoratorMetadataName";
import { ProviderContainer } from "./ProviderContainer";
import { ClassConstructor, FindMatchedContainersParameters, InjectInfo } from "./type";

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
