/**
 * @swagger
 * tags:
 *   name: Borrow
 *   description: Library borrowing operations
 */


import express from "express"
import { getBorrowedBooks, getBorrowedBooksForAdmin, recordBorrowBook, returnBook } from "../controllers/borrow.controller.js";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth.middleware.js";
const router = express.Router();
/**
 * @swagger
 * /api/v1/borrow/recordBorrowBook/{id}:
 *   post:
 *     summary: Record a book borrowing event
 *     tags: [Borrow]
 *     description: Requires authentication via HTTP-only cookie. User must be logged in.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Book ID
 *         schema:
 *           type: string
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
 *       201:
 *         description: Book borrow recorded
 *       401:
 *         description: Unauthorized
 */
router.post("/recordBorrowBook/:id", isAuthenticated, recordBorrowBook);

/**
 * @swagger
 * /api/v1/borrow/returnBook/{bookId}:
 *   put:
 *     summary: Return a borrowed book
 *     tags: [Borrow]
 *     description: Requires authentication via HTTP-only cookie. User must be logged in.
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the book to return
 *     responses:
 *       200:
 *         description: Book successfully returned
 *       401:
 *         description: Unauthorized
 */
router.put("/returnBook/:bookId", isAuthenticated, returnBook);

/**
 * @swagger
 * /api/v1/borrow/getBorrowedBooks:
 *   get:
 *     summary: Get books borrowed by current user
 *     tags: [Borrow]
 *     description: Requires authentication via HTTP-only cookie. User must be logged in.
 *     responses:
 *       200:
 *         description: List of borrowed books for the user
 *       401:
 *         description: Unauthorized
 */
router.get("/getBorrowedBooks", isAuthenticated, getBorrowedBooks);

/**
 * @swagger
 * /api/v1/borrow/getAllBorrows:
 *   get:
 *     summary: Get all borrow records (Admin/Librarian only)
 *     tags: [Borrow]
 *     description: Requires authentication via HTTP-only cookie. Accessible only by Admin and Librarian roles.
 *     responses:
 *       200:
 *         description: List of all borrowed books
 *       403:
 *         description: Forbidden (not authorized)
 *       401:
 *         description: Unauthorized
 */
router.get("/getAllBorrows", isAuthenticated, authorizeRoles("Admin", "Librarian"), getBorrowedBooksForAdmin);

export default router;