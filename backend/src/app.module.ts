import { Module, ServerModule } from "../factory/SocketDecorators";
import { UserModule } from "./user/user.module";
import { MysqlService } from "@@/library/Mysql/mysql.service";

MysqlService.setOptions({
  host: 'localhost',
  port: 3306,
});

@ServerModule()
@Module({
  modules: [
    UserModule,
  ],
  providers: [MysqlService]
})
export class AppModule {}
