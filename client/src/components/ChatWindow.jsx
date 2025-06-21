import React, { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { activeChatId, chatState } from "../recoil/chats";
import { SendHorizontal, Paperclip, XCircle, MoreVertical, ArrowLeft } from "lucide-react"; 
import { useAuth } from "../context/AuthContext";
import { useUserActions } from "../utils/useUserActions";
import useSocketEvents from "../socket_client/useSocketEvent";

const ChatWindow = ({ socket }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [activeChatIdState,setActiveChatId] = useRecoilState(activeChatId);
  const chats = useRecoilValue(chatState);
  const [messageInput, setMessageInput] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
  }, [activeChat?.messages, user._id, socket]); 

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const getStatusComponent = (status) => {
    switch (status) {
      case "sending":
        return <div className="h-2 w-2 rounded-full bg-red-500" />;
      case "sent":
        return <div className="h-2 w-2 rounded-full bg-white border-1 border-gray-400" />; // Added border for visibility
      case "delivered":
        return <div className="h-2 w-2 rounded-full bg-gray-500" />;
      case "seen":
        return <div className="h-2 w-2 rounded-full bg-blue-500" />;
      default:
        return null;
    }
  };

  const sendMessage = async () => {
    if ((messageInput.trim() || selectedImageFile) && activeChatIdState) { // Allow sending just an image
      const participants = activeChatIdState.split('_').filter(id => id !== user._id);
      const tempMessageId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      const payload = {
        recieverId: participants[0],
        tempMessageId,
        message: messageInput.trim(),
        messageType: "text"
      };

      if (selectedImageFile) {
        try {
          const imageData = await readFileAsBase64(selectedImageFile);
          payload.messageType = "image";
          payload.imageData = imageData;
        } catch (error) {
          console.error("Error reading image file:", error);
          alert("Failed to read image file. Please try again."); // User-friendly alert
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
        alert("Please select an image file."); 
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
      alert("Username cannot be empty!"); 
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
      <div className="hidden sm:flex flex-col items-center justify-center h-full lg:w-3/4 bg-gray-50 p-6 shadow-inner text-center light-bg-full dark:dark-bg-full">
        <div className="bg-white/80 dark:bg-black/80 px-20 py-10 rounded-4xl">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Welcome!</h2>
          <p className="text-lg text-gray-600 dark:text-gray-100 max-w-md">
            Please select a chat from the sidebar to start a conversation or search for a username and add them to the chats list.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full lg:w-3/4 md:w-1/2 ${activeChatIdState ? 'w-full sm:w-full' : 'hidden sm:flex'} bg-gray-600/70 light-bg-full dark:dark-bg-full relative`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/90 dark:bg-black/90 border-b border-gray-300 dark:border-gray-600 shadow-sm">
        <div className="flex items-center">
          <button 
            className="mr-2"
            onClick={()=>setActiveChatId(null)}
          >
            <ArrowLeft className="text-white"/>
          </button>
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
                style={{ backgroundColor: activeChat.avatarColor || '#3b82f6' }}
              >
                {activeChat.name && activeChat.name.length > 0 ? activeChat.name[0].toUpperCase() : '?'}
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-lg font-semibold text-black dark:text-white">{activeChat.name}</div>
            <div className="text-sm text-gray-800 dark:text-gray-100 flex items-center gap-1">
              <div className="w-1.5 h-1.5 border-1 rounded-full bg-green-500"></div> 
              {activeChat.status || 'Offline'}
            </div>
          </div>
        </div>

        <button
          onClick={openDialog}
          className="hidden sm:block px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-colors duration-200"
        >
          Change Username
        </button>

        <div className="relative sm:hidden">
          <button
            onClick={()=>setShowOptions(!showOptions)}
            className="p-2 text-white hover:bg-gray-700 rounded-full"
            aria-label="More options"
          >
            <MoreVertical size={24} />
          </button>
          {showOptions && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-10">
              <button
                onClick={() => {
                  openDialog();
                  setShowOptions(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Change Username
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Username Change modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"> {/* Fixed for full overlay */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm transform scale-100 transition-transform duration-300 ease-out text-gray-900 dark:text-gray-100">
            <h3 className="text-xl font-bold mb-4">Change Username</h3>
            <div className="mb-4">
              <label htmlFor="newUsername" className="block text-sm font-medium mb-1">
                New Username
              </label>
              <input
                type="text"
                id="newUsername"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter new username"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDialog}
                className="px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition-colors duration-200"
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
            } mb-1 items-center`}
          >
            <div
              className={`max-w-[75%] sm:max-w-xs py-2 px-3 rounded-lg ${ 
                message.sender === user._id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
              } relative break-words`}
            >
              {message.messageType === "image" && message.imageUrl && (
                <div className="mb-2">
                  <img
                    src={message.imageUrl}
                    alt="Sent image"
                    className="max-w-full h-auto rounded-md object-cover bg-white dark:bg-gray-600"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x100/eeeeee/333333?text=Image+Error'; }}
                  />
                </div>
              )}
              {message.text && ( 
                <div className={message.messageType === "image" ? "mt-2 text-sm" : "text-sm sm:text-base"}> {/* Responsive font size */}
                  {message.text}
                </div>
              )}
            </div>
            {
            message.sender === user._id &&
            <div className="text-xs text-white-300 rounded-full m-1">
              {getStatusComponent(message.status)}
            </div>
            }
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-4 border-t border-gray-300 dark:border-white/20 flex flex-col bg-white/90 dark:bg-black/90">
        {imagePreviewUrl && (
          <div className="relative mb-4 p-2 border border-gray-600 rounded-lg bg-gray-450 dark:bg-gray-700">
            <img
              src={imagePreviewUrl}
              alt="Preview"
              className="max-w-full h-auto max-h-48 object-contain mx-auto rounded-md" // Constrained height for preview
            />
            <button
              onClick={clearSelectedImage}
              className="absolute top-1 right-1 p-1 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition"
              aria-label="Clear image"
            >
              <XCircle size={20} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2"> 
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
            className="flex-shrink-0 p-3 border border-transparent text-base font-medium rounded-full text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition ease-in-out duration-150 shadow-md"
            aria-label="Attach file"
          >
            <Paperclip size={20} />
          </label>
          <input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            type="text"
            placeholder={selectedImageFile ? "Add a caption..." : "Type a message..."}
            className="bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white flex-1 p-2 border border-gray-500 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base" // Responsive font size
          />
          <button
            onClick={sendMessage}
            className="flex-shrink-0 p-3 bg-blue-500 text-white rounded-full cursor-pointer hover:bg-blue-600 transition ease-in-out duration-150 shadow-md"
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