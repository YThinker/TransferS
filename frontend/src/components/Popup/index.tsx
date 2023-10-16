import { JSX, JSXElement, ParentProps, Show, createEffect, createSignal, on } from "solid-js";
import { Portal } from "solid-js/web";
import { Motion, Presence } from "@motionone/solid";
// import ApperanceTransition from "@/baseComponents/ApperanceTransition";

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
const Popup = (props: ParentProps<Props>) => {
  const [initialStyles, setInitialStyles] =
    createSignal<Record<"overflow", string>>();
  let popupRef: HTMLDivElement = null;

  const handleBackdropClick = () => {
    props.onClose?.(false, "backdrop");
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if(e.code === "Escape") {
      props.onClose?.(false, "escape");
    }
  }

  createEffect(
    on(
      () => props.open,
      (cur, prev) => {
        if(cur === prev) return;
        if (props.open) {
          popupRef.focus();
          setInitialStyles({
            overflow: document.body.style.overflow,
          });
          document.body.style.overflow = "hidden";
        } else if(prev && !cur) {
          document.body.style.overflow = initialStyles().overflow;
        }
      }
    )
  );

  return (
    <Presence exitBeforeEnter>
      <Show when={props.open}>
        <Portal>
          <div onKeyDown={handleKeyDown} ref={popupRef} class="fixed z-50 inset-0 flex outline-none" tabIndex={-1}>
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              class="absolute inset-0 bg-black"
              onClick={handleBackdropClick}
            />
            <Motion.div
              initial={{ translateY: '100%' }}
              animate={{ translateY: 0 }}
              exit={{ translateY: '100%' }}
              transition={{ duration: 0.5 }}
              class={`self-end w-full ${props.size === 'large' ? 'h-2/3' : props.size === 'medium' ? 'h-1/2' : 'h-1/3'} bg-white bg-opacity-90 backdrop-blur-lg rounded-t-2xl ${props.class}`}
              style={props.style}
            >
              {props.children}
            </Motion.div>
          </div>
        </Portal>
      </Show>
    </Presence>
    
  );
};

export default Popup;
