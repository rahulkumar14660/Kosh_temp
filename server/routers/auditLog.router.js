/**
 * @swagger
 * tags:
 *   name: AuditLogs
 *   description: Operations related to audit logs management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AuditLog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier of the audit log
 *         user:
 *           type: string
 *           description: User who performed the action
 *         action:
 *           type: string
 *           description: Action performed
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the action occurred
 *       required:
 *         - id
 *         - user
 *         - action
 *         - timestamp
 */


import express from 'express';
import { isAuthenticated, authorizeRoles } from '../middlewares/auth.middleware.js';
import { getAuditLogs } from '../controllers/auditLog.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/audit-logs:
 *   get:
 *     summary: Get all audit logs
 *     tags: [AuditLogs]
 *     description: Requires authentication and Admin role. Retrieves all audit logs.
 *     responses:
 *       200:
 *         description: List of audit logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AuditLog'
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User lacks Admin role
 */
router.get('/', isAuthenticated, authorizeRoles("Admin"), getAuditLogs);

export default router;
