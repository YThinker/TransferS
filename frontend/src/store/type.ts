export interface StoreState {
  /** @description UDID */
  udid: string | null,
  /**
   * @description
   * 本地生成的uuid，存储在localStorage中，与浏览器指纹一起混淆，提高浏览器指纹的可信度
   * 目前无其他更好设备唯一编码的解决方式，随本地缓存的删除而删除，不可避免
   * localStorage Name: @/constants/LOCAL_UUID_NAME
   */
  localUdid: string | null,
  /**
   * @description
   * 获取用户信息时调用
   */
  loading: boolean;
}