import { INIT_STATUS_ENUM } from "@/constants";
import { UserInfo } from "@/services/user.type";
import { Socket } from "socket.io-client";

export interface StoreState {
  /** 是否正在初始化 */
  initStatus: INIT_STATUS_ENUM,
  /** 由系统控制断网 */
  disconnectBySystem: boolean;
  /** Finger Print */
  fingerprint: string | null,
  /**
   * 本地生成的uuid，存储在localStorage中，与浏览器指纹一起混淆，提高浏览器指纹的可信度
   * 目前无其他更好设备唯一编码的解决方式，随本地缓存的删除而删除，不可避免
   * localStorage Name: @/constants/LOCAL_UUID_NAME
   */
  udid: string | null,
  /** 登录态 */
  token: string | null,
  userInfo: UserInfo;
  /** socket.io实例 */
  io: Socket | null;
}