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
  }, {
    icon: DeviceIcon,
  }];

  return (
    <Show
      when={storeState.initStatus === INIT_STATUS_ENUM.WELCOME}
      fallback={<PageLoading />}
    >
      <header class="flex max-w-none p-3 prose bg-white bg-opacity-95 backdrop:blur-lg items-center">
        <h5 class="flex-1 text-sm">阿洗洗的Macbook Pro</h5>
        <div class="flex gap-2 h-8">
          <Index each={operations}>
            {item => (
              <button
                class="h-7 p-0.5 rounded-md active:shadow-inner transition-all bg-gray-400 hover:bg-indigo-500"
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
