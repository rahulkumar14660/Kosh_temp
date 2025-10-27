import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.middleware.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from 'crypto';
import { promisify } from 'util';
import { createReadStream } from 'fs';
import { pipeline } from 'stream';
import { Borrow } from "../models/borrow.model.js";
import { Asset } from "../models/asset.model.js";
import { logAction } from "../utils/logAction.js";
import { assignAsset } from "../utils/assignAsset.js";
const streamPipeline = promisify(pipeline);

export const getAllUsers = catchAsyncErrors(async (req, res, next) => {
  if (req.user.role !== "Admin" && req.user.role !== "HR") {
    const users = await User.find({ accountVerified: true, role: "Employee" });
    return res.status(200).json({
      success: true,
      users,
    });
  }
  const users = await User.find({ accountVerified: true });
  res.status(200).json({
    success: true,
    users,
  });
});


export const registerNewAdmin = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Admin avatar is required", 400));
  }
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return next(new ErrorHandler("User already registered", 400));
  }
  const isRegistered = await User.findOne({ email, accountVerified: true });
  if (isRegistered) {
    return next(new ErrorHandler("User is already registerd", 400));
  }
  if (password.length < 8 || password.length > 16) {
    return next(new ErrorHandler("Password must be between 8 to 16 characters", 400));
  }
  const { avatar } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp", "image/jpg"];
  if (!allowedFormats.includes(avatar.mimetype)) {
    return next(new ErrorHandler("File format not supported", 400));
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const cloudinaryResponse = await cloudinary.uploader.upload(avatar.tempFilePath, {
    folder: "LIBRARY_MANAGEMENT_SYSTEM_ADMIN_AVATARS",
  });
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error("Cloudinary error : ", cloudinaryResponse.error || "Unknown Cloudinary Error");
    return next(new ErrorHandler("Failed to upload avatar image to cloudinary", 500));
  }
  const admin = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "Admin",
    accountVerified: true,
    avatar: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });
  res.status(201).json({
    success: true,
    message: "Admin registered successfully",
    admin,
  });
});

export const getUserById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  res.status(200).json({
    success: true,
    user,
  });
});

export const registerNewEmployee = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, address } = req.body;

  if (!firstName || !lastName || !email) {
    return next(new ErrorHandler("Fill all the fields", 400));
  }

  const name = `${firstName} ${lastName}`;
  const password = crypto.randomBytes(8).toString("hex");

  const isRegistered = await User.findOne({ email, accountVerified: true });
  if (isRegistered) {
    return next(new ErrorHandler("User is already registered", 400));
  }

  if (password.length < 8 || password.length > 16) {
    return next(new ErrorHandler("Password must be between 8 to 16 characters", 400));
  }

  if (!req.file || !req.file.path || !req.file.filename) {
    return next(new ErrorHandler("Avatar upload failed", 400));
  }

  const avatarData = {
    public_id: req.file.filename, // or extract from path if needed
    url: req.file.path,
  };

  const hashedPassword = await bcrypt.hash(password, 10);

  const {
    phone,
    dateOfBirth,
    gender,
    employmentType,
    joiningDate,
    department,
    designation,
    manager,
    team,
    salary,
    workLocation,
    city,
    state,
    country,
    postalCode,

  } = req.body;

  const employee = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "Employee",
    accountVerified: false,
    avatar: avatarData,
    address: {
      street: address,
      city,
      state,
      country,
      postalCode,
    },
    phone,
    dateOfBirth,
    gender,
    employmentType,
    joiningDate,
    department,
    designation,
    manager,
    team,
    salary,
    workLocation,
  });

  const token = crypto.randomBytes(32).toString("hex");
  employee.emailVerificationToken = token;
  await employee.save();
  const url = `${req.protocol}://${req.get("host")}/api/v1/user/verify-email/${token}`;

  await sendEmail({
    email: employee.email,
    subject: "Verify your email",
    message: `Please click on this link to verify your email: ${url}\n\nAfter verification, login using:\n\nEmail: ${employee.email}\nPassword: ${password}\n\nPlease change your password after logging in.`,
  });
  await logAction({
    action: 'Employee Registered',
    performedBy: req.user._id, 
    target: employee._id,
    targetModel: 'User',
    details: {
      registeredByName: req.user.name,
      registeredByEmail: req.user.email
    }
  });
  return res.status(201).json({
    success: true,
    message: "Employee registered successfully",
    employee,
  });
});

