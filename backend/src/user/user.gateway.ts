import { WebsocketServer, Subscribe, SocketInstance, Gateway, Inject } from "@@/factory/SocketDecorators";
import { Server, Socket } from "socket.io";
import { UserService } from "./user.service";

@Gateway({ namespace: '/user' })
export class UserGateway {
  @WebsocketServer server?: Server;
  @SocketInstance socket?: Socket;

  @Inject(UserService)
  userService?: UserService;

  constructor() {}

  onConnection(_: Socket) {
    console.log('userService', this.userService);
    console.log('user connection', this.socket?.id);
  }

  @Subscribe('token')
  public handleToken(socket: Socket, data: any) {
    console.log('token', data);
  }
}
