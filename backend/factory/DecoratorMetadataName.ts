/** 注入Metadata的name */
export const DecoratorMetadataName = {
  ServerModuleIdentify: Symbol('isservermodule'),
  Container: Symbol('modulecontainer'),
  Modules: Symbol('modules'),
  Providers: Symbol('providers'),
  GlobalProviders: Symbol('globalproviders'),
  Gateways: Symbol('gateways'),
  GatewayIdentify: Symbol('isgateway'),
  ServerOptions: Symbol('serveroptions'),
  NamespaceOptions: Symbol('wsopt'),
  EventListener: Symbol('listener'),
  ServerProperty: Symbol('serverprop'),
  NamespaceProperty: Symbol('namespaceprop'),
  InjectableIdentify: Symbol('canbeinjected'),
  InjectInfos: Symbol('injectinfos'),
  BelongModules: Symbol('belongmodules'),
  BelongServerModules: Symbol('belongservermodules'),
  Imports: Symbol('importmodules'),
  ExceptionFilter: Symbol('exceptionfilter'),
  Guard: Symbol('guard'),
}
