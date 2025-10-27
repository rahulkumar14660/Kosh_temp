import ErrorHandler from "../middlewares/error.middleware.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { sendVerificationCode } from "../utils/sendVerificationCode.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { sendToken } from "../utils/sendToken.js";
import { checkInvalidOrExpiredOTP } from "../utils/checkInvalidorExpiredOTP.js";
import { verifyandProcessOTP } from "../utils/verifyandProcessOTP.js";
import { logAction } from "../utils/logAction.js";
export const handleUserRegister = catchAsyncErrors(async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return next(new ErrorHandler("Email, password and name required"));
    const user = await User.findOne({
      email,
      accountVerified: true,
    });
    if (user) {
      return next(new ErrorHandler("User already exists", 400));
    }
    const sentVerificationCodeUser = await User.findOne({
      email,
      accountVerified: false,
    });
    if (sentVerificationCodeUser) {
      return next(new ErrorHandler("Verification Code already sent", 400));
    }
    if (password.length < 8 || password.length >= 20) {
      return next(new ErrorHandler("Password is not of appropriate length", 400));
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
    });
    const verificationCode = await newUser.generateVerificationCode();
    await newUser.save();
    const sub = "Thank you for registering. Please use the following OTP to verify your email address. This code is valid for the next 15 minutes.";
    await sendVerificationCode(verificationCode, email, sub, next);
    res.status(200).json({
      message: "Verification code sent on email.",
    });
  } catch (err) {
    next(err);
  }
});
export const verifyOTP = catchAsyncErrors(async (req, res, next) => {
  const { email, otp } = req.body;
  try {
    const user = await verifyandProcessOTP(email, otp, next, true);
    sendToken(user, 200, "User verified successfully", res);
  } catch (err) {
    return next(err);
  }
});
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("All fields are required", 400));
  }
  const user = await User.findOne({
    email,
  }).select("+password");
  if (!user) return next(new ErrorHandler("Invalid email or password", 400));
  if (user.status === "Suspended" || user.status === "Resigned" || user.status === "Terminated") {
    return next(new ErrorHandler("Your account is currently inactive. Please contact your system administrator for assistance.", 401));
  }
  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) return next(new ErrorHandler("Invalid password", 400));
  user.accountVerified = true;
  await user.save();  
  await logAction({
    action: 'User Logged In',
    performedBy: user._id, 
    target: user._id,
    targetModel: 'User',
    details: {
      loggedInByName: user.name,
      loggedInByEmail: user.email
    }
  });
  sendToken(user, 200, "User login successfully", res);
});
export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    await logAction({
      action: 'User Logged Out',
      performedBy: req.user._id, 
      target: req.user._id,
      targetModel: 'User',
      details: {
        loggedOutByName: req.user.name,
        loggedOutByEmail: req.user.email
      }
    })
    .json({
      success: true,
      message: "Logged out successfully",
    });
});
export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    user,
  });
});
export const sendPasswordChangeOTP = catchAsyncErrors(async (req, res, next) => {
  const { email, currentPassword } = req.body;
  try {
    const user = await User.findOne({
      email,
      accountVerified: true,
    }).select("+password");
    if (!user) {
      return next(new ErrorHandler("User is not authenticated", 400));
    }
    const currentPass = await bcrypt.compare(currentPassword, user.password);
    if (!currentPass) {
      return next(new ErrorHandler("The entered password is incorrect", 400));
    }
    if (user.verificationCode && user.verificationCodeExpired > Date.now()) {
      return next(new ErrorHandler("Otp already sent to email", 400));
    }
    const verificationCode = await user.generateVerificationCode();
    await user.save();
    const sub = "Please use the following OTP to change your password. This code is valid for the next 15 minutes.";
    const message = await sendVerificationCode(verificationCode, email, sub, next);
    res.status(200).json({
      success: true,
      message: "OTP sent to email",
    });
  } catch (err) {
    next(err);
  }
});
export const verifyPasswordChangeOTP = catchAsyncErrors(async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;
    const user = await verifyandProcessOTP(email, otp, next, false);
    if (!user) {
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();
    await logAction({
      action: 'User Password Changed',
      performedBy: user._id, 
      target: user._id,
      targetModel: 'User',
      details: {
        changedByName: user.name,
        changedByEmail: user.email
      }
    });
    return res.status(200).json({
      status: "success",
      message: "password changed successfully",
    });
  } catch (err) {
    return next(err);
  }
});

export const requestPasswordReset = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return next(new ErrorHandler("Email is required", 400));
  }
  
  const user = await User.findOne({ email, accountVerified: true });
  
  if (!user) {
    return res.status(200).json({
      success: true,
      message: "If an account exists with this email, a password reset OTP has been sent."
    });
  }
  
  if (user.verificationCode && user.verificationCodeExpired > Date.now()) {
    return next(new ErrorHandler("An OTP has already been sent. Please check your email.", 400));
  }
  const verificationCode = await user.generateVerificationCode();
  await user.save();
  const subject = "Password Reset Request - OTP Verification";
  await sendVerificationCode(verificationCode, email, subject, next);
  await logAction({
    action: 'User Password Reset Requested',
    performedBy: user._id, 
    target: user._id,
    targetModel: 'User',
    details: {
      requestedByName: user.name,
      requestedByEmail: user.email
    }
  });
  res.status(200).json({
    success: true,
    message: "If an account exists with this email, a password reset OTP has been sent."
  });
});