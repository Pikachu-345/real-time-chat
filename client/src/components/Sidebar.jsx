import { Bookmark, Users, LogOut, Cog, Search, Plus, ArrowLeft } from "lucide-react"; // Import ArrowLeft for back button
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
            alert("Logout failed. Please try again."); 
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

        if (!searchTerm.trim()) { 
            setSearchError('Please enter a username to search.');
            return;
        }

        try {
            const res = await searchRequest(searchTerm);
            const { username, userId, fullname, message } = res.data;
            if (username) {
                if (userId === user._id) {
                    setSearchError("You cannot add yourself.");
                    setSearchResults(null);
                    return;
                }
                const isUserAlreadyAdded = chats.some(chat => chat.id.includes(userId));
                if (isUserAlreadyAdded) {
                    setSearchError("This user is already in your chat list.");
                    setSearchResults(null);
                    return;
                }
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

    const handleAddUser = (searchResultUser) => {
        addUser(searchResultUser, user); 
        setSearchResults(null);
        setSearchTerm('');
        setSearchError(null); 
    }

    const handleChatClick = (chatId) => {
        setActiveChat(chatId);
    };

    return (
        <div className={`flex flex-col h-full border-r-1 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-black/90 lg:w-1/4 md:w-1/2 ${activeChat ? 'hidden sm:flex' : 'w-full sm:w-full'}`}>
            <div className="h-20 flex items-center justify-between p-4 bg-white dark:bg-black/90 shadow border-gray-300 dark:border-gray-600 border-b text-gray-900 dark:text-gray-100"> 
                <img src={logo} alt="logo" className="h-15 w-25"/>
                <h1 className="text-lg font-semibold">Hello, {user?.fullname}</h1>
            </div>

            <div className="flex w-full h-20 border-b justify-around items-center bg-white dark:bg-black/90 border-gray-200 dark:border-gray-700"> 
                <Bookmark className="bg-gray-300 dark:bg-gray-700 p-1 h-10 w-10 m-2 cursor-pointer rounded-lg  text-gray-800 dark:text-gray-200 hover:text-blue-500 hover:bg-gray-200 dark:hover:bg-gray-600" />
                <Users className="bg-gray-300 dark:bg-gray-700 p-1 h-10 w-10 m-2 cursor-pointer rounded-lg  text-gray-800 dark:text-gray-200 hover:text-blue-500 hover:bg-gray-200 dark:hover:bg-gray-600" />
                <button onClick={handleLogOut}>
                    <LogOut className="bg-gray-300 dark:bg-gray-700 p-1 h-10 w-10 m-2 cursor-pointer rounded-lg  text-gray-800 dark:text-gray-200 hover:text-blue-500 hover:bg-gray-200 dark:hover:bg-gray-600" />
                </button>
                <Cog className="bg-gray-300 dark:bg-gray-700 p-1 h-10 w-10 m-2 cursor-pointer rounded-lg text-gray-800 dark:text-gray-200 hover:text-blue-500 hover:bg-gray-200 dark:hover:bg-gray-600" />
            </div>

            {/* Options Filter (All, Private, Common, More) */}
            <div className="flex p-2 border-b bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <button className="flex-1 px-1 sm:px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">All</button>
                <button className="flex-1 px-2 sm:px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">Private</button>
                <button className="flex-1 px-2 sm:px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">Common</button>
                <button className="flex-1 px-2 sm:px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">More</button>
            </div>

            {/* Search Box */}
            <div className="border-b flex flex-col w-full 
                            bg-white dark:bg-black/90 border-gray-200 dark:border-gray-700"> 
                <form onSubmit={handleSearch} className="flex w-full p-2">
                    <input
                        type="text"
                        placeholder="Enter username.."
                        value={searchTerm}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:border-blue-500 focus:ring-blue-500
                                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                    />
                    <button 
                        type="submit" 
                        className="bg-blue-500 hover:bg-blue-600 text-white w-auto px-4 rounded-r-md cursor-pointer flex items-center justify-center"
                    >
                        <Search size={20} />
                    </button>
                </form>
                {searchResults && (
                    <div className="flex items-center justify-between p-2 m-2 bg-blue-100 dark:bg-blue-900 rounded-md text-blue-800 dark:text-blue-200">
                        <span className="font-semibold text-sm sm:text-base">{searchResults.username}</span>
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
                    <div className="p-2 m-2 text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 rounded-md text-sm">
                        {searchError}
                    </div>
                )}
            </div>

            {/* Chats List */}
            <div className="bg-gray-100 dark:bg-gray-900 p-1 overflow-y-auto flex-grow">
                <div className="space-y-1">
                    {chats.map((chat) => (
                        <div
                            key={chat.id}
                            className={`flex items-center p-3 shadow-sm transition cursor-pointer
                                        ${activeChat === chat.id
                                        ? 'bg-gray-200 dark:bg-gray-800 border-l-4 border-blue-500 rounded-lg' // Active chat styling
                                        : 'bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-400/50' // Default/hover styling
                                        }
                                        text-gray-900 dark:text-gray-100 border-gray-600 border-b-1 hover:rounded-lg`}
                            onClick={() => handleChatClick(chat.id)}
                        >
                            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                                {chat.avatarUrl ? (
                                    <img
                                        src={chat.avatarUrl}
                                        alt={chat.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div
                                        className="flex items-center justify-center w-full h-full text-white text-lg font-bold rounded-full"
                                        style={{ backgroundColor: chat.avatarColor || '#3b82f6' }}
                                    >
                                        {chat.name && chat.name.length > 0 ? chat.name[0].toUpperCase() : '?'}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 ml-3 overflow-hidden"> {/* Added overflow-hidden */}
                                <div className="text-base font-semibold truncate"> {/* Added truncate */}
                                    {chat.name}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 truncate"> {/* Added truncate */}
                                    {chat.lastMessage || 'No messages yet.'} {/* Fallback text */}
                                </div>
                            </div>

                            <div className="text-right flex flex-col items-end ml-2"> {/* Adjusted for better alignment */}
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {chat.lastMessageTime}
                                </div>
                                {chat.unreadCount > 0 && (
                                    <div className="mt-1 inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full"> {/* Smaller badge */}
                                        {chat.unreadCount}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default SideBar;