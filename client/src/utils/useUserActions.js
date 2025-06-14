import { useSetRecoilState } from "recoil";
import { manageMessagesSelector } from "../recoil/chats";

export const useUserActions = () => {
  const manageMessages = useSetRecoilState(manageMessagesSelector);

  const addUser = (newUser, currentUser) => {
    manageMessages({
      type:'ADD_USER',
      newUser,
      currentUser
    })
  };

  const changeName = (chatId, newName) => {
    manageMessages({
      type: 'UPDATE_NAME',
      newName,
      chatId
    })
  }

  const addMessage = (data) => {
    const chatId = `${data.senderId}_${data.recieverId}`;
    manageMessages({ 
      type: 'ADD_MESSAGE', 
      chatId, 
      ...data 
    });
  };

  const updateMessage = (messageId, chatId, status, tempMessageId) => {
    manageMessages({ 
      type:'UPDATE_MESSAGE',
      messageId, 
      chatId, 
      status, 
      tempMessageId 
    });
  }

  const updateMessageStatus = (messageId, chatId, status) => {
    manageMessages({
      type: 'UPDATE_STATUS',
      messageId,
      chatId,
      status,
    });
  };

  return { addUser, addMessage, updateMessageStatus, updateMessage, changeName }; 
};