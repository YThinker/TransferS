import { ServerModule } from "../factory/SocketDecorators";
import { UserModule } from "./user/user.module";
import { ExchangeModule } from "./exchange/exchange.module";

@ServerModule(
  [UserModule, ExchangeModule]
)
export class AppModule {}
