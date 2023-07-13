import { createStore } from "solid-js/store";
import { StoreState } from "./type";

const initialState: StoreState = {
  udid: null,
  localUdid: null,
  io: null,
  token: null,
};

export const store = createStore(initialState);
