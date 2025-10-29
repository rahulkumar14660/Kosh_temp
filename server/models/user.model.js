import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';

const userSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
      default: () => `EMP-${uuidv4().substring(0, 8).toUpperCase()}`
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
    },
    
    role: {
      type: String,
      enum: ["Admin", "HR", "Employee", "Librarian", "Asset Manager"],
      default: "Employee",
    },
    permissions: [{
      type: String,
      enum: ["manage_users", "manage_assets", "manage_leave", "view_reports"],
    }],
    
    employmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Intern"],
      default: "Full-time",
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    department: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    team: {
      type: String,
      trim: true,
    },
    
    status: {
      type: String,
      enum: ["Onboarding", "Active", "On Leave", "Suspended", "Resigned", "Terminated"],
      default: "Onboarding",
    },
    lastWorkingDay: {
      type: Date,
    },
    exitReason: {
      type: String,
      default: null,
    },
    
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    emergencyContact: {
      name: String,
      relation: String,
      phone: String,
      email: String,
    },
    
    documents: [{
      name: String,
      documentType: {
        type: String,
        enum: ["resume", "id proof", "address proof", "education", "experience", "other"],
      },
      fileUrl: String,
      fileId: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
      expiryDate: Date,
      isVerified: {
        type: Boolean,
        default: false,
      },
    }],
    
    accountVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    
    borrowedBooks: [{
      borrowId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Borrow",
      },
      returned: {
        type: Boolean,
        default: false,
      },
    }],
    assignedAssets: [{
      assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
      },
      returned: {
        type: Boolean,
        default: false,
      },
    }],
    
    verificationCode: {
      type: Number,
      default: undefined,
      select: false,
    },
    verificationCodeExpired: {
      type: Date,
      default: undefined,
      select: false,
    },
    emailVerificationToken: {
      type: String,
      default: undefined,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      default: undefined,
      select: false,
    },
    resetPasswordExpired: {
      type: Date,
      default: undefined,
      select: false,
    },
    
    avatar: {
      public_id: String,
      url: String,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    skills: [{
      name: String,
      level: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
      },
    }],
    
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true } 
  }
);

userSchema.virtual('fullName').get(function() {
  return this.name;
});
userSchema.virtual('employmentDuration').get(function() {
  if (!this.joiningDate) return 'N/A';
  const now = new Date();
  const diffTime = Math.abs(now - this.joiningDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  return `${years}y ${months}m`;
}); 

userSchema.methods.generateVerificationCode = function () { 
  const firstDigit = Math.floor(Math.random() * 9) + 1;
  const nextFourDigits = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, 0);
  const verificationCode = parseInt(firstDigit + nextFourDigits);
  this.verificationCode = verificationCode;
  this.verificationCodeExpired = Date.now() + 15 * 60 * 1000;
  return verificationCode;
};

userSchema.methods.generateToken = function () { 
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, { 
    expiresIn: process.env.JWT_EXPIRE, 
  });
}; 

export const User = mongoose.model("User", userSchema);