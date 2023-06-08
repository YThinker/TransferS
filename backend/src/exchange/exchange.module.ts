import { NamespaceModule } from "../../factory/SocketDecorators";
import { ServerOptions, Socket } from "socket.io";

@NamespaceModule({ namespace: '/exchange' })
export class ExchangeModule {

  constructor() {}

  onConnection(socket: Socket) {
    console.log('connection');
  }
}
