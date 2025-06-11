import { useEffect } from "react";
import ChatWindow from "./ChatWindow";
import SideBar from "./Sidebar";
import socket from "../socket_client/socket";
import { useSetRecoilState } from "recoil";
import { chatState } from "../recoil/chats";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const setChats=useSetRecoilState(chatState);
  const user =useAuth();

  useEffect(()=>{
    // if(!socket.connected){
    //   socket.connect();
    // }
    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
      console.log("Socket.IO disconnected on Home unmount.");
    };
  },[]);

  return (
      <>
        <div className="flex h-lvh">
          <SideBar />
          <ChatWindow />
        </div>
      </>
  )
}

export default Home;