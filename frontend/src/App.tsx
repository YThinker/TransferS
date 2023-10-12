import { Component, Show } from 'solid-js';
import Dialog from '@/components/Dialog';
import Layout from '@/layout';
import PageLoading from './views/PageLoading';
import { store } from '@/store';
import { INIT_STATUS_ENUM } from './constants';

/**
 * 建立连接 -> 获取设备信息 -> 进行登录校验 -> 登录完成
 */
const App: Component = () => {
  const [storeState] = store;

  return (
    <Show
      when={storeState.initStatus === INIT_STATUS_ENUM.WELCOME}
      fallback={<PageLoading />}
    >
      <Layout>
      
      </Layout>
    </Show>

  );
};

export default App;
