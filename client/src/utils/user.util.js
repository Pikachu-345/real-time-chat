import axios from "axios";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { activeChatId, chatState } from "../recoil/chats";

export const searchRequest = async (searchTerm) => {
  try {
    const response = await axios.post(
      "http://localhost:8001/api/user/search", 
      { 
        username: searchTerm 
      },
      { 
        withCredentials: true 
      }
    );
    return response;
  }catch(e){
    return new Error(e);
  }
}
