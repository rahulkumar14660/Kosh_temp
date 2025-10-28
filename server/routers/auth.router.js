/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and authorization
 */

import express from "express";
import {
  handleUserRegister,
  login,
  logout,
  verifyOTP,
  getUser,
  sendPasswordChangeOTP,
  verifyPasswordChangeOTP,
  requestPasswordReset,
} from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
const router = express.Router();
/**
 * @swagger
 * /api/v1/auth/getRegistrationOTP:
 *   post:
 *     summary: Send OTP to register a new user
 *     tags: [Auth]
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
 *     responses:
 *       200:
 *         description: OTP sent to email
 *       400:
 *         description: Validation error
 */
router.post("/getRegistrationOTP", handleUserRegister);

/**
 * @swagger
 * /api/v1/auth/verifyRegistrationOTP:
 *   post:
 *     summary: Verify user registration OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid OTP or data
 */
router.post("/verifyRegistrationOTP", verifyOTP);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login a user (sets HTTP-only cookie)
 *     tags: [Auth]
 *     description: On success, sets a secure, HTTP-only JWT cookie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged in and cookie set
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", login);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   get:
 *     summary: Logout user (clears cookie)
 *     tags: [Auth]
 *     description: Requires authentication via HTTP-only cookie.
 *     responses:
 *       200:
 *         description: User logged out
 *       401:
 *         description: Unauthorized
 */
router.get("/logout", isAuthenticated, logout);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     description: Requires authentication via HTTP-only cookie.
 *     responses:
 *       200:
 *         description: User profile returned
 *       401:
 *         description: Unauthorized
 */
router.get("/me", isAuthenticated, getUser);

/**
 * @swagger
 * /api/v1/auth/forgetPassOTP:
 *   post:
 *     summary: Send OTP to initiate password change
 *     tags: [Auth]
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
 *         description: OTP sent
 *       404:
 *         description: Email not found
 */
router.post("/forgetPassOTP", sendPasswordChangeOTP);

/**
 * @swagger
 * /api/v1/auth/verifyForgetpassOTP:
 *   post:
 *     summary: Verify OTP and change password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid OTP or data
 */
router.post("/verifyForgetpassOTP", verifyPasswordChangeOTP);

/**
 * @swagger
 * /api/v1/auth/request-password-reset:
 *   post:
 *     summary: Request a password reset link
 *     tags: [Auth]
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
 *         description: Password reset link sent
 *       404:
 *         description: Email not registered
 */
router.post("/request-password-reset", requestPasswordReset);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Alias for requesting a password reset link
 *     tags: [Auth]
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
 *         description: Password reset email sent
 */
router.post("/forgot-password", requestPasswordReset);

export default router;