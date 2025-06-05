import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm' 
import HomePage from './components/HomePage'
import FlightResults from './components/FlightResults'

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/flight-results" element={<FlightResults />} />
        <Route path="/login" element={<LoginForm/>}/>
        <Route path="/register" element={<RegisterForm/>}/>
      </Routes>
    </div>
  )
}

export default App