import 'module-alias/register';
import { App } from "uWebSockets.js";
import { constructServerModules } from "./factory/constructModules";
import { AppModule } from "./src/app.module";

async function boostrap () {
  /** uWebsocket entry */
  const app = App();
  console.log('create app');

  constructServerModules(app, [
    AppModule
  ], {
    transports: ['websocket'],
    port: 3201
  });
}

boostrap();
