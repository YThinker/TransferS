import { createStore } from "solid-js/store";
import { LOCAL_UUID_NAME } from "@/constants";
import { StoreState } from "./type";

export const store = createStore<StoreState>({
  initStatus: null,
  disconnectBySystem: false,
  set udid(val: string) { localStorage.setItem(LOCAL_UUID_NAME, val) },
  get udid() { return localStorage.getItem(LOCAL_UUID_NAME) ?? null },
  fingerprint: null,
  io: null,
  token: null,
  userInfo: null,
});
