// utils/useUserActions.js
import { useSetRecoilState, useRecoilValue } from "recoil";
import { chatState, activeChatId } from "../recoil/chats";

export const useUserActions = () => {
  const setChats = useSetRecoilState(chatState);
  const activeChatIdVal = useRecoilValue(activeChatId);

  const addUser = (newUser, currentUser) => {
    setChats((prevChats) => {
      console.log("here");
      const chatExists = prevChats.some(chat => chat.id === `${newUser.userId}_${currentUser._id}`);
      if (chatExists) {
        alert(`Chat with ${newUser.username} already exists!`);
        return prevChats;
      }

      return [
        ...prevChats,
        {
          id: `${newUser.userId}_${currentUser._id}`,
          name: newUser.fullname,
          lastMessage: null,
          lastMessageTime: null,
          unreadCount: 0,
          avatarUrl: null,
          avatarColor: null,
          messages: []
        }
      ];
    });
  };

  const addMessage = (data) => {
    const {
      chatId,
      senderId,
      senderUsername,
      message,
      timestamp,
      messageType,
      avatarUrl,
      avatarColor
    } = data;

    const incomingChatId = chatId; // for clarity

    setChats((oldChats) => {
      let chatFound = false;
      let updatedChats = oldChats.map(chat => {
        if (chat.id === chatId) {
          chatFound = true;
          const isActive = chat.id === activeChatIdVal;

          return {
            ...chat,
            messages: [...(chat.messages || []), {
              id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
              sender : senderId,
              text: message,
              timestamp,
              type: messageType,
              status: "delivered"
            }],
            lastMessage: message,
            lastMessageTime: timestamp,
            unreadCount: isActive ? 0 : (chat.unreadCount || 0) + 1
          };
        }
        return chat;
      });

      if (!chatFound) {
        updatedChats = [
          ...updatedChats,
          {
            id: incomingChatId,
            name: senderUsername,
            avatarUrl,
            avatarColor,
            lastMessage: message,
            lastMessageTime: timestamp,
            unreadCount: incomingChatId === activeChatIdVal ? 0 : 1,
            messages: [{
              id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
              sender:senderId,
              text: message,
              timestamp,
              type: messageType,
              status: "delivered"
            }]
          }
        ];
      }

      updatedChats.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
      return updatedChats;
    });
  };

  return { addUser, addMessage };
};
