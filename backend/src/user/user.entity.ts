import { Entity } from "@@/library/Mysql/mysql.service";
import { CreationOptional, DataTypes, Sequelize } from "sequelize";

export class User extends Entity<User> {
  declare id: CreationOptional<number>;
  declare udid: string;
  declare fingerprint: string;
  declare deviceName: string;
  declare deviceDescription: string;
  declare lastOnlineTime: Date | null;

  static useInject = (sequelize: Sequelize) => User.init({
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      unique: true,
      primaryKey: true,
      allowNull: false,
    },
    udid: {
      type: DataTypes.STRING,
      unique: true,
      primaryKey: true,
      allowNull: false,
    },
    fingerprint: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deviceName: {
      type: DataTypes.STRING,
      field: 'device_name',
      allowNull: false,
    },
    deviceDescription: {
      type: DataTypes.STRING,
      field: 'device_description',
      allowNull: true,
    },
    lastOnlineTime: {
      type: DataTypes.DATE,
      field: 'last_online_time',
      allowNull: true,
    }
  }, {
    sequelize,
    indexes: [{ unique: true, fields: ['id', 'udid'] }]
  }).sync({ alter: true });
}
