import { Component, useContext } from 'solid-js';
import Dialog from './components/Dialog';
import Layout from './layout';
import { io } from 'socket.io-client';
import { store } from './store';

/**
 * 建立连接 -> 获取设备信息 -> 进行登录校验 -> 登录完成
 */
const App: Component = () => {
  const [storeState, setStoreState] = store;

  const socket = io("ws://localhost:3201/user", {
    transports: ["websocket"],
  });

  return (
    <Layout>
      
    </Layout>
  );
};

export default App;
