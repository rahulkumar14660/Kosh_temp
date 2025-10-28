/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Operations related to books management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - author
 *         - description
 *         - price
 *         - quantity
 *         - genre
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the book
 *         title:
 *           type: string
 *           description: The title of the book
 *         author:
 *           type: string
 *           description: The author of the book
 *         description:
 *           type: string
 *           description: The description of the book
 *         price:
 *           type: number
 *           description: The price of the book
 *         quantity:
 *           type: integer
 *           description: The quantity of the book
 *         genre:
 *           type: string
 *           description: The genre of the book
 *
 *     BookInput:
 *       type: object
 *       required:
 *         - title
 *         - author
 *         - description
 *         - price
 *         - quantity
 *         - genre
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the book
 *         author:
 *           type: string
 *           description: The author of the book
 *         description:
 *           type: string
 *           description: The description of the book
 *         price:
 *           type: number
 *           description: The price of the book
 *         quantity:
 *           type: integer
 *           description: The quantity of the book
 *         genre:
 *           type: string
 *           description: The genre of the book


*/

import express from "express";
import { addBooks, deleteBooks, getAllBooks } from "../controllers/book.controller.js";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth.middleware.js";
const router = express.Router();

/**
 * @swagger
 * /api/v1/books/getAllBooks:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     description: Requires authentication. Returns a list of all books.
 *     responses:
 *       200:
 *         description: List of books retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       401:
 *         description: Unauthorized - User not authenticated
 */
router.get("/getAllBooks", isAuthenticated, getAllBooks);

/**
 * @swagger
 * /api/v1/books/admin/addBooks:
 *   post:
 *     summary: Add a new book
 *     tags: [Books]
 *     description: Requires authentication and Admin or Librarian role. Adds a new book.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookInput'
 *     responses:
 *       201:
 *         description: Book added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User lacks required role
 */
router.post("/admin/addBooks", isAuthenticated, authorizeRoles("Admin", "Librarian"), addBooks);

/**
 * @swagger
 * /api/v1/books/admin/deleteBooks/{id}:
 *   delete:
 *     summary: Delete a book
 *     tags: [Books]
 *     description: Requires authentication and Admin or Librarian role. Deletes a book by ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Book ID to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User lacks required role
 *       404:
 *         description: Book not found
 */
router.delete("/admin/deleteBooks/:id", isAuthenticated, authorizeRoles("Admin", "Librarian"), deleteBooks);

export default router;
