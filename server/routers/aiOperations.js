/**
 * @swagger
 * tags:
 *   name: IntentAPI
 *   description: Unified endpoint for handling multiple intents (books, assets, employees)
 */

import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  addBooks,
  deleteBooks,
  updateBooks
} from "../controllers/book.controller.js";
import {
  recordBorrowBook,
  returnBook
} from "../controllers/borrow.controller.js";
import {
  recordAssetAssignment,
  recordAssetRepaired,
  recordAssetRetired,
  recordAssetReturn,
  recordRepairAsset
} from "../controllers/assetAssignment.controller.js";
import { createNewAsset, deleteAsset, updateAssetDetails } from "../controllers/asset.controller.js";
import { onboardEmployee, updateEmployee, updateEmployeeStatus } from "../controllers/user.controller.js";
import { User } from "../models/user.model.js";
import { resolveUserEmail } from "../utils/resolveUserEmail.js";
import { resolveBookName } from "../utils/resolveBookName.js";
import { resolveAssetName } from "../utils/resolveAssetName.js";

const router = express.Router();

/**
 * @swagger
 * /:
 *   post:
 *     summary: Process various intents like create/update/delete book, assign/return assets, update employees etc.
 *     tags: [IntentAPI]
 *     description: |
 *       A single endpoint to handle multiple operations based on the "intent" in the request body.  
 *       Requires authentication. Role-based authorization is enforced per intent.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               intent:
 *                 type: string
 *                 example: create_book
 *               parameters:
 *                 type: object
 *                 description: Parameters specific to each intent.
 *     responses:
 *       200:
 *         description: Operation completed successfully
 *       400:
 *         description: Invalid intent or request
 *       401:
 *         description: Unauthorized (invalid role or unauthenticated)
 */