export const verifyEmail = catchAsyncErrors(async (req, res, next) => {
  const token = req.params.token;
  const user = await User.findOne({ emailVerificationToken: token });
  if (!user) {
    return next(new ErrorHandler("Invalid token", 400));
  }
  user.accountVerified = true;
  user.emailVerificationToken = null;
  await user.save();
  await logAction({
    action: 'Email Verified',
    performedBy: user._id, 
    target: user._id,
    targetModel: 'User',
    details: {
      verifiedByName: user.name,
      verifiedByEmail: user.email
    }
  });
  res.status(200).json({
    success: true,
    message: "Email verified successfully",
  });
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  const token = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = token;
  await user.save();
  const url = `${req.protocol}://${req.get("host")}/api/v1/reset-password/${token}`;
  await sendEmail({
    email: user.email,
    subject: "Reset your password",
    message: `Please click on this link to reset your password: ${url}`,
  });
  res.status(200).json({
    success: true,
    message: "Password reset link sent successfully",
  });
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const token = req.params.token;
  const { password } = req.body;
  const user = await User.findOne({ passwordResetToken: token });
  if (!user) {
    return next(new ErrorHandler("Invalid token", 400));
  }
  user.password = await bcrypt.hash(password, 10);
  user.passwordResetToken = null;
  await user.save();
  await logAction({
    action: 'Password Reset',
    performedBy: user._id, 
    target: user._id,
    targetModel: 'User',
    details: {
      resetByName: user.name,
      resetByEmail: user.email
    }
  });
  res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
});


export const getEmployeeById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const employee = await User.findById(id)
    .select('-password -verificationCode -verificationCodeExpired -resetPasswordToken -resetPasswordExpired -__v');

  if (!employee) {
    return next(new ErrorHandler('Employee not found', 404));
  }

  res.status(200).json({
    success: true,
    data: employee
  });
});

export const getAllEmployees = catchAsyncErrors(async (req, res, next) => {
  try {
    let employees = [];
    if (req.user.role !== 'Admin') {
      employees = await User.find(
        { role: { $ne: 'Admin' } },
        '-password -verificationCode -verificationCodeExpired -resetPasswordToken -resetPasswordExpired -__v'
      ).sort({ createdAt: -1 });
    }
    else{
      employees = await User.find(
        {},
        '-password -verificationCode -verificationCodeExpired -resetPasswordToken -resetPasswordExpired -__v'
      ).sort({ createdAt: -1 });
    }
    res.status(200).json({
      success: true,
      message: 'Employees fetched successfully',
      data: employees
    });
  } catch (error) {
    console.error('Error in getAllEmployees:', error);
    next(new ErrorHandler('Error fetching employees', 500));
  }
});

