import { Component, createSignal } from 'solid-js';
import Dialog from './components/Dialog';
import Layout from './layout';
import { StoreContext, store } from './store';
import { Socket, io } from 'socket.io-client';

const App: Component = () => {
  const [open, setOpen] = createSignal(true);

  const handleDialogChange = (val: boolean) => {
    setOpen(val)
  };

  const socket = io("ws://localhost:3000/user", {
    transports: ["websocket"]
  });

  return (
    <StoreContext.Provider value={store}>
      <Layout>
        
      </Layout>
    </StoreContext.Provider>
  );
};

export default App;
