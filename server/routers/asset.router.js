/**
 * @swagger
 * tags:
 *   name: Assets
 *   description: Asset management and repair operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Asset:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier of the asset
 *         assetName:
 *           type: string
 *           description: The name of the asset
 *         assetCategory:
 *           type: string
 *           description: The category of the asset
 *         serialNumber:
 *           type: string
 *           description: The serial number of the asset
 *         assetDescription:
 *           type: string
 *           description: Description of the asset
 *         purchaseDate:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the asset was purchased
 *         warrantyExpiry:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the warranty expires
 *         cost:
 *           type: number
 *           description: The cost of the asset
 *         status:
 *           type: string
 *           enum: [Available, Assigned, Under Maintenance, Retired]
 *           description: The status of the asset
 *       required:
 *         - id
 *         - assetName
 *         - assetCategory
 *         - serialNumber
 *         - assetDescription
 *         - purchaseDate
 *         - warrantyExpiry
 *         - cost
 *         - status
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     AssetCreateRequest:
 *       type: object
 *       properties:
 *         assetName:
 *           type: string
 *           description: The name of the asset
 *         assetCategory:
 *           type: string
 *           description: The category of the asset
 *         serialNumber:
 *           type: string
 *           description: The serial number of the asset
 *         assetDescription:
 *           type: string
 *           description: Description of the asset
 *         purchaseDate:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the asset was purchased
 *         warrantyExpiry:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the warranty expires
 *         cost:
 *           type: number
 *           description: The cost of the asset
 *       required:
 *         - assetName
 *         - assetCategory
 *         - serialNumber
 *         - assetDescription
 *         - purchaseDate
 *         - warrantyExpiry
 *         - cost
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AssetUpdateRequest:
 *       type: object
 *       properties:
 *         assetName:
 *           type: string
 *           description: The name of the asset
 *         assetCategory:
 *           type: string
 *           description: The category of the asset
 *         serialNumber:
 *           type: string
 *           description: The serial number of the asset
 *         assetDescription:
 *           type: string
 *           description: Description of the asset
 *         purchaseDate:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the asset was purchased
 *         warrantyExpiry:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the warranty expires
 *         cost:
 *           type: number
 *           description: The cost of the asset
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     AssetStats:
 *       type: object
 *       properties:
 *         total:
 *           type: number
 *           description: Total number of assets
 *         assigned:
 *           type: number
 *           description: Number of assigned assets
 *         available:
 *           type: number
 *           description: Number of available assets
 *         maintenance:
 *           type: number
 *           description: Number of assets under maintenance
 *         retired:
 *           type: number
 *           description: Number of retired assets
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RepairLog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier of the repair log
 *         assetId:
 *           type: string
 *           description: The asset this repair log belongs to
 *         reportedBy:
 *           type: string
 *           description: The user who reported the issue
 *         handledBy:
 *           type: string
 *           description: The user who handled the issue
 *         status:
 *           type: string
 *           enum: [Under Repair, Repaired, Closed]
 *           description: The status of the repair log
 *         remarks:
 *           type: string
 *           description: Remarks about the repair
 *       required:
 *         - id
 *         - assetId
 *         - reportedBy
 *         - handledBy
 *         - status
 *         - remarks
 */

/**
 * @swagger
 * /api/v1/assets/{sno}:
 *   delete:
 *     summary: Delete an asset
 *     tags: [Assets]
 *     description: Requires authentication and Admin or Asset Manager role.
 *     parameters:
 *       - in: path
 *         name: sno
 *         required: true
 *         schema:
 *           type: string
 *         description: The serial number of the asset to delete
 *     responses:
 *       200:
 *         description: Asset deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

import express from "express";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  createNewAsset,
  deleteAsset,
  getAllAssets,
  getAssetBySno,
  getAssetStats,
  getRepairLogById,
  getRepairLogs,
  getUserAssets,
  updateAssetDetails
} from "../controllers/asset.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/asset/assets:
 *   get:
 *     summary: Get all assets
 *     tags: [Assets]
 *     description: Requires Admin or Asset Manager role. Returns a list of all assets.
 *     responses:
 *       200:
 *         description: List of all assets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Asset'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/assets", isAuthenticated, authorizeRoles("Admin", "Asset Manager"), getAllAssets);

/**
 * @swagger
 * /api/v1/asset/assets:
 *   post:
 *     summary: Create a new asset
 *     tags: [Assets]
 *     description: Requires Admin or Asset Manager role. Adds a new asset to the system.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssetCreateRequest'
 *     responses:
 *       201:
 *         description: Asset created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/assets", isAuthenticated, authorizeRoles("Admin", "Asset Manager"), createNewAsset);

/**
 * @swagger
 * /api/v1/asset/assets/{sno}:
 *   get:
 *     summary: Get asset by serial number
 *     tags: [Assets]
 *     description: Requires Admin or Asset Manager role. Retrieve asset details by serial number.
 *     parameters:
 *       - in: path
 *         name: sno
 *         required: true
 *         schema:
 *           type: string
 *         description: Serial number of the asset
 *     responses:
 *       200:
 *         description: Asset details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Asset'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Asset not found
 */
