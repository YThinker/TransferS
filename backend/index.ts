import "reflect-metadata";
import { App } from "uWebSockets.js";
import { constructModule } from "./factory/constructModules";
import { AppModule } from "./src/app.module";

async function boostrap () {
  /** uWebsocket entry */
  const app = App();
  constructModule(app, [
    AppModule
  ], {
    transports: ['websocket']
  });

  const port = 3000;
  app.listen(port, token => {
    if(!token) console.warn(`port ${port} already in use`);
  });
}

boostrap();
