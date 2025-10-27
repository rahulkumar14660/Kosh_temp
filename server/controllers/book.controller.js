import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.middleware.js";
import { Book } from "../models/book.model.js";
import { logAction } from "../utils/logAction.js";
export const addBooks = catchAsyncErrors(async (req, res, next) => {
  const { title, author, description, price, quantity, genre } = req.body;
  if (!title || !author || !description || !price || !quantity || !genre) {
    return next(new ErrorHandler("Please fill all the fields.", 400));
  }
  const book = await Book.create({ title, author, description, price, quantity, genre });
  await logAction({
    action: 'Book Added',
    performedBy: req.user._id, 
    target: book._id,
    targetModel: 'Book',
    details: {
      addedByName: req.user.name,
      addedByEmail: req.user.email
    }
  });
  res.status(201).json({
    success: true,
    message: "Book added successfully",
    book,
  });
});
export const deleteBooks = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const book = await Book.findById(id);
  if (!book) {
    return next(new ErrorHandler("Book not found", 404));
  }
  await book.deleteOne();
  await logAction({
    action: 'Book Deleted',
    performedBy: req.user._id, 
    target: book._id,
    targetModel: 'Book',
    details: {
      deletedByName: req.user.name,
      deletedByEmail: req.user.email
    }
  });
  res.status(200).json({
    success: true,
    message: "Book deleted successfully",
  });
});
export const updateBooks = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { title, author, description, price, quantity, genre } = req.body.updates;
  const book = await Book.findById(id);
  if (!book) {
    return next(new ErrorHandler("Book not found", 404));
  }
  if(title){
    book.title = title;
  }
  if(author){
    book.author = author;
  }
  if(description){
    book.description = description;
  }
  if(price){
    book.price = price;
  }
  if(quantity){
    book.quantity = quantity;
  }
  if(genre){
    book.genre = genre;
  }
  await book.save();
  await logAction({
    action: 'Book Updated',
    performedBy: req.user._id, 
    target: book._id,
    targetModel: 'Book',
    details: {
      updatedByName: req.user.name,
      updatedByEmail: req.user.email
    }
  });
  res.status(200).json({
    success: true,
    message: "Book updated successfully",
    book,
  });
});
export const getAllBooks = catchAsyncErrors(async (req, res, next) => {
  const books = await Book.find({});
  res.status(200).json({
    success: "true",
    books,
  });
});
