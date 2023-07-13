import { DecoratorMetadataName } from "./DecoratorMetadataName";

export class ProviderContainer {
  private readonly storage = new Map();

  constructor () {}

  bind<T = unknown>(key: unknown, Provider: (new (...args: unknown[]) => T)) {
    this.storage.set(key, new Provider());
  }

  bindInstance<T = unknown>(key: unknown, instance: T) {
    this.storage.set(key, instance);
  }

  get<T = unknown>(key: unknown): T {
    return this.storage.get(key);
  }

  isBound(key: unknown) {
    return this.storage.has(key);
  }

  canBeInjected (target: (new (...args: unknown[]) => unknown)) {
    const identify = Reflect.getMetadata(DecoratorMetadataName.InjectableIdentify, target);
    return !!identify;
  }
}
