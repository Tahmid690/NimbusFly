import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm' 
import HomePage from './components/HomePage'
import FlightResults from './components/FlightResults'
import AirlineLogin from './components/AirlineLogin'
import AirlineReg from './components/AirlineReg'

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/flight-results" element={<FlightResults />} />
        <Route path="/login" element={<LoginForm/>}/>
        <Route path="/register" element={<RegisterForm/>}/>
        <Route path="/admin/login" element={<AirlineLogin/>}/>
        <Route path="/admin/register" element={<AirlineReg/>}/>
      </Routes>
    </div>
  )
}

export default App