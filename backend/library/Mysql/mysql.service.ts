import { Injectable } from "@@/factory/SocketDecorators";
import { PoolOptions, createPool, Pool } from "mysql2/promise";

let pool: Pool;

@Injectable()
export class MysqlService {
  pool: Pool;

  static setOptions (options: PoolOptions) {
    if (!pool) {
      console.log('initialize mysql link pool')
      pool = createPool(options);
    }
  }

  constructor() {
    if(!pool) {
      throw new Error('uncalled setOptions static method');
    }
    console.log('bind pool property');
    this.pool = pool;
  }
}
