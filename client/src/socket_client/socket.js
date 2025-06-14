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
  autoConnect:false
})

export default socket;