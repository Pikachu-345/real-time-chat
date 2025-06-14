import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = ({islogin, setIsLogin}) => {
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
    <section className="w-screen h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 shadow-md w-full max-w-md rounded-2xl">
        <h1 className="text-2xl font-semibold mb-4 text-center">Sign Up</h1>
        <h2 className="text-sm text-gray-600 mb-6 text-center">
          Don't have an account? No worries, create one here!
        </h2>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <input
            onChange={handleChange}
            name="email"
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter your email"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
            Username
          </label>
          <input
            onChange={handleChange}
            name="username"
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter your username"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
            Name
          </label>
          <input
            onChange={handleChange}
            name="name"
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter your name"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
            Password
          </label>
          <input
            onChange={handleChange}
            name="password"
            type="password"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter your password"
          />
        </div>
        <div className="flex items-center justify-center">
          <button
            onClick={()=>handleSubmit()}
            className=" flex h-12 justify-center items-center gap-2 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
          >
            {loading ? "Processing..":"Register"} {!loading && <UserPlus />}
          </button>
        </div>
        <div className="py-3 text-center">
          <p className="text-gray-700">Already have an account? <button className="cursor-pointer" onClick={()=>setIsLogin(!islogin)}>Sign In</button></p>
        </div>
      </div>
    </section>
  );
};

export default Register;