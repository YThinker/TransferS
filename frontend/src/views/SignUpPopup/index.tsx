import Input from "@/components/Input";
import Popup from "@/components/Popup";
import { INIT_STATUS_ENUM } from "@/constants";
import { signUp } from "@/services/user";
import { store } from "@/store";
import { JSX, createEffect, createSignal, onCleanup } from "solid-js";

interface Props {
  open: boolean;
  onSuccess: (udid: string) => void;
}
export default (props: Props) => {
  const { open, onSuccess } = props;
  const [storeState] = store;
  const [signInOpen, setSignInOpen] = createSignal(false);
  const [submitParams, setSubmitParams] = createSignal({
    deviceName: '',
    deviceDescription: '',
  });

  let timer: number | null = null;

  createEffect(() => {
    if(open) {
      timer = window.setTimeout(() => setSignInOpen(true), 400);
    }
  });
  onCleanup(() => clearTimeout(timer));

  const handleInput: JSX.InputEventHandler<HTMLInputElement, InputEvent> = (e) => {
    setSubmitParams(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }

  const handleSubmit = async () => {
    const res = await signUp({
      ...submitParams(),
      fingerprint: storeState.fingerprint
    });
    if(res?.success) {
      onSuccess(res.data.udid);
    }
  }

  return (
    <Popup size="medium" open={signInOpen()} class="min-h-[335px] px-4 text-center">
      <div class="flex flex-col flex-1 gap-0.5 py-4 text-left">
        <h5 class="text-lg font-medium">Welcome</h5>
        <p class="m-0 text-xs font-normal">The device is not signed up yet, please sign up.</p>
      </div>
      <div class="text-left mb-3">
        <label class="block mb-1">Device name:</label>
        <Input value={submitParams().deviceName} onInput={handleInput} name="deviceName" placeholder="Please enter device name"/>
      </div>
      <div class="text-left mb-5">
        <label class="block mb-1">Device description:</label>
        <Input value={submitParams().deviceDescription} onInput={handleInput} name="deviceDescription" placeholder="Please enter a description of the device"/>
      </div>
      <button onClick={handleSubmit} class="px-6 py-2 bg-indigo-500 text-white rounded-lg">SIGN IN</button>
    </Popup>
  );
}