import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from "./components/Home"
import ProtectedRoute from './ProtectedRoute';
import AuthPage from './components/AuthPage';


function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element = {<AuthPage />} />
          <Route element={<ProtectedRoute/>}>
            <Route exact path="/" element={<Home/>} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App;
