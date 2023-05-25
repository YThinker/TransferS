import { Component, createSignal } from 'solid-js';
import Dialog from './components/Dialog';
import Layout from './layout';
import { StoreContext, store } from './store';

const App: Component = () => {
  const [open, setOpen] = createSignal(true);

  const handleDialogChange = (val: boolean) => {
    setOpen(val)
  };

  return (
    <StoreContext.Provider value={store}>
      <Layout>
        
      </Layout>
    </StoreContext.Provider>
  );
};

export default App;
