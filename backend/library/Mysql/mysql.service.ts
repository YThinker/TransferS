import { InferAttributes, InferCreationAttributes, Model, Options, Sequelize } from "sequelize";

/** 定义实体 */
export class Entity<T extends Model> extends Model<
  InferAttributes<T>,
  InferCreationAttributes<T>
> {
  /** 实体注入数据库 */
  static useInject: (sequelize: Sequelize) => void;
}

export class MysqlService {
  static repository: Sequelize;
  static setOptions (entities: (typeof Entity<any>)[], options?: Options) {
    if (!MysqlService.repository) {
      MysqlService.repository = new Sequelize(options);
    }
    MysqlService.repository.authenticate().then(() => {
      entities.forEach(EntityItem => EntityItem.useInject(this.repository));
      console.log('successfully create mysql link pool');
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
