import { createStore } from "solid-js/store";
import { INIT_STATUS_ENUM, LOCAL_UUID_NAME } from "@/constants";
import { StoreState } from "./type";

export const store = createStore<StoreState>({
  initStatus: INIT_STATUS_ENUM.INIT,
  disconnectBySystem: false,
  set udid(val: string) { localStorage.setItem(LOCAL_UUID_NAME, val) },
  get udid() { return localStorage.getItem(LOCAL_UUID_NAME) ?? null },
  fingerprint: null,
  io: null,
  token: null,
  userInfo: null,
});
