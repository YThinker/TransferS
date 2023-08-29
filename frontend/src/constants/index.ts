export const LOCAL_UUID_NAME = '_udid';

export enum INIT_STATUS_ENUM {
  INIT,
  SOCKET,
  /** SOCKET_ERROR retry */
  SOCKET_ERROR,
  FINGER_PRINT,
  CHECK_UDID,
  /** @desc @optional 注册 */
  SIGN_UP,
  /** @desc 登录 */
  SIGN_IN,
  WELCOME,
};
