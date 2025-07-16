import { useState } from "react";
import { Link } from 'react-router-dom';
import axios from 'axios';

function AdminForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await axios.post('http://localhost:3000/admin/forgotpassword', {
        email: email
      });

      setMessage(response.data.message || 'Check your email for youe new password.');
      setSuccess(response.data.success);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message||'Something went wrong. Please try again.');
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-110"
          style={{
            backgroundImage: `url('/sv4.jpg')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/40 via-cyan-800/20 to-blue-900/40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-teal-900/60 via-transparent to-cyan-500/20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-cyan-600/10 to-blue-800/30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Forgot Password
              </h2>
              <p className="text-cyan-100">
                Enter your admin email to reset password
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-cyan-100">Admin Email</label>
                <div className="relative">
                  <input 
                    type="email"
                    placeholder="Enter your admin email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:bg-white/10 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/25 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send New Password</span>
                  )}
                </div>
              </button>
            </form>

            {message && (
              <div className={`mt-6 p-4 rounded-xl text-center backdrop-blur-sm border transition-all duration-300 ${
                success
                  ? 'bg-green-500/20 text-green-100 border-green-400/30' 
                  : 'bg-red-500/20 text-red-100 border-red-400/30'
              }`}>
                {message}
              </div>
            )}

            <div className="mt-8 text-center">
              <Link 
                to="/admin/login"
                className="inline-flex items-center text-white/70 hover:text-white text-sm transition-colors duration-200 group"
              >
                <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Login
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminForgotPassword;
