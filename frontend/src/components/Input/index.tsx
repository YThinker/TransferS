import { JSX, createSignal, splitProps } from "solid-js";

export default (props: JSX.InputHTMLAttributes<HTMLInputElement>) => {
  const [local, restProps] = splitProps(props, ['class', 'style', 'onFocus', 'onBlur']);

  const [isFocus, setIsFocus] = createSignal(false);

  const handleFocus = (e: FocusEvent & { currentTarget: HTMLInputElement; target: HTMLInputElement; }) => {
    if(Array.isArray(local.onFocus)) {
      local.onFocus[0](local.onFocus[1], e);
    } else if(typeof local.onFocus === 'function'){
      local.onFocus(e);
    }
    // local.onFocus[0](e);
    if(!isFocus()) setIsFocus(true);
  }
  const handleBlur = (e: FocusEvent & { currentTarget: HTMLInputElement; target: HTMLInputElement; }) => {
    if(Array.isArray(local.onBlur)) {
      local.onBlur[0](local.onBlur[1], e);
    } else if(typeof local.onBlur === 'function'){
      local.onBlur(e);
    }
    // local.onBlur[0](e);
    if(isFocus()) setIsFocus(false);
  }

  return (
    <label class={`block p-2 leading-5 border rounded-lg ${isFocus() ? 'border-indigo-600' : 'border-gray-200'} ${isFocus() ? '' : 'hover:border-gray-300'} cursor-text transition-all duration-200 ${local.class}`} style={local.style}>
      <input onFocus={handleFocus} onBlur={handleBlur} class="w-full outline-none h-5" {...restProps}/>
    </label>
  );
}