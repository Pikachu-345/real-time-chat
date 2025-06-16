import React, { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil"; 
import { activeChatId, chatState } from "../recoil/chats";
import { SendHorizontal, Check, CheckCheck, Clock, Paperclip, XCircle } from "lucide-react";
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
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

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
  }, [activeChat?.messages, user._id]);

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
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

  const sendMessage = async () => {
    if (messageInput.trim() && activeChatIdState) {
      const participants = activeChatIdState.split('_').filter(id => id !== user._id);
      const tempMessageId= `temp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      const payload = {
        recieverId :participants[0],
        tempMessageId,
        message:messageInput.trim(),
        messageType:"text"
      }; 

      if (selectedImageFile) {
        try {
          const imageData = await readFileAsBase64(selectedImageFile);
          payload.messageType = "image";
          payload.imageData = imageData;
        } catch (error) {
          console.error("Error reading image file:", error);
          console.error("Failed to read image file. Please try again.");
          return; 
        }
      }
      socket.emit("send-message", payload);

      addMessage({
        chatId: activeChatIdState,
        messageId: tempMessageId, 
        senderId: user._id,
        senderUsername: user.username,
        message: messageInput.trim(),
        messageType: payload.messageType,
        status: "sending",
        ...(payload.imageData && { imageUrl: payload.imageData })
      });
      setMessageInput("");
      clearSelectedImage();
    }
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedImageFile(file);
        setImagePreviewUrl(URL.createObjectURL(file)); 
      } else {
        console.error("Please select an image file.");
        setSelectedImageFile(null);
        setImagePreviewUrl(null);
        event.target.value = null;
      }
    } else {
      clearSelectedImage();
    }
  };

  const clearSelectedImage = () => {
    setSelectedImageFile(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl); 
      setImagePreviewUrl(null);
    }
    const fileInput = document.getElementById('fileUpload');
    if (fileInput) {
      fileInput.value = null;
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

      {/* Username Change modal */}
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
        {activeChat.messages?.map((message) => (
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
              } relative`}
            >
              <div className="text-xs absolute bottom-1 right-2 text-gray-300">
                  {getStatusComponent(message.status)}
              </div>
              {message.type === "image" && message.imageUrl && (
                <div className="mb-2">
                  <img
                    src={message.imageUrl}
                    alt="Sent image"
                    className="max-w-full h-auto rounded-md object-cover bg-white"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x100/eeeeee/333333?text=Image+Error'; }}
                  />
                </div>
              )}
              {message.text && (
                <div className={message.messageType === "image" ? "mt-2" : ""}>
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
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div id="hell ya" className="p-4 border-t border-gray-200 flex flex-col">
        {imagePreviewUrl && (
          <div className="relative mb-4 p-2 border border-gray-300 rounded-lg bg-gray-50">
            <img
              src={imagePreviewUrl}
              alt="Preview"
              className="max-w-full h-70 object-contain mx-auto rounded-md"
            />
            <button
              onClick={clearSelectedImage}
              className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition"
              aria-label="Clear image"
            >
              <XCircle size={20} />
            </button>
          </div>
        )}

        <div className="flex items-center">
          <input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            type="text"
            placeholder={selectedImageFile ? "Add a caption..." : "Type a message..."}
            className="flex-1 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="file"
            id="fileUpload"
            className="hidden"
            name="fileUpload"
            onChange={handleFileChange}
            accept="image/*" 
          />
          <label
            htmlFor="fileUpload"
            className="ml-4 p-3 border border-transparent text-base font-medium rounded-full text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition ease-in-out duration-150 shadow-md"
            aria-label="Attach file"
          >
            <Paperclip size={20} />
          </label>
          <button
            onClick={sendMessage}
            className="ml-4 p-3 bg-blue-500 text-white rounded-full cursor-pointer hover:bg-blue-600 transition ease-in-out duration-150 shadow-md"
            aria-label="Send message"
          >
            <SendHorizontal size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;