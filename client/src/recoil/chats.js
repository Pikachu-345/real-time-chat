import { atom, selector } from 'recoil';

export const activeChatId = atom({
  key: 'activeChatState',
  default: null,
});

export const chatState = atom({
  key: 'chatState',
  default: []
});

const statusPriority = {
  sending: 0,
  sent: 1,
  delivered: 2,
  seen: 3
};

const shouldUpdateStatus = (current, incoming) => {
  return statusPriority[current] < statusPriority[incoming];
}

export const manageMessagesSelector = selector({
  key: 'manageMessagesSelector',
  get: ({ get }) => get(chatState),
  set: ({ get, set }, payload) => {
    const currentChats = get(chatState);
    const activeChatIdVal = get(activeChatId);

    let updatedChats = [...currentChats];

    if(payload.type === 'UPDATE_MESSAGE'){
      const {chatId, status, messageId ,tempMessageId}=payload;
      updatedChats = updatedChats.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: chat.messages.map(msg => {
              // console.log(msg.id , tempMessageId);
              return msg.id === tempMessageId ? { ...msg, status: status, id:messageId } : msg
            })
          };
        }
        return chat;
      });
    } else if (payload.type === 'UPDATE_STATUS') {
      const { chatId, status, messageId } = payload;

      updatedChats = updatedChats.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: chat.messages.map(msg => {
              if (
                msg.id <= messageId &&
                shouldUpdateStatus(msg.status, status)
              ) {
                return {
                  ...msg,
                  status: status
                };
              }
              return msg;
            })
          };
        }
        return chat;
      });
    } else if (payload.type === 'ADD_USER') {
      const {
        currentUser,
        newUser, 
      } = payload;

      const chatId = `${newUser.userId}_${currentUser._id}`;
      const chatExists = updatedChats.some(chat => chat.id === chatId);

      if (chatExists) {
        alert(`Chat with ${newUser.username} already exists!`);
      } else {
        updatedChats=[
          ...updatedChats,
          {
            id: chatId,
            name: newUser.fullname,
            lastMessage: null,
            lastMessageTime: null,
            unreadCount: 0,
            avatarUrl: null,
            avatarColor: null,
            messages: []
          }
        ];
      }
    } else if (payload.type === 'ADD_MESSAGE') {
      const {
        chatId,
        messageId,
        senderId,
        senderUsername,
        message,
        timestamp,
        messageType,
        status,
        imageUrl,
        avatarUrl,
        avatarColor
      } = payload;

      let chatFound = false;
      updatedChats = updatedChats.map(chat => {
        if (chat.id === chatId) {
          chatFound = true;
          const isActive = chat.id === activeChatIdVal;

          return {
            ...chat,
            messages: [...(chat.messages || []), {
              id: messageId,
              sender: senderId,
              text: message,
              timestamp,
              type: messageType,
              status: status,
              ...(messageType === 'image' && imageUrl && { imageUrl })
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
            id: chatId,
            name: senderUsername,
            avatarUrl,
            avatarColor,
            lastMessage: message,
            lastMessageTime: timestamp,
            unreadCount: chatId === activeChatIdVal ? 0 : 1,
            messages: [{
              id: messageId,
              sender: senderId,
              text: message,
              timestamp,
              type: messageType,
              status: status,
              ...(messageType === 'image' && imageUrl && { imageUrl })
            }]
          }
        ];
      }
    } else if (payload.type === 'UPDATE_NAME') {
      const { chatId, newName } = payload;
      updatedChats = updatedChats.map(
        (chat) => chat.id === chatId ? { ...chat, name: newName } : chat
      )
    } else {
      alert('Some error occured');
    }

    updatedChats.sort((a, b) => {
      const timeA = new Date(a.lastMessageTime).getTime();
      const timeB = new Date(b.lastMessageTime).getTime();
      return timeB - timeA;
    });

    set(chatState, updatedChats);
  },
});