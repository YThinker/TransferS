import { Model, Options, Sequelize } from "sequelize";

/** 定义实体 */
export class Entity extends Model {
  /** 实体注入数据库 */
  static useInject: (sequelize: Sequelize) => void;
}

export class MysqlService {
  // db: Sequelize;

  static retryCount = 0;
  static repository: Sequelize;
  static setOptions (entities: typeof Entity[], options?: Options) {
    if (!MysqlService.repository) {
      MysqlService.repository = new Sequelize(options);
    }
    MysqlService.repository.authenticate().then(() => {
      entities.forEach(EntityItem => EntityItem.useInject(this.repository));
      console.log('successfully create mysql link pool');
    }).catch(e => {
      console.error(e);
      if(MysqlService.retryCount > 5) {
        return;
      }
      MysqlService.retryCount += 1;
      console.log(`retry database connection ${MysqlService.retryCount}...`);
      setTimeout(() => {
        MysqlService.setOptions(entities, options);
      }, 1500);
    });

    return this;
  }

  // constructor() {
  //   if(!MysqlService.repository) {
  //     throw new Error('static method setOptions has not been called');
  //   }
  //   console.log('bind pool property');
  //   this.db = MysqlService.repository;
  // }
}

// export const InjectRepository = (entity: typeof Entity) => {
//   return Inject(MysqlService, (service: MysqlService) => entity.useInject(service.db));
// }
