import { atom } from 'recoil';

export const activeChatId = atom({
  key: 'activeChatState',
  default: null,
});

export const chatState = atom({
  key: 'chatState',
  default: []
});