import { User } from "../models/user.model.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./error.middleware.js";
import jwt from "jsonwebtoken";
export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("User is not authenticated", 401));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new ErrorHandler("User is not authenticated", 400));
  }
  if (user.status === "Suspended" || user.status === "Resigned" || user.status === "Terminated") {
    res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .json({
      success: true,
      message: "Your account is currently inactive. Please contact your system administrator for assistance.",
    });
  }
  req.user = user;
  next();
});
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorHandler("Not authorized", 403));
    }
    next();
  };
};
