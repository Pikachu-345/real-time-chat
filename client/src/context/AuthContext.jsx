import { createContext, useContext, useEffect, useState } from "react";
import authService from "../utils/auth.util";
import { useNavigate } from "react-router-dom";

const AuthContext =createContext(null);

export const AuthProvider = ({ children }) => {
  const [user , setUser]=useState(null);
  const [token,setToken]=useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate= useNavigate();

  useEffect(()=>{
    const storedToken = localStorage.getItem('token');
    const storedUser=localStorage.getItem("user");

    if(storedUser){
      setToken(storedToken);
      setIsLoggedIn(true);
      try {
        setUser(storedUser ? JSON.parse(storedUser) : null);
      } catch (e) {
        console.error("Failed to parse stored user data:", e);
        setUser(null);
      }
    }
    setLoading(false);
  },[]);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setToken(data.token);
      setIsLoggedIn(true);
      setUser(data.user || null); 
      localStorage.setItem('token', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      // logout();
      throw error;
    }
  };

  const signup = async (email,username, fullname, password) => {
    try {
      const data = await authService.signup(username, email, password, fullname);
      setToken(data.token);
      setIsLoggedIn(true);
      setUser(data.user || null);
      localStorage.setItem('token', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      window.location.href="/";
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }finally{
      setToken(null);
      setUser(null);
      setIsLoggedIn(false);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const value = {
    user,
    token,
    isLoggedIn,
    login,
    signup,
    logout, 
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <div>Loading authentication...</div> : children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};