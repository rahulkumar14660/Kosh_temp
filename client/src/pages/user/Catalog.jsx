import React, { useContext, useEffect, useState, useMemo } from "react";
import Sidebar from "../../components/layout/Sidebar";
import { UserContext } from "../../context/UserContext";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaSort, FaFilter, FaBook, FaUser, FaCalendarAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import "./Catalog.css";
const Receipt = ({ borrow, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 10000); 
    return () => clearTimeout(timer);
  }, [onClose]);
  const { book, user, borrowDate, returnDate, status, fine, price } = borrow;
  return (
    <motion.div 
      className="receipt-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="receipt-paper"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="bar"></div>
        <div className="receipt-header">
          <h2>Return Receipt</h2>
          <p>Library Management System</p>
        </div>
        <div className="receipt-line dashed"></div>
        <div className="receipt-body">
          <div className="receipt-row">
            <span>Book Title:</span>
            <span>{book.title}</span>
          </div>
          <div className="receipt-row">
            <span>Borrower:</span>
            <span>{user?.name}</span>
          </div>
          <div className="receipt-line"></div>
          <div className="receipt-row">
            <span>Borrowed:</span>
            <span>{new Date(borrowDate).toLocaleDateString()}</span>
          </div>
          <div className="receipt-row">
            <span>Returned:</span>
            <span>{new Date(returnDate).toLocaleDateString()}</span>
          </div>
          <div className="receipt-line dashed"></div>
          <div className="receipt-row total">
            <span>Fine: </span>
            <span>₹{fine}</span>
          </div>
          <div className="receipt-row total">
            <span>Price: </span>
            <span>₹{price}</span>
          </div>
        </div>
        <div className="receipt-footer">
          <p>Thank you!</p>
          <button onClick={onClose} className="receipt-close-btn">Close</button>
        </div>
      </motion.div>
    </motion.div>
  );
};
const BorrowCard = ({ borrow, onReturnClick }) => {
  const { user, isAdmin } = useContext(AuthContext);
  const isOverdue = !borrow.returnDate && new Date(borrow.dueDate) < new Date();
  let status = 'Due';
  let statusClass = 'due';
  if (borrow.returnDate) {
    status = 'Returned';
    statusClass = 'returned';
  } else if (isOverdue) {
    status = 'Overdue';
    statusClass = 'overdue';
  }
  return (
    <motion.div 
      className="borrow-card" 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card-book-info">
        <FaBook className="book-icon" />
        <div>
          <h4 className="book-title">{borrow?.book?.title || 'N/A'}</h4>
          <p className="book-author">by {borrow?.book?.author || 'N/A'}</p>
        </div>
      </div>
      {isAdmin(user, ["Admin", "Librarian"]) && (
        <div className="card-user-info">
          <FaUser className="user-icon" />
          <div>
            <p className="user-name">{borrow?.user?.name || 'N/A'}</p>
            <p className="user-email">{borrow?.user?.email || 'N/A'}</p>
          </div>
        </div>
      )}
      <div className="card-date-info">
        <div className="date-item">
          <FaCalendarAlt />
          <span>Borrowed: {new Date(borrow.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="date-item">
          <FaCalendarAlt />
          <span>Due: {new Date(borrow.dueDate).toLocaleDateString()}</span>
        </div>
      </div>
      <div className="card-footer">
        <span className={`status-pill ${statusClass}`}>{status}</span>
        {isAdmin(user, ["Admin", "Librarian"]) && !borrow.returnDate && (
          <button className="return-btn" onClick={() => onReturnClick(borrow)}>Return</button>
        )}
      </div>
    </motion.div>
  );
};
const Catalog = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { isAdmin } = useContext(AuthContext);
  const { borrows, setUserContextUpdated } = useContext(UserContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("due_date_asc");
  const [activeFilter, setActiveFilter] = useState("due");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBorrow, setSelectedBorrow] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const filteredAndSortedBorrows = useMemo(() => {
    let filtered = [...borrows];
    if (activeFilter === 'due') {
      filtered = filtered.filter(b => !b.returnDate);
    } else if (activeFilter === 'returned') {
      filtered = filtered.filter(b => b.returnDate);
    } else if (activeFilter === 'overdue') {
      filtered = filtered.filter(b => !b.returnDate && new Date(b.dueDate) < new Date());
    }
    if (searchTerm) {
      filtered = filtered.filter(b => 
        b?.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    switch(sortOrder) {
      case 'due_date_asc':
        filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        break;
      case 'due_date_desc':
        filtered.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
        break;
      case 'borrow_date_desc':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'borrow_date_asc':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      default:
        break;
    }
    return filtered;
  }, [borrows, activeFilter, searchTerm, sortOrder]);
  const handleReturnClick = (borrow) => {
    setSelectedBorrow(borrow);
    setIsModalOpen(true);
  };
  const handleConfirmReturn = async () => {
    if (!selectedBorrow) return;
    setIsLoading(true);
    try {
      const response = await axios.put(`${apiUrl}/api/v1/borrow/returnBook/${selectedBorrow.book._id}`, { email: selectedBorrow.user.email }, { withCredentials: true });
      setUserContextUpdated(prev => !prev);
      setReceiptData(response.data.borrow);
      setShowReceipt(true);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to return book:", err);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="catalog-layout">
      <Sidebar />
      <main className="catalog-main-content">
        <header className="catalog-header-new">
          <h1>Borrowed Books Log</h1>
          <div className="controls-wrapper">
            <div className="search-box">
              <FaSearch />
              <input 
                type="text" 
                placeholder="Search by book, user, or email..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-sort-controls">
              <div className="control-group">
                <label><FaFilter /> Filter by</label>
                <select value={activeFilter} onChange={e => setActiveFilter(e.target.value)}>
                  <option value="due">Due</option>
                  <option value="overdue">Overdue</option>
                  <option value="returned">Returned</option>
                  <option value="all">All</option>
                </select>
              </div>
              <div className="control-group">
                <label><FaSort /> Sort by</label>
                <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                  <option value="due_date_asc">Due Date (Soonest)</option>
                  <option value="due_date_desc">Due Date (Latest)</option>
                  <option value="borrow_date_desc">Borrow Date (Newest)</option>
                  <option value="borrow_date_asc">Borrow Date (Oldest)</option>
                </select>
              </div>
            </div>
          </div>
        </header>
        <AnimatePresence>
          <div className="borrows-grid">
            {filteredAndSortedBorrows.length > 0 ? (
              filteredAndSortedBorrows.map(borrow => (
                <BorrowCard key={borrow._id} borrow={borrow} onReturnClick={handleReturnClick} />
              ))
            ) : (
              <p className="no-results-message">No records match your criteria.</p>
            )}
          </div>
        </AnimatePresence>
        <AnimatePresence>
          {isModalOpen && (
            <motion.div 
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="modal-content"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
              >
                <h3>Confirm Return</h3>
                <p>Are you sure you want to mark this book as returned?</p>
                <div className="book-details">
                  <strong>Book:</strong> {selectedBorrow?.book?.title || 'N/A'}<br/>
                  <strong>User:</strong> {selectedBorrow?.user?.email || 'N/A'}
                </div>
                <div className="modal-actions">
                  <button className="btn-confirm" onClick={handleConfirmReturn} disabled={isLoading}>
                    {isLoading ? 'Processing...' : 'Yes, Return'}
                  </button>
                  <button className="btn-cancel" onClick={() => setIsModalOpen(false)} disabled={isLoading}>
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {showReceipt && receiptData && (
          <Receipt 
            borrow={receiptData} 
            onClose={() => setShowReceipt(false)} 
          />
        )}
      </main>
    </div>
  );
};
export default Catalog;