export const updateEmployee = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  const expandedUpdates = updates;
  const restrictedFields = ['password', 'email', 'status', 'employeeId'];
  for (let field of restrictedFields) {
    delete expandedUpdates[field];
  }
  if (expandedUpdates.employmentType) {
    expandedUpdates.employmentType = expandedUpdates.employmentType;
  }
  if (expandedUpdates.joiningDate) {
    expandedUpdates.joiningDate = new Date(expandedUpdates.joiningDate);
  }
  if (expandedUpdates.dateOfBirth) {
    expandedUpdates.dateOfBirth = new Date(expandedUpdates.dateOfBirth);
  }
  if (expandedUpdates.gender) {
    expandedUpdates.gender = expandedUpdates.gender;
  }
  if(expandedUpdates.role){
    expandedUpdates.role = expandedUpdates.role;
  }

  if (req.file) {
    const avatar = req.file;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp", "image/jpg"];

    if (!allowedFormats.includes(avatar.mimetype)) {
      return next(new ErrorHandler("File format not supported", 400));
    }

    const employee = await User.findById(id);

    const avatarData = {
      public_id: avatar.filename,
      url: avatar.path,
    };
    expandedUpdates.avatar = avatarData;
  }
  Object.keys(expandedUpdates).forEach((key) => {
    if (expandedUpdates[key] === '') {
      delete expandedUpdates[key];
    }
  });

  const updatedEmployee = await User.findByIdAndUpdate(
    id,
    { $set: expandedUpdates, $currentDate: { updatedAt: true } },
    { new: true, runValidators: true }
  );

  if (!updatedEmployee) {
    return next(new ErrorHandler("Employee not found", 404));
  }
  await logAction({
    action: 'Employee Updated',
    performedBy: req.user._id, 
    target: updatedEmployee._id,
    targetModel: 'User',
    details: {
      updatedByName: req.user.name,
      updatedByEmail: req.user.email
    }
  });
  return res.status(200).json({
    success: true,
    data: updatedEmployee,
    message: `${updatedEmployee.name}'s details updated successfully`,
  });
});



export const onboardEmployee = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) return next(new ErrorHandler("User not found", 404));
  if (user.status !== "Onboarding") {
    return next(new ErrorHandler(`${user.name} has already been onboarded`, 400));
  }
  if(user?.accountVerified === false){
    return next(new ErrorHandler(`${user.name} is not verified`, 400));
  }

  const department = user.department;
  const requiredAssets = {
    IT: ["Laptop", "Monitor", "Access Card", "Headset", "Docking Station"],
    HR: ["Laptop", "ID Card", "Access Card", "Headset"],
    Finance: ["Laptop", "Secure USB", "Access Card", "ID Card"],
    Security: ["Access Card", "Walkie-Talkie", "Security Uniform", "ID Card"],
    Admin: ["Laptop", "Access Card", "Stationery Kit", "ID Card"],
    Sales: ["Laptop", "Mobile Phone", "Access Card", "Headset"],
    Marketing: ["Laptop", "Tablet", "Camera", "Access Card", "ID Card"],
    Engineering: ["Laptop", "Monitor", "Access Card", "Development Board", "Headset"],
    Operations: ["Laptop", "Access Card", "Printer Access", "ID Card"],
    Legal: ["Laptop", "Secure USB", "ID Card", "Access Card"],
    CustomerSupport: ["Laptop", "Headset", "Access Card", "ID Card"],
    Facilities: ["Walkie-Talkie", "Tool Kit", "Access Card", "Safety Gear"],
    Logistics: ["Access Card", "Barcode Scanner", "Mobile Phone", "ID Card"],
    Procurement: ["Laptop", "Access Card", "Stationery Kit", "ID Card"]
  };

  const assets = requiredAssets[department];
  const failedAssignments = [];

  for (const category of assets) {
    const asset = await Asset.findOne({ assetCategory: category, status: "Available" });
    if (!asset) {
      failedAssignments.push(category); 
      continue;
    }
    try {
      await assignAsset({ email: user.email, sno: asset.serialNumber, assignedBy: req.user._id });
    } catch (err) {
      failedAssignments.push(category);
    }
  }

  user.status = "Active";
  await user.save();

  await logAction({
    action: 'Employee Onboarded',
    performedBy: req.user._id,
    target: user._id,
    targetModel: 'User',
    details: {
      onboardedByName: req.user.name,
      onboardedByEmail: req.user.email,
    },
  });

  return res.status(201).json({
    success: true,
    message: failedAssignments.length
      ? `Employee onboarded, but some assets could not be assigned: ${failedAssignments.join(", ")}`
      : "Employee onboarded successfully",
    user,
  });
});


