/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User and Employee Management APIs
 */


import express from "express";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth.middleware.js";
import { 
  getAllUsers, 
  registerNewAdmin, 
  getUserById, 
  registerNewEmployee,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  updateEmployeeStatus,
  uploadDocument,
  deleteEmployee
} from "../controllers/user.controller.js";
import { uploadImage } from "../middlewares/multer.middleware.js";
const router = express.Router();
/**
 * @swagger
 * /api/v1/users/all:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of all users
 */
router.get("/all", isAuthenticated, authorizeRoles("Admin", "HR", "Asset Manager", "Librarian"), getAllUsers);

/**
 * @swagger
 * /api/v1/users/all/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 */
router.get("/all/:id", isAuthenticated, getUserById);

/**
 * @swagger
 * /api/v1/users/add/newAdmin:
 *   post:
 *     summary: Register a new admin
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: New admin registered
 */
router.post("/add/newAdmin", isAuthenticated, authorizeRoles("Admin", "HR"), registerNewAdmin);

/**
 * @swagger
 * /api/v1/users/employees:
 *   get:
 *     summary: Get all employees
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of employees
 */
router.get("/employees", isAuthenticated, authorizeRoles("Admin", "HR"), getAllEmployees);

/**
 * @swagger
 * /api/v1/users/employees/{id}:
 *   get:
 *     summary: Get employee by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee details
 *   patch:
 *     summary: Update employee data (with image upload)
 *     tags: [Users]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *               updates:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   dateOfBirth:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   gender:
 *                     type: string
 *                   address:
 *                     type: object
 *                     properties:
 *                       street:
 *                         type: string
 *                       city:
 *                         type: string
 *                       state:
 *                         type: string
 *                       country:
 *                         type: string
 *                       postalCode:
 *                         type: string
 *                   designation:
 *                     type: string
 *                   department:
 *                     type: string
 *                   joiningDate:
 *                     type: string
 *                   employmentType:
 *                     type: string
 *                   manager:
 *                     type: string
 *                   team:
 *                     type: string
 *                   emergencyContact:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       relationship:
 *                         type: string
 *                   
 *     responses:
 *       200:
 *         description: Employee updated
 */
router.route("/employees/:id")
  .get(isAuthenticated, authorizeRoles("Admin", "HR"), getEmployeeById)
  .patch(isAuthenticated, authorizeRoles("Admin", "HR"), uploadImage.single('avatar'), updateEmployee);

/**
 * @swagger
 * /api/v1/users/employees/{id}/status:
 *   patch:
 *     summary: Update employee status
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               exitReason:
 *                 type: string
 *               lastWorkingDay:
 *                 type: string
 *     responses:
 *       200:
 *         description: Employee status updated
 */
router.patch("/employees/:id/status", isAuthenticated, authorizeRoles("Admin", "HR"), updateEmployeeStatus);

/**
 * @swagger
 * /api/v1/users/employees/{id}/documents:
 *   post:
 *     summary: Upload employee document
 *     tags: [Users]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Document uploaded
 */
router.post(
  "/employees/:id/documents",
  isAuthenticated,
  authorizeRoles("Admin", "HR"),
  uploadImage.single('document'),
  uploadDocument
);

/**
 * @swagger
 * /api/v1/users/register/employee:
 *   post:
 *     summary: Register a new employee
 *     tags: [Users]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   country:
 *                     type: string
 *                   postalCode:
 *                     type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: New employee registered
 */
router.post("/register/employee", isAuthenticated, authorizeRoles("Admin", "HR"), uploadImage.single('avatar'), registerNewEmployee);

/**
 * @swagger
 * /api/v1/users/verify-email/{token}:
 *   get:
 *     summary: Verify user email
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified
 */
router.get("/verify-email/:token", verifyEmail);

/**
 * @swagger
 * /api/v1/users/forgot-password:
 *   post:
 *     summary: Send forgot password email
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email sent
 */
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /api/v1/users/reset-password/{token}:
 *   post:
 *     summary: Reset user password
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset
 */
router.post("/reset-password/:token", resetPassword);

/**
 * @swagger
 * /api/v1/users/employees/{id}:
 *   delete:
 *     summary: Delete an employee
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee deleted
 */
router.delete("/employees/:id", isAuthenticated, authorizeRoles("Admin", "HR"), deleteEmployee);

export default router;