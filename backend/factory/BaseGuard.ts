import { Socket } from "socket.io";

export abstract class BaseGuard {
  abstract pass (socket: Socket, listenerName: string, ...args: unknown[]): Promise<boolean> | boolean;
}
