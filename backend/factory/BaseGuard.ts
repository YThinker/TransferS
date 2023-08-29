import { Socket } from "socket.io";

export abstract class BaseGuard {
  abstract pass (socket: Socket, ...args: unknown[]): Promise<boolean> | boolean;
}
