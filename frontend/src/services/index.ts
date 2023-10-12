import { store } from "@/store";
import { RequestOptions, StandardData } from "@/services/public.type";
import { BROKEN_TIMEOUT, INIT_STATUS_ENUM, SOCKET_TARGET } from "@/constants";
import { Socket, io } from "socket.io-client";

const [storeState, setStoreState] = store;

let brokenTimeoutFlag: number | null = null;

/** The link hangs if no request has been made for more than 5 minutes */
export const breakSocketWhenTimeout = () => {
  window.clearTimeout(brokenTimeoutFlag);
  window.setTimeout(() => {
    storeState.io.disconnect();
    setStoreState({
      disconnectBySystem: true,
    })
  }, BROKEN_TIMEOUT)
}

/** establishConnection */
export const establishConnection = async () => {
  const authObject = {
    token: storeState.token ?? undefined,
  };

  let socketIo: Socket;
  if(storeState.io) {
    socketIo = storeState.io.connect();
  } else {
    socketIo = io(SOCKET_TARGET, {
      transports: ["websocket"],
      auth: authObject
    });
    setStoreState('io', socketIo);
  }

  return new Promise<boolean>((resolve, reject) => {
    socketIo.once('connect', () => {
      resolve(true);
    });
    socketIo.once('connect_error', (e) => {
      reject(e);
    });
  });
};

/** use socket */
export const request = <T = never>(params: unknown, options:RequestOptions) => {
  breakSocketWhenTimeout();
  let timeoutFlag: number | null = null;
  const { method, key, timeout } = options;

  storeState.io.emit(`${method}:${key}`, params);

  return new Promise<StandardData<T>>((resolve, reject) => {
    if(timeout > 0) {
      timeoutFlag = window.setTimeout(() => {
        reject({ success: false, message: 'Request timeout.' });
      }, timeout)
    }
    storeState.io.once(`${method}:${key}:success`, (data: StandardData<T>) => {
      if(timeoutFlag) window.clearTimeout(timeoutFlag);
      resolve(data);
    });
    storeState.io.once(`${method}:${key}:fail`, (data: StandardData) => {
      if(timeoutFlag) window.clearTimeout(timeoutFlag);
      reject(data);
    });
  });
}
