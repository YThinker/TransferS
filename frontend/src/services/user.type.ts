export interface SignUpParams {
  deviceName: string;
  deviceDescription: string;
  fingerprint: string;
}

export interface SignInParams {
  udid: string;
  fingerprint: string;
}

export interface SignInDTO {
  token: string;
  userInfo: UserInfo;
}

export interface UserInfo {
  createdAt: string;
  deviceDescription: string;
  deviceName: string;
  deviceCode: string;
  fingerprint: string;
  id: string;
  lastOnlineTime: string;
  udid: string;
  updatedAt: string;
}
