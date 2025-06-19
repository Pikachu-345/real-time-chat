import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = ({ setIsLogin }) => {
  const [ userdata, setUserdata ]= useState({ name : "", username : "", password : "", email : ""});
  const [ loading, setLoading ]= useState(false);
  const { signup } = useAuth();
  const navigate=useNavigate();

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
      const data = await signup( userdata.email, userdata.username, userdata.name,userdata.password );
      if(data){
        navigate("/");
      }
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-8 w-11/12 sm:w-4/5 md:w-full md:max-w-md lg:max-w-lg">
      <h1 className="text-4xl sm:text-5xl font-semibold mb-3 sm:mb-4 text-center text-white">Sign Up</h1>
      <h2 className="text-xs sm:text-sm text-gray-100 mb-4 sm:mb-6 text-center">
        Don't have an account? No worries, create one here!
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
      <div className="mb-3 sm:mb-4"> 
        <label htmlFor="username" className="block text-gray-200 text-md font-bold mb-1 sm:mb-2">
          Username
        </label>
        <input
          onChange={handleChange}
          name="username"
          type="text"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-200 leading-tight focus:outline-none focus:shadow-outline text-sm sm:text-base"
          placeholder="Enter your username"
        />
      </div>
      <div className="mb-3 sm:mb-4"> 
        <label htmlFor="name" className="block text-gray-200 text-md font-bold mb-1 sm:mb-2">
          Name
        </label>
        <input
          onChange={handleChange}
          name="name"
          type="text"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-200 leading-tight focus:outline-none focus:shadow-outline text-sm sm:text-base"
          placeholder="Enter your name"
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
          onClick={()=>handleSubmit()}
          className=" flex h-10 sm:h-12 justify-center items-center gap-2 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm sm:text-base"
          type="button"
        >
          {loading ? "Processing..":"Register"} {!loading && <UserPlus size={18} />} 
        </button>
      </div>
      <div className="py-2 sm:py-3 text-center"> 
        <p className="text-gray-100 text-xs sm:text-sm">Already have an account? 
          <button
            onClick={()=>setIsLogin((isLogin)=>!isLogin)}
            className="cursor-pointer text-blue-600 hover:underline ml-1" 
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;