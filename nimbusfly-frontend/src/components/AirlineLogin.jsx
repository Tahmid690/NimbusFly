import { useState } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAdminAuth } from './Authnication/AdminContext';

function AdminLoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const { login } = useAdminAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = "/admin/dashboard";

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            console.log('Attempting admin login with:', { email, password });
            const response = await axios.post('http://localhost:3000/admin/login', {
                email: email,
                password: password
            });

            console.log('Admin login API response:', response.data);
            console.log('Response status:', response.status);
            console.log('Full response object:', response);

            // Handle different possible API response structures
            let adminData = null;
            let token = null;

            // Check various possible response structures
            if (response.data) {
                if (response.data.admin && response.data.jwt_token) {
                    // Expected structure: { admin: {...}, jwt_token: "..." }
                    adminData = response.data.admin;
                    token = response.data.jwt_token;
                    console.log('Using structure: admin + jwt_token');
                } else if (response.data.admin && response.data.token) {
                    // Alternative: { admin: {...}, token: "..." }
                    adminData = response.data.admin;
                    token = response.data.token;
                    console.log('Using structure: admin + token');
                } else if (response.data.user && (response.data.token || response.data.jwt_token)) {
                    // Alternative: { user: {...}, token: "..." } or { user: {...}, jwt_token: "..." }
                    adminData = response.data.user;
                    token = response.data.token || response.data.jwt_token;
                    console.log('Using structure: user + token/jwt_token');
                } else if (response.data.success && response.data.data) {
                    // Alternative: { success: true, data: { admin: {...}, token: "..." } }
                    if (response.data.data.admin && response.data.data.token) {
                        adminData = response.data.data.admin;
                        token = response.data.data.token;
                        console.log('Using structure: success + data.admin + data.token');
                    } else if (response.data.data.user && response.data.data.token) {
                        adminData = response.data.data.user;
                        token = response.data.data.token;
                        console.log('Using structure: success + data.user + data.token');
                    }
                } else if (response.data.message === 'success' || response.status === 200) {
                    // Try to extract from various fields
                    adminData = response.data.admin || response.data.user || response.data.data || response.data;
                    token = response.data.jwt_token || response.data.token || response.data.access_token || 'dummy_token';
                    console.log('Using fallback extraction');
                }
            }

            console.log('Extracted admin data:', adminData);
            console.log('Extracted token:', token);
            console.log('Full response.data:', response.data);
            console.log('response.data.user:', response.data.user);

            if (adminData && token) {
                console.log('Admin data to store:', adminData);
                console.log('JWT token to store:', token);
                
                login(adminData, token);
                
                setMessage('Login successful!');
                console.log('Navigating to admin dashboard...');
                navigate(from, { replace: true });
            } else {
                console.error('Could not extract admin data and token from response');
                console.error('Response data keys:', Object.keys(response.data || {}));
                console.error('Full response data:', response.data);
                setMessage('Login failed: Could not process server response');
            }

        } catch (error) {
            console.error('Admin login failed:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            setMessage(error.response?.data?.message || 'Invalid admin credentials. Please try again.');
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
                <div className="w-full max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                        
                        <div className="text-center lg:text-left space-y-8 px-8">
                            <div className="space-y-6">
                                <h1 className="text-4xl lg:text-6xl xl:text-7xl font-black text-white leading-tight">
                                    <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
                                        Admin
                                    </span>
                                    <br />
                                    <span className="text-white drop-shadow-lg">
                                        Portal
                                    </span>
                                </h1>
                                <p className="text-xl lg:text-2xl text-cyan-100 leading-relaxed drop-shadow-lg">
                                    Secure access to NimbusFly airline administration dashboard
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-center lg:justify-end">
                            <div className="w-full max-w-md">
                                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
                                    
                                    <div className="text-center mb-8">
                                        <h2 className="text-3xl font-bold text-white mb-2">
                                            Admin Sign In
                                        </h2>
                                        <p className="text-cyan-100">
                                            Access your admin dashboard
                                        </p>
                                    </div>

                                    <form onSubmit={handleLogin} className="space-y-6">
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
                                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-teal-400/0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-cyan-100">Admin Password</label>
                                            <div className="relative">
                                                <input 
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Enter your admin password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:bg-white/10 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 backdrop-blur-sm pr-12"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-200"
                                                >
                                                    {showPassword ? (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-teal-400/0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
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
                                                        <span>Signing In...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>Admin Sign In</span>
                                                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                        </svg>
                                                    </>
                                                )}
                                            </div>
                                        </button>
                                    </form>

                                    {message && (
                                        <div className={`mt-6 p-4 rounded-xl text-center backdrop-blur-sm border transition-all duration-300 ${
                                            message.includes('successful') 
                                                ? 'bg-green-500/20 text-green-100 border-green-400/30' 
                                                : 'bg-red-500/20 text-red-100 border-red-400/30'
                                        }`}>
                                            {message}
                                        </div>
                                    )}

                                    <div className="mt-8 text-center">
                                        <Link 
                                            to="/" 
                                            className="inline-flex items-center text-white/70 hover:text-white text-sm transition-colors duration-200 group"
                                        >
                                            <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                            </svg>
                                            Back to Home
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminLoginForm;