import useSocketConnection from "../socket_client/useSocketConnection";
import ChatWindow from "./ChatWindow";
import SideBar from "./Sidebar";

const Home = () => {
  const socketInstance = useSocketConnection();

  return (
      <>
        <div className="flex h-lvh">
          <SideBar />
          <ChatWindow socket={socketInstance}/>
        </div>
      </>
  )
}

export default Home;