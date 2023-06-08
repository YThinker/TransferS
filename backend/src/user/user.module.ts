import { WebsocketServer, Subscribe, NamespaceModule, SocketInstance } from "../../factory/SocketDecorators";
import { Server, Socket } from "socket.io";

@NamespaceModule({ namespace: '/user' })
export class UserModule {
  @WebsocketServer server?: Server;
  @SocketInstance socket?: Socket;

  constructor() {}

  onConnection() {
    console.log('user connection', this.socket?.id);
  }

  @Subscribe('token')
  public handleToken(socket: Socket, data: any) {
    console.log('token', data);
  }
}
