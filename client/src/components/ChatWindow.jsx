import React, { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil"; 
import { activeChatId, chatState } from "../recoil/chats";
import { SendHorizontal, Check, CheckCheck, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useUserActions } from "../utils/useUserActions";
import useSocketEvents from "../socket_client/useSocketEvent";

const ChatWindow = ({socket}) => {
  const activeChatIdState = useRecoilValue(activeChatId);
  const chats = useRecoilValue(chatState);
  const [messageInput, setMessageInput] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [isDialogOpen,setIsDialogOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const { addMessage, changeName } = useUserActions();

  useSocketEvents(); 

  const activeChat = chats.find((chat) => chat.id === activeChatIdState);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [activeChat?.messages]);

  useEffect(() => {
    if (activeChat && activeChat.messages && activeChat.messages.length > 0) {
      const lastMessage = activeChat.messages[activeChat.messages.length - 1];
      if (lastMessage.sender !== user._id && lastMessage.status !== 'read') {
        socket.emit('read-message', lastMessage.id, lastMessage.sender);
      }
    }
  }, [activeChatIdState, activeChat?.messages, user._id]);
  
  const getStatusComponent = (status) => {
    switch(status){
      case "sending":
        return <Clock />;
      case "sent":
        return <Check />;
      case "delivered":
        return <CheckCheck />;
      case "seen":
        return <CheckCheck color="#0548e6"/>;
    }
  }

  const sendMessage = () => {
    if (messageInput.trim() && activeChatIdState) {
      const participants = activeChatIdState.split('_').filter(id => id !== user._id);
      const tempMessageId= `temp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      const payload = {
        recieverId :participants[0],
        tempMessageId,
        message:messageInput.trim()
      }; 
      socket.emit("send-message", payload);

      addMessage({
        chatId: activeChatIdState,
        messageId: tempMessageId, 
        senderId: user._id,
        senderUsername: user.username,
        message: messageInput.trim(),
        messageType: "text",
        status: "sending" 
      });
      setMessageInput("");
    }
  };

  const handleConfirmChange = () => {
    if (newUsername.trim() !== '') {
      changeName(activeChat.id, newUsername.trim());
      closeDialog(); 
    } else {
      console.log("Username cannot be empty!");
    }
  };

  const openDialog = () => {
    setNewUsername(activeChat.name || ''); 
    setIsDialogOpen(true);
  };
  const closeDialog = () => {
    setIsDialogOpen(false);
    setNewUsername(''); 
  };

  if (!activeChat) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] w-full bg-gray-50 p-6 rounded-lg shadow-inner">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome!</h2>
        <p className="text-lg text-gray-600">
            Please select a chat from the sidebar to start a conversation or search for a username and add them to the chats list.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white w-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 rounded-t-xl shadow-sm">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
            {activeChat.avatarUrl ? (
              <img
                src={activeChat.avatarUrl}
                alt={activeChat.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="flex items-center justify-center w-full h-full text-white text-lg font-bold rounded-full"
                style={{ backgroundColor: activeChat.avatarColor || '#3b82f6' }} // Use activeChat.avatarColor or a default blue
              >
                {activeChat.name && activeChat.name.length > 0 ? activeChat.name[0].toUpperCase() : '?'}
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-lg font-semibold text-gray-800">{activeChat.name}</div>
            <div className="text-sm text-gray-500">{activeChat.status || 'Offline'}</div>
          </div>
        </div>

        <button
          onClick={openDialog}
          className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-colors duration-200"
        >
          Change Username
        </button>
      </div>

      {/* Username Change Dialog (Modal) */}
      {isDialogOpen && (
        <div className="relative inset-0 bg-blur-2xl h-full bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm transform scale-100 transition-transform duration-300 ease-out">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Change Username</h3>
            <div className="mb-4">
              <label htmlFor="newUsername" className="block text-sm font-medium text-gray-700 mb-1">
                New Username
              </label>
              <input
                type="text"
                id="newUsername"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter new username"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDialog}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmChange}
                className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-colors duration-200"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto" ref={messagesEndRef}>
        {activeChat.messages?.map((message, index) => (
          <div
            key={message.id} 
            className={`flex ${
              message.sender === user._id ? "justify-end" : "justify-start"
            } mb-4`}
          >
            <div
              className={`max-w-xs p-3 rounded-lg ${
                message.sender === user._id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {getStatusComponent(message.status)}
              {message.isAudio ? (
                <div className="flex items-center">
                  <span className="mr-2">{message.text}</span>
                  <button className="p-2 bg-blue-700 text-white rounded-full">
                    ▶
                  </button>
                </div>
              ) : (
                message.text
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            type="text"
            placeholder="Type a message..."
            className="flex-1 p-3 border rounded-lg shadow-sm focus:outline-none"
          />
          <button
            onClick={sendMessage}
            className="ml-4 p-3 bg-blue-500 text-white rounded-full"
          >
            <SendHorizontal />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;