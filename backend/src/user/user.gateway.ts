import { WebsocketServer, Subscribe, Gateway, Inject, Put, Post } from "@@/factory/SocketDecorators";
import { Server, Socket } from "socket.io";
import { UserService } from "./user.service";
import { SignInParams, SignUpParams } from "./user.dto";

@Gateway({ namespace: '/user' })
export class UserGateway {
  @WebsocketServer server?: Server;

  @Inject(UserService)
  declare userService: UserService;

  constructor() {}

  @Put('sign_up')
  public async signUp(_: Socket, data: SignUpParams) {
    const udid = await this.userService.signUp(data);
    if(udid) {
      return { udid };
    }
  }

  @Post('sign_in')
  public async signIn(socket: Socket, data: SignInParams) {
    console.log(socket.handshake)
    const res = await this.userService.signIn(data);
    if(res.token) {
      return res;
    }
  }
}
