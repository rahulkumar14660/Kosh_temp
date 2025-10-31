import { useContext, useState } from "react";
import "./Register.css";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import { AuthContext } from "../../context/AuthContext";
import KoshLogo from "./KoshLogo";
const Register = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const {registerData, setRegisterData} = useContext(AuthContext);
  const [isWaiting, setIsWaiting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleRegister = (e) => {
    e.preventDefault();
    setIsWaiting(true);
    setError("");
    axios
      .post(`${apiUrl}/api/v1/auth/getRegistrationOTP`, registerData, {
        withCredentials: true,
      })
      .then((res) => {
        setIsWaiting(false);
        setError("");
        navigate("/register/verify");
      })
      .catch((err) => {
        setIsWaiting(false);
        console.log(err.response?.data?.message || "Registration error");
        setError(err.response?.data?.message || "Registration error");
        if (err.response?.data?.message === "Verification Code already sent") {
          navigate("/register/verify");
        }
      });
  };
  const handleShowPassword = (e) => {
    e.preventDefault();
    setShowPassword((prev) => !prev);
  };
  return (
    <div className="register-container">
      <div className="register-left">
        <div className="register-static-container">
          <div className="register-heading">Register</div>
          <p className="register-message">Create your account below</p>
        </div>
        <form className="register-form" onSubmit={handleRegister}>
          <input type="email" autoFocus name="email" className="register-input" placeholder="Email" required value={registerData.email} onChange={handleInputChange} />
          <input type="text" name="name" className="register-input" placeholder="Name" required value={registerData.name} onChange={handleInputChange} />
          <div className="register-password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="register-input"
              placeholder="Password"
              required
              value={registerData.password}
              onChange={handleInputChange}
            />
            <button className="register-toggle-password" type="button" onClick={handleShowPassword}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className={`register-button ${isWaiting && "wait"}`}>
            Get OTP
          </button>
        </form>
      </div>
      <div className="register-right">
      <h1 className="branding-logo"><KoshLogo /></h1>
        <p className="register-tagline">Already have an account?</p>
        <NavLink className="register-navlink" to="/login">
          Login
        </NavLink>
      </div>
    </div>
  );
};
export default Register;
