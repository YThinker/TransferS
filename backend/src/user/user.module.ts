import { JwtService } from "@/jwt/jwt.service";
import { Module } from "../../factory/SocketDecorators";
import { UserGateway } from "./user.gateway";
import { UserService } from "./user.service";

@Module({
  gateways: [UserGateway],
  providers: [UserService, JwtService]
})
export class UserModule {}
