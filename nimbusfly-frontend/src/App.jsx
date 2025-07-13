import './App.css'
import { Routes, Route } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import HomePage from './components/HomePage'
import FlightResults from './components/FlightResults'
import AirlineLogin from './components/AirlineLogin'
import { AuthProvider } from './components/Authnication/AuthContext'
import { AdminAuthProvider } from './components/Authnication/AdminContext'
import ProtectedRoute from './components/Authnication/ProtectedRoute'
import PublicRoute from './components/Authnication/PublicRoute'
import BookingDetails from './components/BookingDetails'
import PaymentPage from './components/PaymentPage'
import TicketConfirmation from './components/TicketConfirmation'
import UserDashboard from './components/UserDashboard'
import Footer from './components/Footer'
import AdminPublicRoute from './components/Authnication/AdminPublicRoute'
import AdminProtectedRoute from './components/Authnication/AdminProtectedRoute'
import AdminLoginForm from './components/AirlineLogin'
import AdminDashboard from './components/AdminDashboard' 
import EnhancedAdminDashboard from './components/EnhancedAdminDashboard'
import FlightManagement from './components/FlightManagement'
import AdminBookings from './components/AdminBookings'
import TravelGuide from './components/TravelGuide'

function App() {
  console.log("App component is rendering");
  
  return (
    <div className="flex flex-col min-h-screen">
      <AuthProvider>
         <AdminAuthProvider>
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/flight-results" element={<FlightResults />} />

            <Route 
              path="/travel-guide"
              element={
                <PublicRoute>
                  <TravelGuide />
                </PublicRoute>
              }
            />

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

            <Route 
              path="/admin/login" 
              element={
                <AdminPublicRoute>
                  <AdminLoginForm />
                </AdminPublicRoute>
              } 
            />

            <Route 
              path="/admin/dashboard" 
              element={
                <AdminProtectedRoute>
                  <EnhancedAdminDashboard/>
                </AdminProtectedRoute>
              } 
            />

             <Route 
              path="/admin/flightmanagement" 
              element={
                <AdminProtectedRoute>
                  <FlightManagement/>
                </AdminProtectedRoute>
              } 
            />

            <Route 
              path="/admin/bookings" 
              element={
                <AdminProtectedRoute>
                  <AdminBookings/>
                </AdminProtectedRoute>
              } 
            />

            
          </Routes>
        </div>
        <Footer />
        </AdminAuthProvider>
      </AuthProvider>
    </div>
  )
}

export default App