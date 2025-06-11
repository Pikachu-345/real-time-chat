import {io} from "socket.io-client";

const SERVER_URL = "http://localhost:8001";

const getToken = () => {
  const token = localStorage.getItem('token'); 
  return token;
};

const socket = io(SERVER_URL,{
  auth: {
    token: getToken(),
  },
  withCredentials:true,
  autoConnect:true
})

socket.on("connect", () => {
  console.log("Socket.IO connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("Socket.IO disconnected:", reason);
});

socket.on("connect_error", (error) => {
  console.error("Socket.IO connection error:", error.message);
});

export default socket;