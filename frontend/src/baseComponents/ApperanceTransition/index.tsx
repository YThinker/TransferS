import { ParentProps, Show, children, createEffect, createMemo, createSignal, on, onCleanup } from "solid-js";

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

  const didItAfterOneFrame = (func: Function) => window.setTimeout(func, 16);

  const handleEntered = () => {
    removeTransitionClass();
    props.onEntered?.();
  };

  const handleExited = () => {
    removeTransitionClass();
    props.onExited?.();
  };

  /** 当元素载入时 */
  const handleElementEnter = () => {
    props.onEnter?.();
    if(enterDuration()) {
      firstChild().classList.add(classMap().enter);
      didItAfterOneFrame(() => firstChild().classList.add(classMap().enterTo));
      /** transition finished */
      timer = window.setTimeout(handleEntered, enterDuration())
    }
  }

  /** 当元素卸载时 */
  const handleElementExit = () => {
    props.onExit?.();
    if(exitDuration()) {
      firstChild().classList.add(classMap().exit);
      didItAfterOneFrame(() => firstChild().classList.add(classMap().exitTo));
      /** transition finished */
      timer = window.setTimeout(handleExited, exitDuration())
    } else {
      /** transition finished */
      removeTransitionClass();
    }
  }

  createEffect(on(() => props.in, (cur, prev) => {
    if(cur === prev) return;
    if(timer) clearTimeout(timer);
    if(!firstChild()) return;
    if(props.in) {
      handleElementEnter();
    } else {
      handleElementExit();
    }
  }));

  onCleanup(() => window.clearTimeout(timer));

  return childrenElement();
}

export default (props: ParentProps<Props>) => {
  const [notExited, setNotExited] = createSignal(props.in);

  createEffect(() => console.log(props))

  const handleExited = () => {
    props.onExited?.();
    setNotExited(false);
  }

  const fallback = () => (
    <ApperanceTransition
      {...props}
      onExited={handleExited}
    />
  )

  const needUnmount = () => (
    <Show when={notExited()}>
      {fallback()}
    </Show>
  )

  return (
    <Show when={props.unmountOnExit} fallback={fallback()}>
      {needUnmount()}
    </Show>
  )
}
