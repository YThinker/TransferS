import { createStore } from "solid-js/store";
import { StoreState } from "./type";

const initialState: StoreState = {
  udid: null,
  localUdid: null,
  loading: true,
};

export const store = createStore(initialState);
