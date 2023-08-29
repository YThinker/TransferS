import { store } from "@/store";
import { RequestOptions, StandardData } from "./public.type";

const [storeState] = store;

export const request = <T = never>(params: unknown, options:RequestOptions) => {
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
