import { Index, ParentProps, Show } from "solid-js"
import MessageIcon from '@/assets/icons/message.svg';
import DeviceIcon from '@/assets/icons/device.svg';
import PageLoading from "@/views/PageLoading";
import { store } from "@/store";
import { INIT_STATUS_ENUM } from "@/constants";

export default (props: ParentProps) => {
  const [storeState] = store;

  const operations = [{
    icon: MessageIcon,
    title: '提醒',
  }, {
    icon: DeviceIcon,
    title: '在线设备'
  }];

  return (
    <Show
      when={storeState.initStatus === INIT_STATUS_ENUM.WELCOME}
      fallback={<PageLoading />}
    >
      <header class="flex max-w-none p-3 prose bg-white bg-opacity-95 backdrop:blur-lg items-center">
        <h5 class="flex-1 text-sm">{storeState.userInfo?.deviceName}</h5>
        <div class="flex gap-2 h-6">
          <Index each={operations}>
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
