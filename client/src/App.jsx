import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Register from './components/Register'
import Login from './components/Login'
import Home from "./components/Home"
import ProtectedRoute from './ProtectedRoute';


function App() {
  const [isLogin,setIsLogin]=useState(false);

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route 
            path="/auth" 
            element = {
              <div>
                { isLogin ? 
                <Login islogin={isLogin} setIsLogin={setIsLogin}/> 
                : 
                <Register islogin={isLogin} setIsLogin={setIsLogin}/>}      
              </div>
            } 
          />
          <Route element={<ProtectedRoute/>}>
            <Route exact path="/" element={<Home/>} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App;
