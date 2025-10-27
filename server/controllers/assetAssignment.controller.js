import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.middleware.js";
import { Asset } from "../models/asset.model.js";
import { Assignment } from "../models/assetAssignment.model.js";
import { RepairLog } from "../models/repairLog.model.js";
import { User } from "../models/user.model.js";
import { logAction } from "../utils/logAction.js";
export const recordAssetAssignment = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
  const { sno } = req.params;
  const asset = await Asset.findOne({ serialNumber: sno });
  if (!asset) {
    return next(new ErrorHandler("Asset not found with serial number " + sno, 404));
  }
  if (!email) {
    return next(new ErrorHandler("Please enter the email", 400));
  }
  const user = await User.findOne({ email, accountVerified: true });
  if (!user) {
    return next(new ErrorHandler("No verified user found with email " + email, 404));
  }
  if (asset.status !== "Available") {
    return next(new ErrorHandler("The asset is not available for assignement", 400));
  }
  const populatedUser = await user.populate({
    path: "assignedAssets.assignmentId",
    populate: { path: "assetId" },
  });
  const isAlreadyAssigned = populatedUser.assignedAssets.find((userAsset) => {
    return !userAsset.returned && userAsset?.assignmentId?.assetId?.assetCategory.toString() === asset.assetCategory.toString();
  });
  if (isAlreadyAssigned) {
    return next(new ErrorHandler(`User has already been assigned an asset belonging to ${asset.assetCategory} category`, 400));
  }
  const assignment = await Assignment.create({
    assetId: asset._id,
    userId: user._id,
    assignedBy: req.user.id,
    assignedDate: Date.now(),
    expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: "Assigned",
    remarks: "Asset is assigned.",
  });
  user.assignedAssets.push({
    assignmentId: assignment._id,
    returned: false,
  });
  asset.status = "Assigned";
  asset.assignedTo = user._id;
  await user.save();
  await asset.save();
  await logAction({
    action: 'Asset Assigned',
    performedBy: req.user._id, 
    target: asset._id,
    targetModel: 'Asset',
    details: {
      assignedTo: user._id,
      assignedBy: req.user._id
    }
  });
  return res.status(200).json({
    status: "success",
    message: "Asset - " + sno + " successfully assigned",
    data: {
      assignmentId: assignment._id,
      assetId: asset._id,
      userId: user._id,
      asset,
    },
  });
});
export const recordAssetReturn = catchAsyncErrors(async (req, res, next) => {
  const { sno } = req.params;
  const asset = await Asset.findOne({ serialNumber: sno });
  if (!asset) {
    return next(new ErrorHandler("Asset not found with serial number " + sno, 404));
  }
  if (!asset.assignedTo) {
    return next(new ErrorHandler("Asset not assigned to anyone."));
  }
  const userId = asset.assignedTo;
  const user = await User.findById(userId);
  asset.assignedTo = null;
  asset.status = "Available";
  const assignment = await Assignment.findOne({
    assetId: asset._id,
    userId: user._id,
    status: "Assigned",
  });
  if (!assignment) {
    return next(new ErrorHandler("No active assignment found for this asset and user", 400));
  }
  assignment.actualReturnDate = Date.now();
  assignment.status = "Returned";
  if (req.body.remarks) {
    assignment.remarks = req.body.remarks;
  }
  const assign = user.assignedAssets.find((userAsset) => {
    return userAsset.assignmentId.toString() === assignment._id.toString();
  });
  if (!assign) {
    return next(new ErrorHandler("Assignment not found in user's assignedAssets", 500));
  }
  assign.returned = true;
  await assignment.save();
  await asset.save();
  await user.save();
  await logAction({
    action: 'Asset Returned',
    performedBy: req.user._id, 
    target: asset._id,
    targetModel: 'Asset',
    details: {
      returnedBy: user._id,
      returnedTo: asset.assignedTo
    }
  });
  return res.status(200).json({
    success: true,
    message: "Asset - " + sno + " successfully returned.",
    data: {
      assignmentId: assignment._id,
      assetId: asset._id,
      userId: user._id,
    },
  });
});
export const recordRepairAsset = catchAsyncErrors(async (req, res, next) => {
  const { remarks } = req.body;
  const { sno } = req.params;
  const asset = await Asset.findOne({ serialNumber: sno });
  if (!asset) {
    return next(new ErrorHandler("Asset not found with serial number " + sno, 404));
  }
  if (asset.status === "Under Maintenance") {
    return next(new ErrorHandler("This asset is already under maintenance", 400));
  }
  asset.status = "Under Maintenance";
  await asset.save();
  await RepairLog.create({
    assetId: asset._id,
    reportedBy: req.user.id,
    status: "Under Repair",
    remarks: remarks || "No remarks",
    handledBy: req.user.id,
  });
  await logAction({
    action: 'Asset Repaired',
    performedBy: req.user._id, 
    target: asset._id,
    targetModel: 'Asset',
    details: {
      repairedBy: req.user._id,
      repairedTo: asset.assignedTo
    }
  });
  return res.status(200).json({
    status: "success",
    message: "Asset - " + sno + " recorded for repair",
  });
});
export const recordAssetRepaired = catchAsyncErrors(async (req, res, next) => {
  const { remarks } = req.body;
  const { sno } = req.params;
  const asset = await Asset.findOne({ serialNumber: sno });
  if (!asset) {
    return next(new ErrorHandler("Asset not found with serial number " + sno, 404));
  }
  if (asset.status !== "Under Maintenance") {
    return next(new ErrorHandler("Asset is not under maintenance", 400));
  }
  asset.status = asset.assignedTo ? "Assigned" : "Available";
  await asset.save();
  await RepairLog.create({
    assetId: asset._id,
    status: "Repaired",
    remarks: remarks || "No remarks",
    handledBy: req.user.id,
  });
  await logAction({
    action: 'Asset Repaired',
    performedBy: req.user._id, 
    target: asset._id,
    targetModel: 'Asset',
    details: {
      repairedBy: req.user._id,
      repairedTo: asset.assignedTo
    }
  });
  return res.status(200).json({
    status: "success",
    message: "Asset - " + sno + " repaired successfully",
  });
});
export const recordAssetRetired = catchAsyncErrors(async (req, res, next) => {
  const { remarks } = req.body;
  const { sno } = req.params;
  const asset = await Asset.findOne({ serialNumber: sno });
  if (!asset) {
    return next(new ErrorHandler("Asset not found with serial number " + sno, 404));
  }
  if (asset.assignedTo) {
    const user = await User.findById(asset.assignedTo);
    const assignment = await Assignment.findOne({
      assetId: asset._id,
      userId: user._id,
      status: "Assigned",
    });
    if (assignment) {
      assignment.status = "Returned";
      assignment.actualReturnDate = Date.now();
      if (remarks) {
        assignment.remarks = `${assignment.remarks || ""}\n[Retired] ${remarks}`;
      }
      await assignment.save();
      const assignEntry = user.assignedAssets.find((userAsset) => userAsset.assignmentId.toString() === assignment._id.toString());
      if (assignEntry) {
        assignEntry.returned = true;
      }
      await user.save();
    }
    asset.assignedTo = null;
  }
  asset.status = "Retired";
  await asset.save();
  await RepairLog.create({
    assetId: asset._id,
    status: "Decommissioned",
    remarks: remarks || "No remarks",
    handledBy: req.user.id,
  });
  await logAction({
    action: 'Asset Retired',
    performedBy: req.user._id, 
    target: asset._id,
    targetModel: 'Asset',
    details: {
      retiredBy: req.user._id,
      retiredTo: asset.assignedTo
    }
  });
  return res.status(200).json({
    status: "success",
    message: "Asset - " + sno + " successfully retired.",
  });
});
export const getMyAssignments = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;
  const assignments = await Assignment.find({ userId })
    .populate({
      path: 'assetId',
    })
    .populate('assignedBy', 'name email')
    .sort({ assignedDate: -1 });
  if (!assignments) {
    return next(new ErrorHandler("No assignments found for this user with id " + userId, 404));
  }

  res.status(200).json({
    success: true,
    count: assignments.length,
    data: assignments,
  });
});
export const getMyReturnedAssets = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;
  const assignments = await Assignment.find({ userId, status: 'Returned' })
    .populate({
      path: 'assetId',
    })
    .populate('assignedBy', 'name email')
    .sort({ actualReturnDate: -1 });
  if (!assignments) {
    return next(new ErrorHandler("No returned assets found for this user with id " + userId, 404));
  }
  res.status(200).json({
    success: true,
    count: assignments.length,
    data: assignments,
  });
});
export const getAllAssignments = catchAsyncErrors(async (req, res, next) => {
  const assignments = await Assignment.find({ status: { $ne: "Deleted" } })
    .populate("assetId")
    .populate({
      path: "userId",
      select: "name email role",
    })
    .populate({
      path: "assignedBy",
      select: "name email role",
    });
  return res.status(200).json({
    success: true,
    total: assignments.length,
    assignments,
  });
});
export const getUserAssignments = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.params;
  const assignment = await Assignment.find({ userId: userId, status: { $ne: "Deleted" } })
    .populate("assetId")
    .populate({
      path: "userId",
      select: "name email role",
    })
    .populate({
      path: "assignedBy",
      select: "name email role",
    });
  if (!assignment) {
    return next(new ErrorHandler("No assignments data available for the user with id " + userId, 400));
  }
  return res.status(200).json({
    status: "success",
    data: {
      assignment,
    },
  });
});
