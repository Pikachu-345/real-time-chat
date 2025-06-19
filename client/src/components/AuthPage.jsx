import React, { useState } from 'react'; 
import Register from "./Register";
import Login from "./Login"; 

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true); 

  return (
    <section className="w-screen h-screen flex flex-col md:flex-row items-center justify-center bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center light-bg dark:dark-bg" >
        <div className="absolute inset-0 bg-black/20 opacity-50 backdrop-blur-lg" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row bg-white dark:bg-white/10 rounded-2xl shadow-lg m-4 md:m-8 lg:m-12 overflow-hidden w-11/12 sm:w-4/5 md:w-full md:max-w-4xl lg:max-w-5xl xl:max-w-6xl h-auto md:h-[600px] lg:h-[700px]" >
        <div className="w-full md:w-1/2 bg-gray-200 dark:bg-black/30 p-6 md:p-0 flex items-center justify-center rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none order-first md:order-first h-48 md:h-full"> 
          <div className="logo h-full w-2/3 md:w-full md:h-1/2 lg:h-1/2 lg:w-full animate-bounce-y"></div>
        </div>

        <div className="w-full md:w-1/2 p-6 md:p-10 flex items-center justify-center bg-gray-700">
          {isLogin ?
            <Login setIsLogin={setIsLogin} /> : 
            <Register setIsLogin={setIsLogin} /> 
          }
        </div>
      </div>
    </section>
  );
};

export default AuthPage;