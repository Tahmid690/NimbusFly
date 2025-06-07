import axios from "axios";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function AirlineLogin() {
  const navigate = useNavigate();

  const [formdata, setdata] = useState({
    email: "",
    password: "",
  });

  const [message, setmessage] = useState("");

  const hanndlesubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3000/admin/login",
        formdata
      );
      console.log("Login successful!", response.data);
      localStorage.setItem("token", response.data.jwt_token);
      localStorage.setItem("admin_name", response.data.user.airline_name);
      localStorage.setItem("admin_id", response.data.user.admin_id);

      setmessage("Login successful");
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Error:", err.response.data);
      setmessage(err.response?.data?.log || "Login failed.");
    }
  };

  const handlechange = (event) => {
    const { name, value } = event.target;
    setdata((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const reset = () => {
    setdata({
      email: "",
      password: "",
    });
    setmessage("");
  };

  return (
    <div>
      <h1>Welcome to our airline management system!</h1>
      <h2>Log In to your Airline</h2>

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

        <button type="submit">Login</button>
        <button type="button" onClick={reset}>
          Reset
        </button>
      </form>

      {message && (
        <p style={{ color: message.includes("successful") ? "green" : "red" }}>
          {message}
        </p>
      )}

      <p>
        Don't have an account? <Link to="/admin/register">Register here</Link>
      </p>
    </div>
  );
}

export default AirlineLogin;
