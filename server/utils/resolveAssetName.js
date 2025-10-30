import { Asset } from "../models/asset.model.js";

export const resolveAssetName = async (parameters) => {
  if (parameters.assetName) {
    const assets = await Asset.find({
      assetName: { $regex: parameters.assetName, $options: "i" },
    });

    if (assets.length === 1) {
      return { serialNumber: assets[0].serialNumber };
    } else if (assets.length > 1) {
      const assetNames = assets
        .map((a, i) => `${i + 1}. ${a.assetName} (${a.assetCategory}) - ${a.serialNumber}`)
        .join("<br /><br />");

      return {
        conflict: true,
        message:
          "I found multiple assets with the same name:<br /><br />" +
          assetNames +
          "<br /><br />Please specify which asset you're referring to.",
      };
    } else {
      return { error: "No asset found with name " + parameters.assetName };
    }
  }

  return { serialNumber: parameters.serialNumber };
};
