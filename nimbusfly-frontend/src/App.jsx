import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm' 

function App() {
  return (
    <div>
      <h1>NimbusFly Airlines</h1>
      <p>Welcome to our airline management system!</p>
      <Routes>
        <Route path="/login" element={<LoginForm/>}/>
        <Route path="/register" element={<RegisterForm/>}/>
      </Routes>
    </div>
  )
}

export default App