import { useState, useEffect } from "react";
import { Link ,useNavigate,useLocation} from 'react-router-dom'
import axios from 'axios'
import { useAuth } from './Authnication/AuthContext';

function LoginForm(){
    const [isLogin, setIsLogin] = useState(true)
    
    const [email,setEmail] = useState('')
    const [password,setPassword] = useState('')
    
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: '', 
        phone_number: '',
        date_of_birth: '',
        address: ''
    })
    
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false) 
    
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/";

    const handleLogin = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        
        try{
            const response = await axios.post('http://localhost:3000/auth/user/login',{
                email: email,
                password: password
            })

            console.log('Login successful!', response.data)

            const { user, jwt_token } = response.data;
            // console.log(token);
            login(user, jwt_token);

            setMessage('Login successful!')
            navigate(from, { replace: true });

        }
        catch(error){
            console.log('Login failed',error.response.data);
            setMessage('Invalid credentials. Please try again.')
        }
        finally {
            setIsLoading(false)
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        
        if (formData.password !== formData.confirmPassword) {
            setMessage('Passwords do not match. Please try again.')
            setIsLoading(false)
            return
        }
        
        try {
            const { confirmPassword, ...registerData } = formData
            
            const response = await axios.post('http://localhost:3000/auth/user/register', registerData)
            console.log('Registration successful!', response.data)
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                confirmPassword: '',
                phone_number: '',
                date_of_birth: '',
                address: ''
            });
            
            setMessage(`Registration successful! You can login now.`)
            setIsLogin(true)
        } catch (error) {
            console.error('Registration failed', error.response?.data || error.message)
            const err = error.response.data.log;
            // console.log(error);
            setMessage(`Registration failed.${err}`)
        } finally {
            setIsLoading(false)
        }
    }

    const handleRegisterChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const toggleMode = () => {
        setIsLogin(!isLogin)
        setMessage('')
        setEmail('')
        setPassword('')
        setFormData({
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone_number: '',
            date_of_birth: '',
            address: ''
        })
    }

    const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword
    const passwordsDoNotMatch = formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword

    return(
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
                                        {isLogin ? 'Welcome' : 'Join Us'}
                                    </span>
                                    <br />
                                    <span className="text-white drop-shadow-lg">
                                        {isLogin ? 'Back' : 'Today'}
                                    </span>
                                </h1>
                                <p className="text-xl lg:text-2xl text-cyan-100 leading-relaxed drop-shadow-lg">
                                    {isLogin 
                                        ? 'Continue your extraordinary journey with NimbusFly'
                                        : 'Start your adventure with the world\'s most trusted platform'
                                    }
                                </p>
                                
                               
                            </div>
                        </div>

                        
                        <div className="flex justify-center lg:justify-end">
                            <div className="w-full max-w-md">
                                
                                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
                                    
                                    <div className="flex justify-center mb-8">
                                        <div className="relative bg-white/10 p-1 rounded-full border border-white/20">
                                            <div className={`absolute top-1 bottom-1 w-1/2 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full transition-all duration-300 ${isLogin ? 'left-1' : 'left-1/2'}`}></div>
                                            <button
                                                onClick={() => isLogin ? null : toggleMode()}
                                                className={`relative z-10 px-6 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${isLogin ? 'text-white' : 'text-white/60 hover:text-white/80'}`}
                                            >
                                                Sign In
                                            </button>
                                            <button
                                                onClick={() => !isLogin ? null : toggleMode()}
                                                className={`relative z-10 px-6 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${!isLogin ? 'text-white' : 'text-white/60 hover:text-white/80'}`}
                                            >
                                                Sign Up
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-center mb-8">
                                        <h2 className="text-3xl font-bold text-white mb-2">
                                            {isLogin ? 'Sign In' : 'Create Account'}
                                        </h2>
                                        <p className="text-cyan-100">
                                            {isLogin ? 'Access your account' : 'Join thousands of happy travelers'}
                                        </p>
                                    </div>

                                    {isLogin ? (
                                        <form onSubmit={handleLogin} className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-cyan-100">Email Address</label>
                                                <div className="relative">
                                                    <input 
                                                        type="email" 
                                                        placeholder="Enter your email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        required
                                                        className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:bg-white/10 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 backdrop-blur-sm"
                                                    />
                                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-teal-400/0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-cyan-100">Password</label>
                                                <div className="relative">
                                                    <input 
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="Enter your password"
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
                                                            <span>Sign In</span>
                                                            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                            </svg>
                                                        </>
                                                    )}
                                                </div>
                                            </button>
                                        </form>
                                    ) : (
                                        /* Register Form */
                                        <form onSubmit={handleRegister} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-cyan-100">First Name</label>
                                                    <input 
                                                        type="text"
                                                        name="first_name"
                                                        placeholder="First Name"
                                                        value={formData.first_name}
                                                        onChange={handleRegisterChange}
                                                        required
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:bg-white/10 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 backdrop-blur-sm"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-cyan-100">Last Name</label>
                                                    <input 
                                                        type="text"
                                                        name="last_name"
                                                        placeholder="Last Name"
                                                        value={formData.last_name}
                                                        onChange={handleRegisterChange}
                                                        required
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:bg-white/10 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 backdrop-blur-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-cyan-100">Email Address</label>
                                                <input 
                                                    type="email"
                                                    name="email"
                                                    placeholder="Enter your email"
                                                    value={formData.email}
                                                    onChange={handleRegisterChange}
                                                    required
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:bg-white/10 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 backdrop-blur-sm"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-cyan-100">Password</label>
                                                <div className="relative">
                                                    <input 
                                                        type={showPassword ? "text" : "password"}
                                                        name="password"
                                                        placeholder="Create a password"
                                                        value={formData.password}
                                                        onChange={handleRegisterChange}
                                                        required
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:bg-white/10 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 backdrop-blur-sm pr-12"
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
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-cyan-100">Confirm Password</label>
                                                <div className="relative">
                                                    <input 
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        name="confirmPassword"
                                                        placeholder="Confirm your password"
                                                        value={formData.confirmPassword}
                                                        onChange={handleRegisterChange}
                                                        required
                                                        className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/50 focus:bg-white/10 focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-sm pr-12 ${
                                                            passwordsDoNotMatch 
                                                                ? 'border-red-400 focus:border-red-400 focus:ring-red-400/50' 
                                                                : passwordsMatch 
                                                                ? 'border-green-400 focus:border-green-400 focus:ring-green-400/50'
                                                                : 'border-white/20 focus:border-cyan-400 focus:ring-cyan-400/50'
                                                        }`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-200"
                                                    >
                                                        {showConfirmPassword ? (
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
                                                </div>
                                                
                                                {formData.confirmPassword && (
                                                    <div className={`text-sm mt-1 ${passwordsMatch ? 'text-green-400' : 'text-red-400'}`}>
                                                        {passwordsMatch ? (
                                                            <div className="flex items-center">
                                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                Passwords match
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center">
                                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                                Passwords do not match
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-cyan-100">Phone Number</label>
                                                <input 
                                                    type="tel"
                                                    name="phone_number"
                                                    placeholder="Phone Number"
                                                    value={formData.phone_number}
                                                    onChange={handleRegisterChange}
                                                    required
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:bg-white/10 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 backdrop-blur-sm"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-cyan-100">Date of Birth</label>
                                                    <input 
                                                        type="date"
                                                        name="date_of_birth"
                                                        value={formData.date_of_birth}
                                                        onChange={handleRegisterChange}
                                                        required
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:bg-white/10 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 backdrop-blur-sm"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-cyan-100">Address</label>
                                                    <input 
                                                        type="text"
                                                        name="address"
                                                        placeholder="Address"
                                                        value={formData.address}
                                                        onChange={handleRegisterChange}
                                                        required
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:bg-white/10 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 backdrop-blur-sm"
                                                    />
                                                </div>
                                            </div>

                                            <button 
                                                type="submit"
                                                disabled={isLoading || passwordsDoNotMatch}
                                                className="w-full relative overflow-hidden bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/25 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                <div className="relative z-10 flex items-center justify-center">
                                                    {isLoading ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                                            <span>Creating Account...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span>Create Account</span>
                                                            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                            </svg>
                                                        </>
                                                    )}
                                                </div>
                                            </button>
                                        </form>
                                    )}

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
    )
}

export default LoginForm