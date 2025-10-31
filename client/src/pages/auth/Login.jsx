import { useContext, useState } from "react";
import "./Login.css";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { UserContext } from "../../context/UserContext";
import KoshLogo from "./KoshLogo";
const Login = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { setRefreshAuthContext } = useContext(AuthContext);
  const { setUserContextUpdated } = useContext(UserContext);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const handleInputChange = (e) => {
    setError("");
    const { name, value } = e.target;
    setLoginData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleShowPassword = (e) => {
    e.preventDefault();
    setShowPassword((prev) => !prev);
  };
  const handleLogin = (e) => {
    e.preventDefault();
    setIsWaiting(true);
    axios
      .post(`${apiUrl}/api/v1/auth/login`, loginData, {
        withCredentials: true,
      })
      .then((response) => {
        setIsWaiting(false);
        setRefreshAuthContext((prev) => !prev);
        setError(null);
        setLoginData({
          email: "",
          password: "",
        });
        setUserContextUpdated((prev) => !prev);
        navigate("/home");
      })
      .catch((err) => {
        setIsWaiting(false);
        console.log(err.response.data.message);
        setError(err.response.data.message);
      });
  };
  return (
    <div className="auth-container">
      <div className="auth-left">
        <h1 className="branding-logo"><KoshLogo /></h1>
        <p className="branding-tagline">Empowering Enterprises <br /> with <span className="branding-tagline-span">Unified Resource Control.</span></p>
      </div>
      <div className="auth-right">
        <div className="login-static-container">
          <div className="login-heading">Login</div>
          <p className="login-message">Please provide your info to Login</p>
        </div>
        <form className="login-form" onSubmit={handleLogin}>
          <input type="email" required autoFocus name="email" id="email" className="form-input" placeholder="Email" value={loginData.email} onChange={handleInputChange} />
          <div className="password-wrapper">
            <input
              type={!showPassword ? "password" : "text"}
              required
              name="password"
              id="password"
              className="form-input"
              placeholder="Password"
              value={loginData.password}
              onChange={handleInputChange}
            />
            <button type="button" className="toggle-password" onClick={handleShowPassword}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {error && <p className="error">{error}</p>}
          <div className="forgot-password-link">
            <NavLink to="/forgot-password">Forgot Password?</NavLink>
          </div>
          <button type="submit" className={`form-button ${isWaiting && "wait"}`}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};
export default Login;