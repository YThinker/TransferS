import { Index, ParentProps, Show } from "solid-js"
import MessageIcon from '@/assets/icons/message.svg';
import DevicesIcon from '@/assets/icons/devices.svg';
import NetwordErrorIcon from '@/assets/icons/network-error.svg';
import InfoIcon from '@/assets/icons/info.svg';
import PageLoading from "@/views/PageLoading";
import { store } from "@/store";
import { INIT_STATUS_ENUM } from "@/constants";

export default (props: ParentProps) => {
  const [storeState] = store;

  const rightOperations = [{
    icon: MessageIcon,
    title: '提醒',
  }, {
    icon: DevicesIcon,
    title: '在线设备'
  }];

  const leftOperations = [{
    icon: InfoIcon,
    title: '设备信息',
  }, {
    icon: NetwordErrorIcon,
    title: '重新连接',
    hasBackground: false,
  }];

  return <PageLoading />;
  return (
    <Show
      when={storeState.initStatus === INIT_STATUS_ENUM.WELCOME}
      fallback={<PageLoading />}
    >
      <header class="flex justify-between max-w-none p-3 prose bg-white bg-opacity-95 backdrop:blur-lg items-center">
        <div class="flex gap-2 h-6">
          <Index each={leftOperations}>
            {item => (
              <button
                class={`h-6 p-0.5 rounded-md transition-all ${item().hasBackground !== false ? 'bg-gray-400 active:bg-blue-500 hover:bg-blue-400' : ''}`}
              >
                <img class="h-full w-auto m-0 p-0" src={item().icon} />
              </button>
            )}
          </Index>
        </div>
        <div class="flex gap-2 h-6">
          <Index each={rightOperations}>
            {item => (
              <button
                class="h-6 p-0.5 rounded-md active:shadow-inner transition-all bg-gray-400 active:bg-blue-500 hover:bg-blue-400"
              >
                <img class="h-full w-auto m-0 p-0" src={item().icon} />
              </button>
            )}
          </Index>
        </div>
      </header>
      <main>{props.children}</main>
    </Show>
  )
}