router.post("/", isAuthenticated, async (req, res, next) => {
  const { intent, parameters } = req.body;
  const checkRoles = (allowedRoles) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
  };

  switch (intent) {
    case "create_book":
      checkRoles(["Admin", "Librarian"]);
      req.body = parameters;
      return addBooks(req, res, next);

    case "delete_book":
      checkRoles(["Admin", "Librarian"]);
      const result = await resolveBookName(parameters);
      if (result.conflict) {
        return res.status(400).json({ success: false, message: result.message });
      }
      if (result.error) {
        return res.status(404).json({ success: false, message: result.error });
      }
      req.params.id = result.bookId.toString();
      return deleteBooks(req, res, next);

    case "assign_book":
      checkRoles(["Admin", "Librarian"]);
      const result1 = await resolveUserEmail(parameters);
      const result2 = await resolveBookName(parameters);
      if (result2.conflict) {
        return res.status(400).json({ success: false, message: result2.message });
      }
      if (result2.error) {
        return res.status(404).json({ success: false, message: result2.error });
      }
      if (result1.conflict) {
        return res.status(400).json({ success: false, message: result1.message });
      }
      if (result1.error) {
        return res.status(404).json({ success: false, message: result1.error });
      }

      req.body.email = result1.email;
      req.params.id = result2.bookId.toString();
      return recordBorrowBook(req, res, next);

    case "return_book":
      checkRoles(["Admin", "Librarian"]);
      const result3 = await resolveUserEmail(parameters);
      const result4 = await resolveBookName(parameters);
      if (result4.conflict) {
        return res.status(400).json({ success: false, message: result4.message });
      }
      if (result4.error) {
        return res.status(404).json({ success: false, message: result4.error });
      }
      if (result3.conflict) {
        return res.status(400).json({ success: false, message: result3.message });
      }
      if (result3.error) {
        return res.status(404).json({ success: false, message: result3.error });
      }

      req.body.email = result3.email;
      req.params.bookId = result4.bookId.toString();
      return returnBook(req, res, next);

    case "update_book":
      checkRoles(["Admin", "Librarian"]);
      const result5 = await resolveBookName(parameters);
      if (result5.conflict) {
        return res.status(400).json({ success: false, message: result5.message });
      }
      if (result5.error) {
        return res.status(404).json({ success: false, message: result5.error });
      }
      req.params.id = result5.bookId.toString();
      req.body.updates = parameters.updates;
      return updateBooks(req, res, next);

    case "assign_asset":
      checkRoles(["Admin", "Asset Manager"]);
      const result6 = await resolveAssetName(parameters);
      const result7 = await resolveUserEmail(parameters);
      if (result6.conflict) {
        return res.status(400).json({ success: false, message: result6.message });
      }
      if (result6.error) {
        return res.status(404).json({ success: false, message: result6.error });
      }
      if (result7.conflict) {
        return res.status(400).json({ success: false, message: result7.message });
      }
      if (result7.error) {
        return res.status(404).json({ success: false, message: result7.error });
      }
      req.params.sno = result6.serialNumber;
      req.body.email = result7.email;
      return recordAssetAssignment(req, res, next);

    case "delete_asset":
      checkRoles(["Admin", "Asset Manager"]);
      const result8 = await resolveAssetName(parameters);
      if (result8.conflict) {
        return res.status(400).json({ success: false, message: result8.message });
      }
      if (result8.error) {
        return res.status(404).json({ success: false, message: result8.error });
      }
      req.params.sno = result8.serialNumber;
      return deleteAsset(req, res, next);

    case "return_asset":
      checkRoles(["Admin", "Asset Manager"]);
      const result9 = await resolveAssetName(parameters);
      if (result9.conflict) {
        return res.status(400).json({ success: false, message: result9.message });
      }
      if (result9.error) {
        return res.status(404).json({ success: false, message: result9.error });
      }
      req.params.sno = result9.serialNumber;
      return recordAssetReturn(req, res, next);

    case "update_asset":
      checkRoles(["Admin", "Asset Manager"]);
      const result10 = await resolveAssetName(parameters);
      if (result10.conflict) {
        return res.status(400).json({ success: false, message: result10.message });
      }
      if (result10.error) {
        return res.status(404).json({ success: false, message: result10.error });
      }
      req.params.sno = result10.serialNumber;
      req.body = parameters.updates;
      return updateAssetDetails(req, res, next);

    case "repair_asset":
      checkRoles(["Admin", "Asset Manager"]);
      const result11 = await resolveAssetName(parameters);
      if (result11.conflict) {
        return res.status(400).json({ success: false, message: result11.message });
      }
      if (result11.error) {
        return res.status(404).json({ success: false, message: result11.error });
      }
      req.params.sno = result11.serialNumber;
      if (parameters.remarks) {
        req.body.remarks = parameters.remarks;
      }
      return recordRepairAsset(req, res, next);

    case "repaired_asset":
      checkRoles(["Admin", "Asset Manager"]);
      const result12 = await resolveAssetName(parameters);
      if (result12.conflict) {
        return res.status(400).json({ success: false, message: result12.message });
      }
      if (result12.error) {
        return res.status(404).json({ success: false, message: result12.error });
      }
      req.params.sno = result12.serialNumber;
      if (parameters.remarks) {
        req.body.remarks = parameters.remarks;
      }
      return recordAssetRepaired(req, res, next);

    case "retire_asset":
      checkRoles(["Admin", "Asset Manager"]);
      const result13 = await resolveAssetName(parameters);
      if (result13.conflict) {
        return res.status(400).json({ success: false, message: result13.message });
      }
      if (result13.error) {
        return res.status(404).json({ success: false, message: result13.error });
      }
      req.params.sno = result13.serialNumber;
      return recordAssetRetired(req, res, next);
    case "onboard_employee":
      checkRoles(["Admin", "HR"]);
      const result16 = await resolveUserEmail(parameters);
      if (result16.conflict) {
        return res.status(400).json({ success: false, message: result16.message });
      }
      if (result16.error) {
        return res.status(404).json({ success: false, message: result16.error });
      }
      if (result16.email) {
        const user = await User.findOne({ email: result16.email });
        req.params.id = user._id;
      }
      else {
        req.params.id = result16.id;
      }
      req.body = parameters;
      return onboardEmployee(req, res, next);
    case "update_employee_status":
      checkRoles(["Admin", "HR"]);
      const result14 = await resolveUserEmail(parameters);
      if (result14.conflict) {
        return res.status(400).json({ success: false, message: result14.message });
      }
      if (result14.error) {
        return res.status(404).json({ success: false, message: result14.error });
      }
      if (result14.email) {
        const user = await User.findOne({ email: result14.email });
        req.params.id = user._id;
      }
      else {
        req.params.id = result14.id;
      }
      req.body = parameters;
      return updateEmployeeStatus(req, res, next);

    case "update_employee":
      checkRoles(["Admin", "HR"]);
      const result15 = await resolveUserEmail(parameters);
      if (result15.conflict) {
        return res.status(400).json({ success: false, message: result15.message });
      }
      if (result15.error) {
        return res.status(404).json({ success: false, message: result15.error });
      }
      if (result15.email) {
        const user = await User.findOne({ email: result15.email });
        req.params.id = user._id;
      }
      else {
        req.params.id = result15.id;
      }
      req.body = parameters.updates;
      return updateEmployee(req, res, next);

    case "create_asset":
      checkRoles(["Admin", "Asset Manager"]);
      req.body = parameters;
      return createNewAsset(req, res, next);

    default:
      return res.status(400).json({
        success: false,
        message: "Invalid intent",
      });
  }
});

export default router;
