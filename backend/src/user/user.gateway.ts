import { WebsocketServer, Subscribe, Gateway, Inject, Put } from "@@/factory/SocketDecorators";
import { Server, Socket } from "socket.io";
import { UserService } from "./user.service";
import { SignUpParams } from "./user.dto";

@Gateway({ namespace: '/user' })
export class UserGateway {
  @WebsocketServer server?: Server;

  @Inject(UserService)
  declare userService: UserService;

  constructor() {}

  @Put('sign_up')
  public async signUp(socket: Socket, data: SignUpParams) {
    const udid = await this.userService.signUp(data);
    if(udid) {
      return { udid };
    }
  }
}
