import { Bookmark, Users, LogOut, Cog, Search, Plus } from "lucide-react"; // Import Plus icon
import { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { activeChatId, chatState } from "../recoil/chats";
import { useAuth } from "../context/AuthContext";
import { searchRequest } from "../utils/user.util";
import { useUserActions } from "../utils/useUserActions";
import logo from "../assets/logo.png"

const SideBar = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeChat, setActiveChat] = useRecoilState(activeChatId);
    const chats = useRecoilValue(chatState);
    const [searchResults, setSearchResults] = useState(null);
    const [searchError, setSearchError] = useState(null); 
    const { user, logout } = useAuth();
    const { addUser } = useUserActions();

    const handleLogOut = async () => {
        try {
            await logout();
            alert("Log Out Successful");
        } catch (e) {
            console.error(e);
        }
    }

    const handleInputChange = (event) => {
        setSearchTerm(event.target.value);
        setSearchResults(null);
        setSearchError(null); 
    };

    const handleSearch = async (event) => {
        event.preventDefault();
        setSearchResults(null);
        setSearchError(null);

        if (!searchTerm) {
            setSearchError('Please enter a username to search.');
            return;
        }

        try {
            const res = await searchRequest(searchTerm);
            const { username, userId, fullname, message } = res.data;
            if (username) {
                setSearchResults({ username, userId, fullname });
            } else {
                setSearchResults(null);
                setSearchError(message || 'User not found.');
            }
        } catch (error) {
            console.error('Error during user search:', error);
            if (error.response && error.response.data && error.response.data.message) {
                setSearchError(error.response.data.message);
            } else if (error.response && error.response.status === 401) {
                setSearchError('You are not authorized. Please log in.');
            } else {
                setSearchError('An error occurred during search. Please try again.');
            }
            setSearchResults(null);
        }
    };

    const handleAddUser= () => {
        addUser(searchResults,user);
        setSearchResults(null);
        setSearchTerm('');
    }

    return (
        <>
            <div className="flex flex-col h-screen bg-gray-50 w-1/3 border-r-1">
                <div className="h-20 flex items-center justify-between p-4 bg-white shadow">
                    {/* <h1 className="text-xl font-bold">ChatApp</h1> */}
                    <img src={logo} alt="logo" className="h-15 w-25"/>
                    <h1>Hello, {user?.fullname}</h1> 
                </div>
                <div className="flex w-full h-20 border-b justify-around items-center">
                    <Bookmark className="bg-gray-300 p-1 h-10 w-10 m-2 cursor-pointer rounded-lg hover:text-blue-500" />
                    <Users className="bg-gray-300 p-1 h-10 w-10 m-2 cursor-pointer rounded-lg hover:text-blue-500" />
                    <button onClick={handleLogOut}>
                        <LogOut className="bg-gray-300 p-1 h-10 w-10 m-2 cursor-pointer rounded-lg hover:text-blue-500" />
                    </button>
                    <Cog className="bg-gray-300 p-1 h-10 w-10 m-2 cursor-pointer rounded-lg hover:text-blue-500" />
                </div>
                {/* options */}
                <div className="flex p-2 bg-gray-100 border-b">
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-500">All</button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-500">Private</button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-500">Common</button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-500">More</button>
                </div>
                {/* search box */}
                <div className="border-b flex flex-col w-full"> {/* Changed to flex-col to stack search and results */}
                    <div className="flex w-full">
                        <input
                            type="text"
                            placeholder="Enter username.."
                            value={searchTerm}
                            onChange={handleInputChange}
                            className="block w-full px-2 max-h-10 py-2 m-1 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                        />
                        <button onClick={handleSearch} className="bg-gray-300 my-1 mr-1 w-1/6 rounded-md cursor-pointer">
                            <Search className="m-auto h-10" />
                        </button>
                    </div>
                    {/* Display search results or error message */}
                    {searchResults && ( 
                        <div className="flex items-center justify-between p-2 m-1 bg-blue-100 rounded-md">
                            <span className="font-semibold text-blue-800">{searchResults.username}</span>
                            <button
                                onClick={() => handleAddUser(searchResults)}
                                className="ml-2 p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                title={`Add Contact`}
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    )}
                    {searchError && (
                        <div className="p-2 m-1 text-red-700 bg-red-100 rounded-md">
                            {searchError}
                        </div>
                    )}
                </div>
                {/* chats */}
                <div className="bg-gray-100 p-1 overflow-y-auto flex-grow"> {/* Added flex-grow */}
                    <div className="space-y-2">
                        {chats.map((chat) => (
                            <div
                                key={chat.id}
                                className={`flex items-center p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition cursor-pointer ${activeChat === chat.id ? 'border-l-4 border-blue-500' : ''}`}
                                onClick={() => setActiveChat(chat.id)}
                            >
                                {/* Chat Avatar */}
                                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                                    {chat.avatarUrl ? (
                                        <img
                                            src={chat.avatarUrl}
                                            alt={chat.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full bg-gray-300 text-white text-lg font-bold">
                                            {chat.name[0]}
                                        </div>
                                    )}
                                </div>

                                {/* Chat Details */}
                                <div className="flex-1 ml-4">
                                    <div className="text-base font-semibold text-gray-800">
                                        {chat.name}
                                    </div>
                                    <div className="text-sm text-gray-600 truncate">
                                        {chat.lastMessage}
                                    </div>
                                </div>

                                {/* Timestamp and Unread Count */}
                                <div className="text-right">
                                    <div className="text-xs text-gray-500">{chat.lastMessageTime}</div>
                                    {chat.unreadCount > 0 && (
                                        <div className="mt-1 inline-flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full">
                                            {chat.unreadCount}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </>
    )
}

export default SideBar;