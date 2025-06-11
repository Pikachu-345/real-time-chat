import React, { useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import { activeChatId, chatState } from "../recoil/chats";
import { SendHorizontal } from "lucide-react";
import socket from "../socket_client/socket";
import { useAuth } from "../context/AuthContext";
import { useUserActions } from "../utils/useUserActions";

const ChatWindow = () => {
  const [activeChatIdState, setActiveChatId] = useRecoilState(activeChatId);
  const [chats, setChats] = useRecoilState(chatState);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef(null);
  const {user} = useAuth();
  const {addMessage} = useUserActions();

  const activeChat = chats.find((chat) => chat.id === activeChatIdState);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [activeChat?.messages]);

  useEffect(() => {
    socket.on("chat-message", addMessage);
    return () => socket.off("chat-message", addMessage);
  }, [activeChatIdState, setChats]);

  const sendMessage = () => {
    if (messageInput.trim() && activeChatIdState) {
      socket.emit("chat-message", activeChatIdState.split("_")[0], messageInput.trim());
      setMessageInput("");
    }
  };

  if (!activeChat) {
    return (
      <div className="flex flex-col h-full bg-white w-full">
        <div className="text-center p-4">Please select a chat.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white w-full">
      {/* Chat Header */}
      <div className="flex items-center p-4 border-b border-gray-200">
        <div className="w-12 h-12 rounded-full overflow-hidden">
          {activeChat.avatarUrl ? (
            <img
              src={activeChat.avatarUrl}
              alt={activeChat.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-300 text-white text-lg font-bold">
              {activeChat.name[0]}
            </div>
          )}
        </div>
        <div className="ml-4">
          <div className="text-lg font-semibold">{activeChat.name}</div>
          <div className="text-sm text-gray-500">{activeChat.status}</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto" ref={messagesEndRef}>
        {activeChat.messages?.map((message, index) => (
          <div
            key={index}
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
