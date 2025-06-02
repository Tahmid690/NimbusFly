import { useState } from "react";
import { Link } from 'react-router-dom'
import axios from 'axios';

function RegisterForm() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_number: '',
    date_of_birth: '',
    address: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://localhost:3000/auth/user/register', formData);
      console.log('Registration successful!', response.data);
      setMessage('Registration successful! Please check your email to verify.');
    } catch (error) {
      console.error('Registration failed', error.response?.data || error.message);
      setMessage('Registration failed. Please check the form or try again later.');
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form>
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleChange}
        /><br/>

        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={handleChange}
        /><br/>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        /><br/>

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        /><br/>

        <input
          type="tel"
          name="phone_number"
          placeholder="Phone Number"
          value={formData.phone_number}
          onChange={handleChange}
        /><br/>

        <input
          type="date"
          name="date_of_birth"
          value={formData.date_of_birth}
          onChange={handleChange}
        /><br/>

        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
        /><br/>

        <button
          type="button"
          onClick={handleRegister}
        >
          Register
        </button>
      </form>

      {message && <p style={{ color: message.includes('successful') ? 'green' : 'red' }}>{message}</p>}
       <p>Already have an account? <Link to="/login">Login here</Link></p>
    </div>
  );
}

export default RegisterForm;
