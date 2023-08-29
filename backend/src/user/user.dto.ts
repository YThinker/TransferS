export interface SignUpParams {
  fingerprint: string;
  deviceName: string;
  deviceDescription: string;
}

export interface SignInParams {
  udid: string;
  fingerprint: string;
}
