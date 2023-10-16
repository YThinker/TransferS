import { createResource } from "solid-js";
import TransparentLogo from "./TransparentLogo"
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { INIT_STATUS_ENUM } from "@/constants";
import { store } from "@/store";
import SignUpPopup from "../SignUpPopup";
import { signIn } from "@/services/user";
import { breakSocketWhenTimeout, establishConnection } from "@/services";
import ApperanceTransition from "@/baseComponents/ApperanceTransition";

const tipsMap = new Map([
  [INIT_STATUS_ENUM.INIT, 'Creating connection...'],
  [INIT_STATUS_ENUM.SOCKET_ERROR, 'Connection down, reconnecting...'],
  [INIT_STATUS_ENUM.FINGER_PRINT, 'Sign in...'],
  [INIT_STATUS_ENUM.CHECK_UDID, 'Sign in...'],
  [INIT_STATUS_ENUM.SIGN_UP, 'Sign up...'],
  [INIT_STATUS_ENUM.SIGN_IN, 'Sign in...'],
  [INIT_STATUS_ENUM.WELCOME, 'Welcome'],
]);

export default () => {
  const [storeState, setStoreState] = store;

  createResource(() => storeState.initStatus, async () => {
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
      }).catch(err => {
        console.error('sign in error', err);
        if(err.code === 1001) setStoreState('initStatus', INIT_STATUS_ENUM.SIGN_UP);
        return undefined;
      });
      if(signInRes?.success) {
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

  const handleSignUpSuccess = (udid: string) => {
    setStoreState({
      udid: udid,
      initStatus: INIT_STATUS_ENUM.CHECK_UDID
    })
  }

  const handleAnimationEntered = () => {
    setStoreState('initStatus', INIT_STATUS_ENUM.INIT);
  }

  const renderer = (position?: string) => (
    <div class={`relative flex flex-col justify-center items-center w-full h-[200%] bg-white ${position === 'bottom' ? '-translate-y-1/2' : ''}`}>
      <TransparentLogo class="w-24 h-auto text-indigo-600"/>
      <span class="absolute page-loading-text">{tipsMap.get(storeState.initStatus)}</span>
    </div>
  )

  return (
    <>
      <ApperanceTransition
        in={storeState.initStatus !== INIT_STATUS_ENUM.WELCOME}
        name='page-loading'
        duration={800}
        unmountOnExit
        onEntered={handleAnimationEntered}
      >
        <div class="fixed z-40 inset-0 m-0 page-loading">
          <div class="w-full h-1/2 overflow-hidden page-loading-top">{renderer()}</div>
          <div class="w-full h-1/2 overflow-hidden page-loading-bottom">{renderer('bottom')}</div>
        </div>
      </ApperanceTransition>
      <SignUpPopup open={storeState.initStatus === INIT_STATUS_ENUM.SIGN_UP} onSuccess={handleSignUpSuccess}/>
    </>
  )
}
