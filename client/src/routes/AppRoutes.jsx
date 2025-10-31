import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/user/Dashboard";
import HomePage from "../pages/user/HomePage";
import VerifyOTP from "../pages/auth/VerifyOTP";
import ProtectedRoute from "./ProtectedRoute";
import Books from "../pages/user/Books";
import Catalog from "../pages/user/Catalog";
import Users from "../pages/user/Users";
import AddNewAdmin from "../pages/user/AddNewAdmin";
import Profile from "../pages/user/Profile";
import ChangePassword from "../pages/user/ChangePassword";
import LandingPage from "../pages/user/LandingPage";
import AssetList from "../pages/Assets/AssetList";
import Assignments from "../pages/Assets/Assignments";
import RepairLog from "../pages/Assets/RepairLog";
import UserProfile from "../pages/user/UserProfile";
import AssetHome from "../pages/Assets/AssetHome";
import MyAssets from "../pages/user/MyAssets";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";  
import Loader from "../components/common/Loader";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Routes, Route } from "react-router-dom";
import NotFound from "../pages/user/NotFound";
import EmployeeOnboarding from "../pages/Employees/EmployeeOnboarding";
import EmployeesList from "../pages/Employees/EmployeesList";
import EmployeeDetail from "../pages/Employees/EmployeeDetail";
import EditProfile from "../pages/user/EditProfile";
import AuditLog from "../pages/Logss/AuditLog";
const AppRoutes = () => {
  const { user, isAdmin, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="full-page-loader">
        <Loader />
      </div>
    );
  }

  return (
    <Routes>
      <Route path='/' element={<LandingPage />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/register/verify' element={<VerifyOTP />} />
      <Route path='/forgot-password' element={<ForgotPassword />} />
      <Route path='/reset-password' element={<ResetPassword />} />

      <Route path='/home' element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path='/books' element={<ProtectedRoute><Books /></ProtectedRoute>} />
      <Route path='/catalog' element={<ProtectedRoute><Catalog /></ProtectedRoute>} />
      <Route path='/users' element={<ProtectedRoute><Users /></ProtectedRoute>} />
      <Route path='/user/:id' element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
      <Route path='/add-new-admin' element={<ProtectedRoute><AddNewAdmin /></ProtectedRoute>} />
      <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path='/change-password' element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
      <Route path='/my-assets' element={<ProtectedRoute><MyAssets /></ProtectedRoute>} />

      {isAdmin(user, ["Admin"]) && (
        <>
          <Route path='/assets/home' element={<ProtectedRoute><AssetHome /></ProtectedRoute>} />
          <Route path='/assets/list' element={<ProtectedRoute><AssetList /></ProtectedRoute>} />
          <Route path='/assets/assignments' element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
          <Route path='/assets/repairs' element={<ProtectedRoute><RepairLog /></ProtectedRoute>} />
          <Route path='/assets/users' element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/assets/repair-log" element={<ProtectedRoute><RepairLog /></ProtectedRoute>} />
          <Route path="/employees" element={<ProtectedRoute><EmployeesList /></ProtectedRoute>} />
          <Route path="/employees/onboard" element={<ProtectedRoute><EmployeeOnboarding /></ProtectedRoute>} />
          <Route path="/employees/:id" element={<ProtectedRoute><EmployeeDetail /></ProtectedRoute>} />
          <Route path="/employees/edit/:id" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          
        </>
      )}
      {isAdmin(user, ["Asset Manager"]) && (
        <>
          <Route path='/assets/home' element={<ProtectedRoute><AssetHome /></ProtectedRoute>} />
          <Route path='/assets/list' element={<ProtectedRoute><AssetList /></ProtectedRoute>} />
          <Route path='/assets/assignments' element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
          <Route path='/assets/repairs' element={<ProtectedRoute><RepairLog /></ProtectedRoute>} />
          <Route path='/assets/users' element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/assets/repair-log" element={<ProtectedRoute><RepairLog /></ProtectedRoute>} />
         
          
        </>
      )}
      {isAdmin(user, ["HR"]) && (
        <>
          <Route path="/employees" element={<ProtectedRoute><EmployeesList /></ProtectedRoute>} />
          <Route path="/employees/onboard" element={<ProtectedRoute><EmployeeOnboarding /></ProtectedRoute>} />
          <Route path="/employees/:id" element={<ProtectedRoute><EmployeeDetail /></ProtectedRoute>} />
          <Route path="/employees/edit/:id" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        </>
      )}
      {isAdmin(user, ["Admin"]) && (
        <Route path="/logs" element={<ProtectedRoute><AuditLog /></ProtectedRoute>} />
      )}
      <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
    </Routes>
  );
};

export default AppRoutes;
