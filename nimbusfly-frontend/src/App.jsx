import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import HomePage from './components/HomePage'
import FlightResults from './components/FlightResults'
import AirlineLogin from './components/AirlineLogin'
import AirlineReg from './components/AirlineReg'
import Navbar from './components/Navbar'
import AdminDashboard from './components/admin/AdminDashboard'
import { AuthProvider } from './components/Authnication/AuthContext'
import ProtectedRoute from './components/Authnication/ProtectedRoute'
import PublicRoute from './components/Authnication/PublicRoute'

function App() {
  return (
    <div>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/flight-results" element={<FlightResults />} />


          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginForm />
              </PublicRoute>
            } 
          />
          
          
          <Route path="/admin/login" element={<AirlineLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </AuthProvider>
    </div>
  )
}

export default App