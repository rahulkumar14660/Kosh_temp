/**
 * @swagger
 * tags:
 *   name: AssetAssignments
 *   description: Operations related to asset assignments and management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AssetAssignment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier of the asset assignment
 *         asset:
 *           type: string
 *           description: Asset assigned to the user
 *         user:
 *           type: string
 *           description: User who received the asset
 *         assignedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the asset was assigned
 *       required:
 *         - id
 *         - asset
 *         - user
 *         - assignedAt
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     AssignmentRequest:
 *       type: object
 *       properties:
 *         assetId:
 *           type: string
 *           description: The id of the asset
 *         userId:
 *           type: string
 *           description: The id of the user
 *         assignedBy:
 *           type: string
 *           description: The id of the user who assigned the asset
 *       required:
 *         - assetId
 *         - userId
 *         - assignedBy
 */

import express from "express";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  getAllAssignments,
  getMyAssignments,
  getMyReturnedAssets,
  getUserAssignments,
  recordAssetAssignment,
  recordAssetRepaired,
  recordAssetRetired,
  recordAssetReturn,
  recordRepairAsset
} from "../controllers/assetAssignment.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/assignAsset/recordAssetAssignment/{sno}:
 *   post:
 *     summary: Record an asset assignment
 *     tags: [AssetAssignments]
 *     description: Requires authentication and Admin or Asset Manager role. Assign an asset by serial number.
 *     parameters:
 *       - in: path
 *         name: sno
 *         required: true
 *         schema:
 *           type: string
 *         description: Serial number of the asset
 *     responses:
 *       201:
 *         description: Asset assignment recorded successfully
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User lacks required role
 */
router.post("/recordAssetAssignment/:sno", isAuthenticated, authorizeRoles("Admin", "Asset Manager"), recordAssetAssignment);

/**
 * @swagger
 * /api/v1/assignAsset/recordAssetReturn/{sno}:
 *   post:
 *     summary: Record the return of an asset
 *     tags: [AssetAssignments]
 *     description: Requires authentication and Admin or Asset Manager role. Record asset return by serial number.
 *     parameters:
 *       - in: path
 *         name: sno
 *         required: true
 *         schema:
 *           type: string
 *         description: Serial number of the asset being returned
 *     responses:
 *       200:
 *         description: Asset return recorded successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/recordAssetReturn/:sno", isAuthenticated, authorizeRoles("Admin", "Asset Manager"), recordAssetReturn);

/**
 * @swagger
 * /api/v1/assignAsset/recordAssetRepair/{sno}:
 *   post:
 *     summary: Record that an asset is sent for repair
 *     tags: [AssetAssignments]
 *     description: Requires authentication and Admin or Asset Manager role. Record repair request by serial number.
 *     parameters:
 *       - in: path
 *         name: sno
 *         required: true
 *         schema:
 *           type: string
 *         description: Serial number of the asset sent for repair
 *     responses:
 *       200:
 *         description: Asset repair request recorded successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/recordAssetRepair/:sno", isAuthenticated, authorizeRoles("Admin", "Asset Manager"), recordRepairAsset);

/**
 * @swagger
 * /api/v1/assignAsset/recordAssetRepaired/{sno}:
 *   post:
 *     summary: Record that an asset has been repaired
 *     tags: [AssetAssignments]
 *     description: Requires authentication and Admin or Asset Manager role. Record asset repaired status by serial number.
 *     parameters:
 *       - in: path
 *         name: sno
 *         required: true
 *         schema:
 *           type: string
 *         description: Serial number of the repaired asset
 *     responses:
 *       200:
 *         description: Asset repaired status recorded successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/recordAssetRepaired/:sno", isAuthenticated, authorizeRoles("Admin", "Asset Manager"), recordAssetRepaired);

/**
 * @swagger
 * /api/v1/assignAsset/recordAssetRetired/{sno}:
 *   post:
 *     summary: Record that an asset has been retired
 *     tags: [AssetAssignments]
 *     description: Requires authentication and Admin or Asset Manager role. Record asset retirement by serial number.
 *     parameters:
 *       - in: path
 *         name: sno
 *         required: true
 *         schema:
 *           type: string
 *         description: Serial number of the retired asset
 *     responses:
 *       200:
 *         description: Asset retirement recorded successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/recordAssetRetired/:sno", isAuthenticated, authorizeRoles("Admin", "Asset Manager"), recordAssetRetired);

/**
 * @swagger
 * /api/v1/assignAsset/getAllAssignments:
 *   get:
 *     summary: Get all asset assignments
 *     tags: [AssetAssignments]
 *     description: Requires authentication and Admin or Asset Manager role. Returns all asset assignments.
 *     responses:
 *       200:
 *         description: List of all asset assignments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AssetAssignment'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/getAllAssignments", isAuthenticated, authorizeRoles("Admin", "Asset Manager"), getAllAssignments);

/**
 * @swagger
 * /api/v1/assignAsset/getAllAssignments/{userId}:
 *   get:
 *     summary: Get all asset assignments for a specific user
 *     tags: [AssetAssignments]
 *     description: Requires authentication and Admin or Asset Manager role. Returns assignments for given user ID.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to get assignments for
 *     responses:
 *       200:
 *         description: List of asset assignments for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AssetAssignment'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/getAllAssignments/:userId", isAuthenticated, authorizeRoles("Admin", "Asset Manager"), getUserAssignments);

/**
 * @swagger
 * /api/v1/assignAsset/my-assignments:
 *   get:
 *     summary: Get asset assignments for the authenticated user
 *     tags: [AssetAssignments]
 *     description: Requires authentication. Returns assignments for the logged-in user.
 *     responses:
 *       200:
 *         description: List of user's asset assignments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AssetAssignment'
 *       401:
 *         description: Unauthorized
 */
router.get("/my-assignments", isAuthenticated, getMyAssignments);

/**
 * @swagger
 * /api/v1/assignAsset/my-returned-assets:
 *   get:
 *     summary: Get returned assets for the authenticated user
 *     tags: [AssetAssignments]
 *     description: Requires authentication. Returns assets returned by the logged-in user.
 *     responses:
 *       200:
 *         description: List of user's returned assets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AssetAssignment'
 *       401:
 *         description: Unauthorized
 */
router.get("/my-returned-assets", isAuthenticated, getMyReturnedAssets);

export default router;
