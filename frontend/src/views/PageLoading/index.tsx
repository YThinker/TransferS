import { createResource } from "solid-js";
import TransparentLogo from "./TransparentLogo"
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { INIT_STATUS_ENUM, LOCAL_UUID_NAME } from "@/constants";
import { io } from "socket.io-client";
import { store } from "@/store";
import SignUpPopup from "../SignUpPopup";
import { signIn } from "@/services/user";
import { breakSocketWhenTimeout, establishConnection } from "@/services";

const tipsMap = new Map([
  [INIT_STATUS_ENUM.INIT, 'Creating connection...'],
  [INIT_STATUS_ENUM.SOCKET_ERROR, 'Connection down, reconnecting...'],
]);

export default () => {
  const [storeState, setStoreState] = store;

  const handleSignUpSuccess = (udid: string) => {
    setStoreState({
      udid: udid,
      initStatus: INIT_STATUS_ENUM.CHECK_UDID
    })
  }

  createResource(() => storeState.initStatus, async () => {
    console.log(storeState)
    /** 初始化socket连接 */
    if(storeState.initStatus === INIT_STATUS_ENUM.INIT) {
      const result = await establishConnection().catch(err => {
        console.error(err);
        if(!storeState.disconnectBySystem) {
          setStoreState('initStatus', INIT_STATUS_ENUM.SOCKET_ERROR);
        }
      });
      if(result) {
        setStoreState('initStatus', INIT_STATUS_ENUM.FINGER_PRINT);
      }
      return;
    }

    if(storeState.initStatus === INIT_STATUS_ENUM.SOCKET_ERROR) {
      setTimeout(() => setStoreState('initStatus', INIT_STATUS_ENUM.INIT), 5000);
      return;
    }

    /** 获取浏览器指纹 */
    if(storeState.initStatus === INIT_STATUS_ENUM.FINGER_PRINT) {
      if(!storeState.fingerprint) {
        const fpInstance = await FingerprintJS.load();
        const result = await fpInstance.get();
        setStoreState('fingerprint', result.visitorId);
      }
      setStoreState('initStatus', INIT_STATUS_ENUM.CHECK_UDID);
      return;
    }

    /** 获取本地存储的用户标识（若不存在，则调起注册） */
    if(storeState.initStatus === INIT_STATUS_ENUM.CHECK_UDID) {
      if(storeState.udid) {
        setStoreState('initStatus', INIT_STATUS_ENUM.SIGN_IN);
      } else {
        setStoreState('initStatus', INIT_STATUS_ENUM.SIGN_UP);
      }
      return;
    }

    if(storeState.initStatus === INIT_STATUS_ENUM.SIGN_IN) {
      const signInRes = await signIn({
        udid: storeState.udid,
        fingerprint: storeState.fingerprint
      });
      if(signInRes.success) {
        const { data: { token, userInfo } } = signInRes;
        storeState.io.auth['token'] = token;
        storeState.io.disconnect().connect();
        setStoreState({
          token: signInRes.data.token,
          userInfo,
          initStatus: INIT_STATUS_ENUM.WELCOME,
        });
        breakSocketWhenTimeout();
      }
    }
  });

  return (
    <div class="fixed inset-0 w-full h-full bg-white">
      <SignUpPopup open={storeState.initStatus === INIT_STATUS_ENUM.SIGN_UP} onSuccess={handleSignUpSuccess}/>
      <TransparentLogo class="w-16 h-auto text-indigo-600"/>
      {tipsMap.get(storeState.initStatus)}
    </div>
  )
}
