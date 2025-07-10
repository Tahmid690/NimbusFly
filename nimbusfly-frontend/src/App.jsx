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
import BookingDetails from './components/BookingDetails'
import PaymentDetails from './components/PaymentDetails'
import PaymentPage from './components/PaymentPage'
import TicketConfirmation from './components/TicketConfirmation'
import UserDashboard from './components/UserDashboard'
import TestBoardingPass from './components/TestBoardingPass'
import TestConfirmation from './components/TestConfirmation'
import SimpleTest from './components/SimpleTest'
import Footer from './components/Footer'

function App() {
  console.log("App component is rendering");
  
  return (
    <div className="flex flex-col min-h-screen">
      <AuthProvider>
        <div className="flex-grow">
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

            <Route 
              path="/booking" 
              element={
                <ProtectedRoute>
                  <BookingDetails/>
                </ProtectedRoute>
              } 
            />

            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <PaymentPage/>
                </ProtectedRoute>
              }
            />

            <Route
              path="/confirmation"
              element={
                <ProtectedRoute>
                  <TicketConfirmation/>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard/>
                </ProtectedRoute>
              }
            />

            <Route path="/test-pdf" element={<TestBoardingPass />} />
            <Route path="/test-confirmation" element={<TestConfirmation />} />
            <Route path="/test-simple" element={<SimpleTest />} />

            
            <Route path="/admin/login" element={<AirlineLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </div>
        <Footer />
      </AuthProvider>
    </div>
  )
}

export default App