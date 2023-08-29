import { Entity } from "@@/library/Mysql/mysql.service";
import { DataTypes, Model, Sequelize } from "sequelize";

export class User extends Entity {
  declare id: number;
  declare fingerprint: string;
  declare nickName: string;
  declare descriptions: string;
  declare lastOnlineTime: Date;

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
      allowNull: false,
    },
    deviceDescription: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastOnlineTime: {
      type: DataTypes.TIME,
      field: 'last_online_time',
      allowNull: false,
    }
  }, {
    sequelize,
    indexes: [{ fields: ['last_online_time'] }, { unique: true, fields: ['id', 'udid'] }]
  });
}
