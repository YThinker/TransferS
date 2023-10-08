import { Module, ServerModule } from "../factory/SocketDecorators";
import { User } from "./user/user.entity";
import { UserModule } from "./user/user.module";
import { MysqlService } from "@@/library/Mysql/mysql.service";

MysqlService.setOptions([User], {
  dialect: 'mysql',
  host: 'localhost',
  port: 3306,
  database: 'transfer_s',
  username: 'ythinker',
  password: 'b6DeacfE7bc1B'
});

@ServerModule({
  modules: [UserModule],
})
@Module()
export class AppModule {}
