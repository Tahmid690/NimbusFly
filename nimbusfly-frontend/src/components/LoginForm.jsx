import { useState } from "react";
import { Link } from 'react-router-dom'
import axios from 'axios'

function LoginForm(){
    const [email,setEmail] = useState('')
    const [password,setPassword] = useState('')
    const [message, setMessage] = useState('')

    const handleLogin = async () => {
        
        try{
            const response = await axios.post('http://localhost:3000/auth/user/login',{
                email: email,
                password: password
            })

            console.log('Login successful!', response.data)
            setMessage('Login successful!')
        }
        catch(error){
            console.log('Login failed',error.response.data);
            setMessage('Check Credentials')
        }
    }

    return(
        <div>
        <h1>NimbusFly Airlines</h1>
        <p>Welcome to our airline management system!</p>
        <h2>Login</h2>
        <form>
            <div>
            <input 
                type="email" 
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            </div>
            <div>
            <input 
                type="password" 
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            </div>
            <button 
                type="button"
                onClick={handleLogin}
                >Login</button>
        </form>

        {message && <p style={{color: message.includes('successful') ? 'green' : 'red'}}>{message}</p>}
     

        <p>Email: {email}</p>
        <p>Password: {password}</p>

        <p>Don't have an account? <Link to="/register">Register here</Link></p>
        </div>
    )
}

export default LoginForm