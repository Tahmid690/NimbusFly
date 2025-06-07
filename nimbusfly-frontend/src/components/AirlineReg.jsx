import axios from "axios";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function AirlineReg() {
  const navigate = useNavigate(); 

  const [formdata, setdata] = useState({
    email: '',
    password: '',
    airline_id: '',
    airline_name: ''
  });

  const [message, setmessage] = useState('');

  const hanndlesubmit = async (event) => {
    event.preventDefault(); 
    try {
      const response = await axios.post('http://localhost:3000/admin/register', formdata);
      console.log("Submission successful!", response.data);
      setmessage("Submission successful. Your application has been received. We’ll verify your details and contact you via email for further confirmation.");
      navigate('/admin/login');
    } catch (err) {
      console.error("Error:", err);
      setmessage("Submission failed");
    }
  };

  const handlechange = (event) => {
    const { name, value } = event.target;
    setdata(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const reset = () => {
    setdata({
      email: '',
      password: '',
      airline_id: '',
      airline_name: ''
    });
    setmessage('');
  };

  return (
    <div>
      <h1>Welcome to our airline management system!</h1>
      <h2>Apply For Airline</h2>

      <form onSubmit={hanndlesubmit}>
        <div>
          <label>Email</label>
          <input
            name="email"
            type="email"
            placeholder="Enter email"
            value={formdata.email}
            onChange={handlechange}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            name="password"
            type="password"
            placeholder="Enter password"
            value={formdata.password}
            onChange={handlechange}
            required
          />
        </div>
        <div>
          <label>Airline ID</label>
          <input
            name="airline_id"
            type="number"
            placeholder="Enter airline ID"
            value={formdata.airline_id}
            onChange={handlechange}
            required
          />
        </div>
        <div>
          <label>Airline Name</label>
          <input
            name="airline_name"
            type="text"
            placeholder="Enter airline name"
            value={formdata.airline_name}
            onChange={handlechange}
            required
          />
        </div>

        <button type="submit">Apply</button>
        <button type="button" onClick={reset}>Reset</button>
      </form>

      {message && (
        <p style={{ color: message.includes('successful') ? 'green' : 'red' }}>
          {message}
        </p>
      )}

      <p>Already have an account? <Link to="/admin/login">Login here</Link></p>
    </div>
  );
}

export default AirlineReg;