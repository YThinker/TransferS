import { FlowProps, createResource } from 'solid-js';
import { StoreContext } from './context';
import { store } from './store';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { LOCAL_UUID_NAME } from '@/constants';

export {
  store,
  StoreContext
}

const StoreProvider = (props: FlowProps) => {

  createResource(async () => {
    const fpInstance = await FingerprintJS.load();
    const result = await fpInstance.get();
    result.visitorId;
  });

  return (
    <StoreContext.Provider value={store}>
      {props.children}
    </StoreContext.Provider>
  )
}

export default StoreProvider;
