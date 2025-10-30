import { Asset } from "../models/asset.model.js";
import { User } from "../models/user.model.js";
import { Assignment } from "../models/assetAssignment.model.js";
import { logAction } from "../utils/logAction.js";


export const assignAsset = async ({ email, sno, assignedBy }) => {
  const asset = await Asset.findOne({ serialNumber: sno });
  if (!asset || asset.status !== "Available") {
    throw new Error(`Asset with serial number ${sno} is not available`);
  }

  const user = await User.findOne({ email, accountVerified: true });
  if (!user) throw new Error(`No verified user found with email ${email}`);

  const populatedUser = await user.populate({
    path: "assignedAssets.assignmentId",
    populate: { path: "assetId" },
  });

  const alreadyAssigned = populatedUser.assignedAssets.some((ua) =>
    !ua.returned && ua?.assignmentId?.assetId?.assetCategory === asset.assetCategory
  );

  if (alreadyAssigned) {
    return;
  }

  const assignment = await Assignment.create({
    assetId: asset._id,
    userId: user._id,
    assignedBy,
    assignedDate: new Date(),
    expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: "Assigned",
    remarks: "Auto-assigned during onboarding",
  });

  user.assignedAssets.push({ assignmentId: assignment._id, returned: false });
  asset.status = "Assigned";
  asset.assignedTo = user._id;

  await Promise.all([user.save(), asset.save()]);

  await logAction({
    action: 'Asset Assigned',
    performedBy: assignedBy,
    target: asset._id,
    targetModel: 'Asset',
    details: {
      assignedTo: user._id,
      assignedBy,
    },
  });

  return assignment;
};