export const updateEmployeeStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status, exitReason, lastWorkingDay } = req.body;
  const validStatuses = ["Active", "On Leave", "Suspended", "Resigned", "Terminated"];
  if (!validStatuses.includes(status)) {
    return next(new ErrorHandler("Invalid status", 400));
  }

  const updateData = { status };
  if (["Resigned", "Terminated"].includes(status)) {
    if (!lastWorkingDay) {
      lastWorkingDay = new Date();
    }
    updateData.lastWorkingDay = lastWorkingDay;
    updateData.exitReason = exitReason || status;
    updateData.accountVerified = false;
    updateData.verificationCode = null;
    updateData.verificationCodeExpired = null;
  }
  if (status === "Suspended") {
    updateData.accountVerified = false;
  }
  if (status === "Active") {
    updateData.accountVerified = true;
  }
  const updatedEmployee = await User.findByIdAndUpdate(
    id,
    { $set: updateData, $currentDate: { updatedAt: true } },
    { new: true, runValidators: true }
  );

  if(updatedEmployee.status === "Active"){
    updatedEmployee.lastWorkingDay = null;
    updatedEmployee.exitReason = null;
  }
  await updatedEmployee.save();

  if (!updatedEmployee) {
    return next(new ErrorHandler("Employee not found", 404));
  }
  await logAction({
    action: 'Employee Status Updated to ' + status,
    performedBy: req.user._id, 
    target: updatedEmployee._id,
    targetModel: 'User',
    details: {
      updatedByName: req.user.name,
      updatedByEmail: req.user.email
    }
  });
  res.status(200).json({
    success: true,
    message: `${updatedEmployee.name}'s status updated to ${status}`,
    data: updatedEmployee
  });
});

export const uploadDocument = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { documentType, name, expiryDate } = req.body;
  if (!req.file) {
    return next(new ErrorHandler("Document file is required", 400));
  }

  const { originalname, path, filename, public_id } = req.file;

  const documentData = {
    name: name || originalname,
    documentType: documentType || "Other",
    fileUrl: path,
    fileId: filename || public_id,
    uploadedAt: new Date(),
    isVerified: false,
  };

  if (expiryDate) {
    documentData.expiryDate = new Date(expiryDate);
  }

  const employee = await User.findByIdAndUpdate(
    id,
    { $push: { documents: documentData } },
    { new: true, select: '-password -verificationCode -verificationCodeExpired' }
  );

  if (!employee) {
    await cloudinary.uploader.destroy(document.fileId);
    return next(new ErrorHandler("Employee not found", 404));
  }
  await logAction({
    action: 'Document Uploaded',
    performedBy: req.user._id, 
    target: employee._id,
    targetModel: 'User',
    details: {
      uploadedByName: req.user.name,
      uploadedByEmail: req.user.email
    }
  });
  res.status(201).json({
    success: true,
    message: "Document uploaded successfully",
    data: documentData
  });
});


export const deleteEmployee = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const employee = await User.findById(id);
  if (!employee) {
    return next(new ErrorHandler("Employee not found", 404));
  }

  const borrowedBooks = await Borrow.find({
    user: id,
    returnDate: null
  });
  for (const book of borrowedBooks) {
    book.returnDate = new Date();
    await book.save();
  }

  const assignedAssets = await Asset.find({
    assignedTo: id,
    status: 'Assigned'
  });
  for (const asset of assignedAssets) {
    asset.assignedTo = null;
    asset.status = 'Available';
    await asset.save();
  }

  await User.findByIdAndDelete(id);
  await logAction({
    action: 'Employee Deleted',
    performedBy: req.user._id, 
    target: employee._id,
    targetModel: 'User',
    details: {
      deletedByName: req.user.name,
      deletedByEmail: req.user.email
    }
  });
  res.status(200).json({
    success: true,
    message: "Employee deleted successfully. All books and assets have been returned.",
    returnedBooks: borrowedBooks.length,
    returnedAssets: assignedAssets.length
  });
});
