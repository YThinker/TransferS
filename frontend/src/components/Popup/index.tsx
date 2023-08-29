import { JSX, JSXElement, ParentProps, Show, createEffect, createSignal, on } from "solid-js";
import { Portal } from "solid-js/web";
import ApperanceTransition from "@/baseComponents/ApperanceTransition";

import "./index.css";

export type DialogCloseTriggerBy = 'escape' | 'backdrop' | 'default';

interface Props {
  class?: string;
  style?: JSX.CSSProperties;
  size?: 'small' | 'medium' | 'large';
  message?: JSXElement;
  open?: boolean;
  onClose?: (open: boolean, triggerBy?: DialogCloseTriggerBy) => void;
}
const Dialog = (props: ParentProps<Props>) => {
  const [initialStyles, setInitialStyles] =
    createSignal<Record<"overflow", string>>();
  const [insetOpen, setInsetOpen] = createSignal(true);
  let popupRef: HTMLDivElement = null;

  const handleBackdropClick = () => {
    props.onClose?.(false, "backdrop");
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if(e.code === "Escape") {
      props.onClose?.(false, "escape");
    }
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
          popupRef.focus();
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
        <ApperanceTransition in={props.open} duration={500} name="popup" unmountOnExit onExited={handleOnExited}>
          <div onKeyDown={handleKeyDown} ref={popupRef} class="fixed z-50 inset-0 flex outline-none" tabIndex={-1}>
            <div onClick={handleBackdropClick} class="absolute inset-0 bg-black bg-opacity-10 popup-backdrop"/>
            <div
              class={`self-end w-full ${props.size === 'large' ? 'h-2/3' : props.size === 'medium' ? 'h-1/2' : 'h-1/3'} prose bg-white bg-opacity-90 backdrop-blur-lg rounded-t-2xl popup-body ${props.class}`}
              style={props.style}
            >
              {props.children}
            </div>
          </div>
        </ApperanceTransition>
      </Portal>
    </Show>
  );
};

export default Dialog;
