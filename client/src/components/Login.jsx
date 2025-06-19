import { LogIn } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";


const Login = ({ setIsLogin }) => {
  const [ userdata, setUserdata ]= useState({ email : "", password : ""});
  const {login} = useAuth();
  const [loading, setLoading] =useState(false);

  function handleChange(e){
    const {name,value}=e.target;
    setUserdata((prev)=>({
      ...prev,
      [name] : value
    }));
  }

  async function handleSubmit(e){
    try{
      setLoading(true);
      await login(userdata.email,userdata.password);
    } catch(e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-8 w-11/12 sm:w-4/5 md:w-full md:max-w-md lg:max-w-lg rounded-2xl">
      <h1 className="text-4xl sm:text-5xl font-semibold mb-3 sm:mb-4 text-center text-white">Sign In</h1>
      <h2 className="text-xs sm:text-sm text-gray-100 mb-4 sm:mb-6 text-center">
        Welcome back, login to continue!
      </h2>
      <div className="mb-3 sm:mb-4">
        <label htmlFor="email" className="block text-gray-200 text-md font-bold mb-1 sm:mb-2">
          Email
        </label>
        <input
          onChange={handleChange}
          name="email"
          type="text"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-200 leading-tight focus:outline-none focus:shadow-outline text-sm sm:text-base"
          placeholder="Enter your email"
        />
      </div>
      <div className="mb-4 sm:mb-6">
        <label htmlFor="password" className="block text-gray-200 text-md font-bold mb-1 sm:mb-2">
          Password
        </label>
        <input
          onChange={handleChange}
          name="password"
          type="password"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-200 leading-tight focus:outline-none focus:shadow-outline text-sm sm:text-base"
          placeholder="Enter your password"
        />
      </div>
      <div className="flex items-center justify-center">
        <button
          onClick={handleSubmit}
          className=" flex h-10 sm:h-12 justify-center items-center gap-2 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm sm:text-base"
          type="button"
        >
          {loading ? "Processing..":"Login "} {!loading && <LogIn size={18} />} 
        </button>
      </div>
      <div className="py-2 sm:py-3 text-center">
        <p className="text-gray-100 text-xs sm:text-sm">Don't have an account? No worries, 
          <button 
            onClick={()=>setIsLogin((isLogin)=>!isLogin)}
            className="cursor-pointer text-blue-600 hover:underline ml-1" 
          >
            create one here!
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;