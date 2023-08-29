import { SignInParams, SignUpParams } from "./user.type";
import { request } from ".";
import { REQUEST_METHOD } from "./public.type";

export const signUp = (params: SignUpParams) => {
  return request<{ udid: string }>(params, {
    key: 'sign_up',
    method: REQUEST_METHOD.PUT
  });
}

export const signIn = (params: SignInParams) => {
  return request<{token: string}>(params, {
    key: 'sign_in',
    method: REQUEST_METHOD.POST
  })
}
