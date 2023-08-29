export interface SignUpParams {
  deviceName: string;
  deviceDescription: string;
  fingerprint: string;
}

export interface SignInParams {
  udid: string;
  fingerprint: string;
}
