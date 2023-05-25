import { FlowProps, onMount } from 'solid-js';
import { StoreContext } from './context';
import { store } from './store';
import { LOCAL_UUID_NAME } from '@/constants';

export {
  store,
  StoreContext
}

const StoreProvider = (props: FlowProps) => {
  const [storeState, setStoreState] = store;

  onMount(() => {
    let localUdid = localStorage.getItem(LOCAL_UUID_NAME);
    if(!localUdid) {
      localUdid = window.crypto.randomUUID();
    }
  })

  return (
    <StoreContext.Provider value={store}>
      {props.children}
    </StoreContext.Provider>
  )
}

export default StoreProvider;
