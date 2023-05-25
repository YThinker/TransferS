import { ParentProps, Show, children, createEffect, createMemo, createSignal, onCleanup } from "solid-js";

interface Props {
  in?: boolean;
  name?: string;
  duration?: number | { enter?: number, exit?: number };
  unmountOnExit?: boolean;
  onEnter?: () => void;
  onEntered?: () => void;
  onExit?: () => void;
  onExited?: () => void;
}

const ApperanceTransition = (props: ParentProps<Props>) => {
  const childrenElement = children(() => props.children);
  const firstChild = createMemo(() => childrenElement.toArray().find((item): item is HTMLElement => item instanceof HTMLElement));

  const [insetIn, setInsetIn] = createSignal(props.in);
  const classMap = createMemo(() => ({
    enter: `${props.name}-enter`,
    enterTo: `${props.name}-enter-to`,
    exit: `${props.name}-exit`,
    exitTo: `${props.name}-exit-to`,
  }));
  const enterDuration = createMemo(() => typeof props.duration === 'number' ? props.duration : props.duration.enter ?? 0);
  const exitDuration = createMemo(() => typeof props.duration === 'number' ? props.duration : props.duration.exit ?? 0);

  let timer: number | null = null;

  /** remove all class used by transition */
  const removeTransitionClass = () => {
    firstChild().classList.remove(...Object.values(classMap()));
  }

  const handleElementEnter = () => {
    props.onEnter?.();
    setInsetIn(props.in);
    if(enterDuration()) {
      firstChild().classList.add(classMap().enter);
      window.setTimeout(() => firstChild().classList.add(classMap().enterTo));
      /** transition finished */
      timer = window.setTimeout(() => {
        removeTransitionClass();
        props.onEntered?.();
      }, enterDuration())
    }
  }

  const handleElementExit = () => {
    props.onExit?.();
    if(exitDuration()) {
      firstChild().classList.add(classMap().exit);
      window.setTimeout(() => firstChild().classList.add(classMap().exitTo));
      /** transition finished */
      timer = window.setTimeout(() => {
        removeTransitionClass();
        setInsetIn(props.in);
        props.onExited?.();
      }, exitDuration())
    } else {
      /** transition finished */
      removeTransitionClass();
      setInsetIn(props.in);
    }
  }

  createEffect(() => {
    onCleanup(() => window.clearTimeout(timer));
    if(timer) clearTimeout(timer);
    if(!firstChild()) return;
    if(props.in) {
      handleElementEnter();
    } else {
      handleElementExit();
    }
  });

  return (
    <Show when={props.unmountOnExit} fallback={childrenElement()}>
      <Show when={insetIn()}>
        {childrenElement()}
      </Show>
    </Show>
  )
}

export default ApperanceTransition;
