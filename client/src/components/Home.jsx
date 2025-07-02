import { useEffect } from "react";
import useSocketConnection from "../socket_client/useSocketConnection";
import ChatWindow from "./ChatWindow";
import SideBar from "./Sidebar";
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from "recoil";
import { chatState } from "../recoil/chats";
import CallDialog from "./CallDialog";

const Home = () => {
  const socketInstance = useSocketConnection(); 
  const setChatState = useSetRecoilState(chatState);
  const chats = useRecoilValue(chatState);

  useEffect(() => {
    try {
      const storedChatState = localStorage.getItem("chatStore");
      if (storedChatState) {
        const parsedChatState = JSON.parse(storedChatState);
        setChatState(parsedChatState);
      }
    } catch (error) {
      console.error("Failed to load chat state from localStorage:", error);
    }

  }, [setChatState]);

  const saveChatStateOnUnload = useRecoilCallback(({ snapshot }) => () => {
    try {
      const currentChats = snapshot.getLoadable(chatState).contents;
      if (currentChats) { 
        localStorage.setItem("chatStore", JSON.stringify(currentChats));
        console.log("Chat state saved to localStorage on unload.");
      }
    } catch (error) {
      console.error("Failed to save chat state to localStorage on unload:", error);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('beforeunload', saveChatStateOnUnload);
    return () => {
      window.removeEventListener('beforeunload', saveChatStateOnUnload);
    };
  }, [saveChatStateOnUnload]);

  return (
      <>
        <div className="flex h-screen w-screen">
          <SideBar />
          <ChatWindow socket={socketInstance} chats={chats}/>
          <CallDialog socket={socketInstance} chats={chats}/>
        </div>
      </>
  )
}

export default Home;