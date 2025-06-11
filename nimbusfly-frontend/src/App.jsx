import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import HomePage from './components/HomePage'
import FlightResults from './components/FlightResults'
import AirlineLogin from './components/AirlineLogin'
import AirlineReg from './components/AirlineReg'
import Navbar from './components/Navbar'
import AdminDashboard from './components/admin/AdminDashboard'

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/flight-results" element={<FlightResults/>}/>
        <Route path="/login" element={<LoginForm/>}/>
        <Route path="/admin/login" element={<AirlineLogin/>}/>
        <Route path="/admin/dashboard" element={<AdminDashboard/>}/>
      </Routes>
    </div>
  )
}

export default App