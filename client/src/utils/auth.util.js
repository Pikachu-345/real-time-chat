import axios from 'axios';

const API_AUTH_URL = "http://localhost:8001/api/auth/";

axios.defaults.withCredentials = true;
const login = async (email, password) => {
  try {
    const response = await axios.post(API_AUTH_URL + "login", {
      email,
      password,
    });
    if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    // Better error handling:
    const message = error.response?.data?.message || 'Login failed';
    console.error("Login error:", message);
    throw new Error(message);
  }
};

const signup = async (username, email, password, fullname) => {
  try {
    const response = await axios.post(API_AUTH_URL + "signup", {
      username,
      email,
      fullname,
      password,
    });
    console.log("Signup response:", response.data);
    if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Signup failed';
    console.error("Signup error:", message);
    throw new Error(message);
  }
};

const logout = async () => {
  try {
    // The backend  clear the cookie. No need to send anything in the body.
    const response = await axios.post(API_AUTH_URL + "logout");
    localStorage.removeItem('user'); // Clear user data from local storage
    console.log("Logout response:", response.data);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Logout failed';
    console.error("Logout error:", message);
    throw new Error(message);
  }
};

// Example of a protected route call (e.g., to get user profile)
const getProfile = async () => {
    try {
        const response = await axios.get(API_AUTH_URL + "me");
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || 'Failed to fetch profile';
        console.error("Get profile error:", message);
        throw new Error(message);
    }
};

const authService = {
  login,
  signup,
  logout,
  // getProfile 
};

export default authService;