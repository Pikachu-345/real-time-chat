import { LogIn } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";


const Login = ({islogin, setIsLogin}) => {
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
    <section className="w-screen h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 shadow-md w-full max-w-md rounded-2xl">
        <h1 className="text-2xl font-semibold mb-4 text-center">Sign In</h1>
        <h2 className="text-sm text-gray-600 mb-6 text-center">
          Welcome back, login to continue!
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
            onClick={handleSubmit}
            className=" flex h-12 justify-center items-center gap-2 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
          >
            {loading ? "Processing..":"Login "} {!loading && <LogIn />} 
          </button>
        </div>
        <div className="py-3 text-center">
          <p className="text-gray-700">Don't have an account? No worries, 
            <button 
              onClick={()=>setIsLogin(!islogin)}
              className="cursor-pointer"
            >
              create one here!
            </button>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Login;