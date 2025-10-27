import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.middleware.js";
import { Book } from "../models/book.model.js";
import { Borrow } from "../models/borrow.model.js";
import { User } from "../models/user.model.js";
import { calculateFine } from "../utils/fineCalculator.js";
import { logAction } from "../utils/logAction.js";
export const recordBorrowBook = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { email } = req.body;
  const book = await Book.findById(id);
  if (!book) {
    return next(new ErrorHandler("Book not found", 404));
  }
  const user = await User.findOne({ email, accountVerified: true });
  if (!user) {
    return next(new ErrorHandler("User not found!", 404));
  }
  if (book.quantity === 0) {
    return next(new ErrorHandler("Book is out of stock", 400));
  }
  const populatedUser = await user.populate({
    path: "borrowedBooks.borrowId",
    populate: { path: "book" },
  });
  const isAlreadyBorrowed = populatedUser.borrowedBooks.find((b) => {
    return b.borrowId?.book?._id.toString() === id && b.returned === false;
  });
  if (isAlreadyBorrowed) {
    return next(new ErrorHandler("Book Already Borrowed"));
  }
  book.quantity -= 1;
  book.availability = book.quantity > 0;
  const borrow = await Borrow.create({
    user: user._id,
    price: book.price,
    book: book._id,
    borrowDate: Date.now(),
    dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });
  user.borrowedBooks.push({
    borrowId: borrow._id,
    returned: false,
  });
  await user.save();
  await book.save();
  await logAction({
    action: 'Book Borrowed',
    performedBy: user._id, 
    target: book._id,
    targetModel: 'Book',
    details: {
      borrowedByName: user.name,
      borrowedByEmail: user.email
    }
  });
  res.status(200).json({
    success: true,
    message: `${book.title} assigned successfully to ${user.name}`,
  });
});
export const returnBook = catchAsyncErrors(async (req, res, next) => {
  const { bookId } = req.params;
  const { email } = req.body;
  const book = await Book.findById(bookId);
  if (!book) {
    return next(new ErrorHandler("Book not found", 404));
  }
  const user = await User.findOne({ email, accountVerified: true });
  if (!user) {
    return next(new ErrorHandler("User not found!", 404));
  }
  const populatedUser = await user.populate({
    path: "borrowedBooks.borrowId",
    populate: { path: "book" },
  });
  const borrowedBook = populatedUser.borrowedBooks.find((b) => {
    return b.borrowId?.book?._id.toString() === bookId.toString() && b.returned === false;
  });
  if (!borrowedBook) {
    return next(new ErrorHandler("User has not borrowed this book", 400));
  }
  const borrowId = borrowedBook.borrowId;
  borrowedBook.returned = true;
  await user.save();
  book.quantity += 1;
  book.availability = book.quantity > 0;
  await book.save();
  const borrow = await Borrow.findById(borrowId);
  if (!borrow) {
    return next(new ErrorHandler("Borrow record not found", 400));
  }
  borrow.returnDate = Date.now();
  const fine = calculateFine(borrow.dueDate);
  borrow.fine = fine;
  await borrow.save();
  const populatedBorrow = await Borrow.findById(borrow._id).populate('user').populate('book');
  await logAction({
    action: 'Book Returned',
    performedBy: user._id, 
    target: book._id,
    targetModel: 'Book',
    details: {
      returnedByName: user.name,
      returnedByEmail: user.email
    }
  });
  res.status(200).json({
    success: true,
    message:
      fine != 0
        ? `${book.title} has been returned successfully. The total charges including a fine are ${fine + book.price}`
        : `${book.title} has been returned successfully. The total charges are ${book.price}`,
    fine,
    borrow: populatedBorrow,
  });
});
export const getBorrowedBooks = catchAsyncErrors(async (req, res, next) => {
  const borrows = await Borrow.find({ user: req.user._id }).populate('user').populate('book');
  res.status(200).json({
    success: true,
    borrows,
  });
});
export const getBorrowedBooksForAdmin = catchAsyncErrors(async (req, res, next) => {
  const borrows = await Borrow.find({}).populate("user").populate("book");
  res.status(200).json({
    success: true,
    borrows,
  });
});