router.get("/assets/:sno", isAuthenticated, authorizeRoles("Admin", "Asset Manager"), getAssetBySno);

/**
 * @swagger
 * /api/v1/asset/assets/{sno}:
 *   put:
 *     summary: Update asset details
 *     tags: [Assets]
 *     description: Requires Admin or Asset Manager role. Update details of an asset by serial number.
 *     parameters:
 *       - in: path
 *         name: sno
 *         required: true
 *         schema:
 *           type: string
 *         description: Serial number of the asset to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssetUpdateRequest'
 *     responses:
 *       200:
 *         description: Asset updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Asset not found
 */
router.put("/assets/:sno", isAuthenticated, authorizeRoles("Admin", "Asset Manager"), updateAssetDetails);

/**
 * @swagger
 * /api/v1/asset/assets/{sno}:
 *   delete:
 *     summary: Delete an asset
 *     tags: [Assets]
 *     description: Requires Admin or Asset Manager role. Delete an asset by serial number.
 *     parameters:
 *       - in: path
 *         name: sno
 *         required: true
 *         schema:
 *           type: string
 *         description: Serial number of the asset to delete
 *     responses:
 *       200:
 *         description: Asset deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Asset not found
 */
router.delete("/assets/:sno", isAuthenticated, authorizeRoles("Admin", "Asset Manager"), deleteAsset);

/**
 * @swagger
 * /api/v1/asset/assets/stats:
 *   get:
 *     summary: Get asset statistics
 *     tags: [Assets]
 *     description: Requires Admin or Asset Manager role. Returns aggregated asset stats.
 *     responses:
 *       200:
 *         description: Asset statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssetStats'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/assets/stats", isAuthenticated, authorizeRoles("Admin", "Asset Manager"), getAssetStats);

/**
 * @swagger
 * /api/v1/asset/repairs:
 *   get:
 *     summary: Get all asset repair logs
 *     tags: [Assets]
 *     description: Requires Admin or Asset Manager role. Returns all repair logs.
 *     responses:
 *       200:
 *         description: List of repair logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RepairLog'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/repairs", isAuthenticated, authorizeRoles("Admin", "Asset Manager"), getRepairLogs);

/**
 * @swagger
 * /api/v1/asset/repairs/{id}:
 *   get:
 *     summary: Get a specific repair log by ID
 *     tags: [Assets]
 *     description: Requires Admin or Asset Manager role. Retrieve a repair log by ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Repair log ID
 *     responses:
 *       200:
 *         description: Repair log details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RepairLog'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Repair log not found
 */
router.get("/repairs/:id", isAuthenticated, authorizeRoles("Admin", "Asset Manager"), getRepairLogById);

/**
 * @swagger
 * /api/v1/asset/me/assets:
 *   get:
 *     summary: Get assets assigned to the authenticated user
 *     tags: [Assets]
 *     description: Requires authentication. Returns assets assigned to the logged-in user.
 *     responses:
 *       200:
 *         description: List of user's assets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Asset'
 *       401:
 *         description: Unauthorized
 */
router.get("/me/assets", isAuthenticated, getUserAssets);

/**
 * @swagger
 * /api/v1/asset/dashboard/assets/stats:
 *   get:
 *     summary: Get asset statistics for dashboard
 *     tags: [Assets]
 *     description: Requires Admin or Asset Manager role. Returns aggregated asset stats for dashboard view.
 *     responses:
 *       200:
 *         description: Dashboard asset statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssetStats'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/dashboard/assets/stats", isAuthenticated, authorizeRoles("Admin", "Asset Manager"), getAssetStats);

export default router;
