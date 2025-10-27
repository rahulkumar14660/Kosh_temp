import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.middleware.js";
import { Asset } from "../models/asset.model.js";
import { Assignment } from "../models/assetAssignment.model.js";
import { RepairLog } from "../models/repairLog.model.js";
import { User } from "../models/user.model.js";
import { logAction } from "../utils/logAction.js";
export const getAllAssets = catchAsyncErrors(async (req, res, next) => {
  const assets = await Asset.find({}).populate({ path: "assignedTo" });
  return res.json({ assets: assets });
});
export const createNewAsset = catchAsyncErrors(async (req, res, next) => {
  const { assetName, assetCategory, serialNumber, assetDescription, purchaseDate, warrantyExpiry, cost, status } = req.body;
  if (!assetName || !assetCategory || !serialNumber) {
    return next(new ErrorHandler("assetName, assetCategory, and serialNumber are required.", 400));
  }
  const existingAsset = await Asset.findOne({ serialNumber });
  if (existingAsset) {
    return next(new ErrorHandler("Asset with this serial number already exists.", 400));
  }
  if (cost && (isNaN(cost) || cost < 0)) {
    return next(new ErrorHandler("Invalid asset cost. Must be a positive number.", 400));
  }
  if (purchaseDate && isNaN(Date.parse(purchaseDate))) {
    return res.status(400).json({
      success: false,
      message: "Invalid purchaseDate format.",
    });
  }
  if (warrantyExpiry && isNaN(Date.parse(warrantyExpiry))) {
    return next(new ErrorHandler("Invalid warrantyExpiry format.", 400));
  }
  const validStatuses = ["Available", "Assigned", "Under Maintenance", "Retired"];
  if (status && !validStatuses.includes(status)) {
    return next(new ErrorHandler("Invalid asset status provided.", 400));
  }
  const asset = await Asset.create({
    assetName,
    assetCategory,
    serialNumber,
    assetDescription,
    purchaseDate,
    warrantyExpiry,
    cost,
    status,
  });
  await logAction({
    action: 'Asset Created',
    performedBy: req.user._id, 
    target: asset._id,
    targetModel: 'Asset',
    details: {
      createdByName: req.user.name,
      createdByEmail: req.user.email
    }
  });
  return res.status(201).json({
    success: true,
    message: "Asset created successfully",
    asset,
  });
});
export const getAssetBySno = catchAsyncErrors(async (req, res, next) => {
  const { sno } = req.params;
  const asset = await Asset.findOne({ serialNumber: sno });
  if (!asset) {
    return next(new ErrorHandler("Asset not found", 404));
  }
  return res.status(200).json({
    status: "success",
    data: {
      asset: asset,
    },
  });
});
export const updateAssetDetails = catchAsyncErrors(async (req, res, next) => {
  const { sno } = req.params;
  const { assetName, assetCategory, serialNumber, assetDescription, purchaseDate, warrantyExpiry, cost } = req.body;
  const asset = await Asset.findOne({ serialNumber: sno });
  if (!asset) {
    return next(new ErrorHandler("Asset not found", 404));
  }
  if (assetName) asset.assetName = assetName;
  if (assetCategory) asset.assetCategory = assetCategory;
  if (serialNumber) asset.serialNumber = serialNumber;
  if (assetDescription) asset.assetDescription = assetDescription;
  if (purchaseDate) asset.purchaseDate = new Date(purchaseDate);
  if (warrantyExpiry) asset.warrantyExpiry = new Date(warrantyExpiry);
  if (cost) asset.cost = cost;
  await asset.save();
  await logAction({
    action: 'Asset Updated',
    performedBy: req.user._id, 
    target: asset._id,
    targetModel: 'Asset',
    details: {
      updatedByName: req.user.name,
      updatedByEmail: req.user.email
    }
  });
  return res.status(200).json({
    success: true,
    message: "Asset details updated successfully",
    data: {
      asset: asset,
    },
  });
});
export const deleteAsset = catchAsyncErrors(async (req, res, next) => {
  const { sno } = req.params;
  const asset = await Asset.findOne({ serialNumber: sno });
  if (!asset) {
    return next(new ErrorHandler("Asset not found", 404));
  }
  if (asset.assignedTo) {
    const user = await User.findById(asset.assignedTo);
    if (user) {
      const assignment = await Assignment.findOne({
        assetId: asset._id,
        userId: user._id,
        status: "Assigned",
      });
      if (assignment) {
        assignment.status = "Deleted";
        assignment.actualReturnDate = Date.now();
        assignment.remarks = `[Deleted] ${assignment.remarks || ""}`;
        await assignment.save();
        const assignEntry = user.assignedAssets.find((userAsset) =>
          userAsset.assignmentId.toString() === assignment._id.toString()
        );
        if (assignEntry) {
          assignEntry.returned = true;
        }
        await user.save();
      }
      asset.assignedTo = null;
    }
  }
  await Assignment.updateMany({ assetId: asset._id }, { $set: { status: "Deleted" } });
  await asset.deleteOne();
  await logAction({
    action: 'Asset Deleted',
    performedBy: req.user._id, 
    target: asset._id,
    targetModel: 'Asset',
    details: {
      deletedByName: req.user.name,
      deletedByEmail: req.user.email
    }
  });
  return res.status(200).json({
    success: true,
    message: "Asset deleted successfully and related references cleaned.",
  });
});
export const getRepairLogs = catchAsyncErrors(async (req, res, next) => {
  const repairLogs = await RepairLog.find({}).populate({ path: "assetId" }).populate({
    path: "reportedBy",
    select: "name email role",
  })
  .populate({
    path: "handledBy",
    select: "name email role",
  });
  if (!repairLogs) {
    return next(new ErrorHandler("Repair Logs not found", 404));
  }
  return res.status(200).json({
    status: "success",
    data: {
      repairLogs: repairLogs,
    },
  });
});
export const getRepairLogById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const repairLog = await RepairLog.find({ assetId: id }).populate({ path: "assetId" }).populate({
    path: "reportedBy",
    select: "name email role",
  })
  .populate({
    path: "handledBy",
    select: "name email role",
  });
  if (!repairLog) {
    return next(new ErrorHandler("Repair Logs not found", 404));
  }
  return res.status(200).json({
    status: "success",
    data: {
      repairLog: repairLog,
    },
  });
});
export const getUserAssets = catchAsyncErrors(async (req, res, next) => {
  const id = req.user.id;
  let assignments = await Assignment.find({ userId: id, status: "Assigned" })
    .populate("assetId")
    .populate({
      path: "userId",
      select: "name email role",
    })
    .populate({
      path: "assignedBy",
      select: "name email role",
    });
  assignments = assignments.filter((assign) => {
    return assign.assetId.status != "Retired";
  });
  if (!assignments) {
    return next(new ErrorHandler("No assignment data available for the user", 400));
  }
  return res.status(200).json({
    status: "success",
    data: {
      assets: assignments,
    },
  });
});
export const getAssetStats = catchAsyncErrors(async (req, res, next) => {
  const totalAssets = await Asset.countDocuments();
  const assignedAssets = await Asset.countDocuments({ status: 'Assigned' });
  const availableAssets = await Asset.countDocuments({ status: 'Available' });
  const underMaintenanceAssets = await Asset.countDocuments({ status: 'Under Maintenance' });
  const retiredAssets = await Asset.countDocuments({ status: 'Retired' });
  res.status(200).json({
    success: true,
    stats: {
      total: totalAssets,
      assigned: assignedAssets,
      available: availableAssets,
      maintenance: underMaintenanceAssets,
      retired: retiredAssets
    },
  });
});
