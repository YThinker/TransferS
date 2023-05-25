import { Index, ParentProps, createResource } from "solid-js"
import MessageIcon from '@/assets/icons/message.svg';
import DeviceIcon from '@/assets/icons/device.svg';
import { StoreContext, store } from "@/store";

export default (props: ParentProps) => {
  const operations = [{
    icon: MessageIcon,
    backgroundColor: '#DADADA',
  }, {
    icon: DeviceIcon,
    backgroundColor: '#DADADA',
  }]

  return (
    <StoreContext.Provider value={store}>
      <header class="flex max-w-none p-3 prose bg-white bg-opacity-95 backdrop:blur-lg items-center">
        <h5 class="flex-1 text-sm">阿洗洗的Macbook Pro</h5>
        <div class="flex gap-2 h-[20px]">
          <Index each={operations}>
            {item => (
              <button
                style={{ 'background-color': item().backgroundColor }}
                class="h-full rounded-[4px] active:shadow-inner transition-all"
              >
                <img class="w-full h-full m-0 p-0" src={item().icon} />
              </button>
            )}
          </Index>
        </div>
      </header>
      <main>{props.children}</main>
    </StoreContext.Provider>
  )
}
