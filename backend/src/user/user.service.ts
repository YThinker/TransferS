import { MysqlService } from "@@/library/Mysql/mysql.service";
import { Inject, Injectable } from "@@/factory/SocketDecorators";

@Injectable()
export class UserService {
  @Inject(MysqlService)
  declare mysqlService: MysqlService
}
