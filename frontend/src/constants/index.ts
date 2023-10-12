export const LOCAL_UUID_NAME = '_udid';

export enum INIT_STATUS_ENUM {
  INIT,
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

export const SOCKET_TARGET = 'ws://localhost:3201/user';

export const BROKEN_TIMEOUT = 5 * 60 * 1000;
