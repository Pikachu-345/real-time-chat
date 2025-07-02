import { atom } from "recoil";

export const callTriggerState = atom({
  key: 'callTriggerState',
  default: false,
});

export const showCallDialog = atom({
  key: 'showCallDialog',
  default: false,
});

export const currentCallUser = atom({
  key: 'currentCallUser',
  default: null,
});

export const callType = atom({
  key: 'callType',
  default: null,
});