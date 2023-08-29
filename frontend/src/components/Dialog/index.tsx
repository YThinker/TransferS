import { For, JSX, JSXElement, Show, createEffect, createSignal, on } from "solid-js";
import { Portal } from "solid-js/web";
import ApperanceTransition from "@/baseComponents/ApperanceTransition";

import "./index.css";

export interface DialogButtonGroupItem {
  text: string;
  type?: 'danger' | 'primary' | 'secondary' | 'normal';
  onClick?: () => void;
}

export type DialogCloseTriggerBy = 'escape' | 'backdrop' | 'default';

interface Props {
  title: JSXElement;
  message?: JSXElement;
  class?: string;
  style?: JSX.CSSProperties;
  open?: boolean;
  onClose?: (open: boolean, triggerBy?: DialogCloseTriggerBy) => void;
  operations?: DialogButtonGroupItem[];
}
const Dialog = (props: Props) => {
  const [initialStyles, setInitialStyles] =
    createSignal<Record<"overflow", string>>();
  const [insetOpen, setInsetOpen] = createSignal(true);
  let dialogRef: HTMLDivElement = null;

  const handleBackdropClick = () => {
    props.onClose?.(false, "backdrop");
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if(e.code === "Escape") {
      props.onClose?.(false, "escape");
    }
  }

  const handleDefaultClick = () => {
    props.onClose?.(false, "default");
  }

  const handleOnExited = () => {
    setInsetOpen(false);
  }

  createEffect(
    on(
      () => props.open,
      () => {
        if (props.open) {
          setInsetOpen(true);
          dialogRef.focus();
          setInitialStyles({
            overflow: document.body.style.overflow,
          });
          document.body.style.overflow = "hidden";
        } else if (initialStyles()) {
          document.body.style.overflow = initialStyles().overflow;
        }
      }
    )
  );

  /** {insetOpen} is used to unmount <Portal> when <Dialog> has been closed */
  return (
    <Show when={insetOpen()}>
      <Portal>
        <ApperanceTransition in={props.open} duration={500} name="dialog" unmountOnExit onExited={handleOnExited}>
          <div onKeyDown={handleKeyDown} ref={dialogRef} class="fixed z-50 inset-0 flex justify-center items-center outline-none" tabIndex={-1}>
            <div onClick={handleBackdropClick} class="absolute inset-0 bg-black bg-opacity-10 dialog-backdrop"/>
            <div
              class={`flex flex-col w-64 min-h-[100px] prose text-center bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl dialog-body ${props.class}`}
              style={props.style}
            >
              <div class="flex flex-col flex-1 gap-0.5 p-4 pb-3">
                <h5 class="text-base font-medium">{props.title}</h5>
                <p class="m-0 text-xs font-normal">{props.message}</p>
              </div>
              <div
                class="flex overflow-hidden border-t rounded-b-2xl"
                classList={{
                  "flex-col divide-y": props.operations?.length && props.operations.length > 2,
                  'divide-x': !props.operations?.length || props.operations.length <= 2
                }}
              >
                <For
                  each={props.operations}
                  fallback={<button onClick={handleDefaultClick} type="button" class="w-full py-1 px-2 truncate hover:bg-neutral-500 hover:bg-opacity-5 active:bg-black active:bg-opacity-5 text-indigo-500">确定</button>}
                >
                  {item => (
                    <button
                      type="button"
                      class="w-full py-1 px-2 truncate hover:bg-neutral-500 hover:bg-opacity-5 active:bg-black active:bg-opacity-5"
                      classList={{
                        "text-indigo-500": item.type === 'primary',
                        "text-red-500": item.type === 'danger',
                        "text-gray-400": item.type === 'secondary'
                      }}
                      onClick={item.onClick}
                    >{item.text}</button>
                  )}
                </For>
              </div>
            </div>
          </div>
        </ApperanceTransition>
      </Portal>
    </Show>
  );
};

export default Dialog;
