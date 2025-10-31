import React, { useContext, useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import { UserContext } from "../../context/UserContext";
import "./Books.css";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const Books = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { user, isAdmin } = useContext(AuthContext);
  const { allBooks, setUserContextUpdated } = useContext(UserContext);
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [sortOrder, setSortOrder] = useState("Oldest");

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReadModal, setShowReadModal] = useState(false);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [email, setEmail] = useState("");
  const [newBook, setNewBook] = useState({ availability: true });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div className="book-title-cell">
          {record.coverImage ? (
            <img src={record.coverImage} alt={record.title} className="book-cover-thumbnail" />
          ) : (
            <div className="book-cover-placeholder">
              {record?.title?.[0]?.toUpperCase() || 'B'}
            </div>
          )}
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      render: (text) => text || 'N/A',
    },
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      key: 'isbn',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Available',
      dataIndex: 'availability',
      key: 'availability',
      render: (isAvailable) => (
        <span className={`status-badge ${isAvailable ? "available" : "unavailable"}`}>
          {isAvailable ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="action-buttons">
          <button 
            onClick={() => handleViewDetails(record)}
            className="action-btn view-btn"
          >
            <FaEye />
          </button>
          {isAdmin(user, ["Admin", "Librarian"]) && (
            <>
              <button 
                onClick={() => handleEdit(record)}
                className="action-btn edit-btn"
              >
                <FaEdit />
              </button>
              <button 
                onClick={() => handleDelete(record)}
                className="action-btn delete-btn"
                disabled={!record?.availability}
              >
                <FaTrash />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  useEffect(() => {
    setBooks(allBooks);
    setFilteredBooks(allBooks);
  }, [allBooks]);

  const handleSearch = (e) => {
    const search = e.target.value.toLowerCase();
    if (!search) return setFilteredBooks(books);

    const filtered = books.filter((book) => book.title.toLowerCase().includes(search));
    setFilteredBooks(filtered);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortOrder(value);

    const sorted = [...filteredBooks].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return value === "Newest" ? dateB - dateA : dateA - dateB;
    });

    setFilteredBooks(sorted);
  };

  const handleAssignClick = (book) => {
    setSelectedBook(book);
    setShowAssignModal(true);
  };

  const handleReadClick = (book) => {
    setSelectedBook(book);
    setShowReadModal(true);
  };

  const handleAssignSubmit = () => {
    setMessage("Please Wait...");
    setError("");
    axios
      .post(`${apiUrl}/api/v1/borrow/recordBorrowBook/${selectedBook._id}`, { email: email }, { withCredentials: true })
      .then((res) => {
        setUserContextUpdated((prev) => !prev);
        setMessage("");
        setError("");
        setShowAssignModal(false);
        setEmail("");
      })
      .catch((err) => {
        setMessage("");
        setError(err.response.data.message);
      });
  };

  const handleAddBookInputChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === "availability") {
      setNewBook({ ...newBook, [name]: checked });
    } else {
      setNewBook({ ...newBook, [name]: value });
    }
  };

  const handleCreateNewBook = (e) => {
    e.preventDefault();
    axios
      .post(`${apiUrl}/api/v1/book/admin/addBooks`, newBook, { withCredentials: true })
      .then((res) => {
        setUserContextUpdated((prev) => !prev);
        setShowAddBookModal(false);
      })
      .catch((err) => {});
  };
  return (
    <div className="books-container">
      <Sidebar />
      <main className="books-main-content">
        <header className="books-header">
          <h2>Books Collection</h2>
          <div className="books-controls">
            {isAdmin(user, ["Admin", "Librarian"]) && (
              <button className="add-book-btn" onClick={() => setShowAddBookModal(true)}>
                Add Book
              </button>
            )}
            {showAddBookModal && (
              <div className="books-modal-overlay">
                <div className="books-modal">
                  <h3>Add Book</h3>
                  <form onSubmit={handleCreateNewBook}>
                    <input type="text" autoFocus name="title" required placeholder="Title" onChange={handleAddBookInputChange} />
                    <input type="text" name="author" required placeholder="Author" onChange={handleAddBookInputChange} />
                    <input type="text" name="genre" required placeholder="Genre" onChange={handleAddBookInputChange} />
                    <textarea name="description" required placeholder="Description" onChange={handleAddBookInputChange} />
                    <input type="number" name="price" required placeholder="Price" onChange={handleAddBookInputChange} />
                    <input type="number" name="quantity" required placeholder="Quantity" onChange={handleAddBookInputChange} />
                    <div className="checkbox">
                      <label htmlFor="available">Book Available</label>
                      <input type="checkbox" name="availability" defaultChecked id="available" onChange={handleAddBookInputChange} />
                    </div>

                    <div className="books-modal-buttons">
                      <button>Create</button>
                      <button
                        className="cancel"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowAddBookModal(false);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            <div className="books-search">
              <input type="text" placeholder="Search books..." onChange={handleSearch} />
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>

            <select value={sortOrder} onChange={handleSortChange} className="books-select">
              <option value="Newest">Newest</option>
              <option value="Oldest">Oldest</option>
            </select>
          </div>
        </header>

        <section className="books-section">
          <div className="table-container">
            <table className="books-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Genre</th>
                  <th>Price</th>
                  {isAdmin(user, ["Admin", "Librarian"]) && <th>Qt. Left</th>}
                  <th>Available</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book, index) => (
                  <tr key={index}>
                    <td>
                      {book.title.slice(0, 25)}
                      {book.title.length >= 25 && "..."}
                    </td>
                    <td>{book.author}</td>
                    <td>{book.genre}</td>
                    <td>₹{book.price}</td>
                    {isAdmin(user, ["Admin", "Librarian"]) && <td className="quantity-left">{book.quantity}</td>}
                    <td>
                      <span className={`status-badge ${book.availability ? "active" : "overdue"}`}>{book.availability ? "Yes" : "No"}</span>
                    </td>
                    <td>
                      <div className="books-actions">
                        <button
                          onClick={() => {
                            handleReadClick(book);
                          }}
                        >
                          Read
                        </button>
                        {isAdmin(user, ["Admin", "Librarian"]) && <button onClick={() => handleAssignClick(book)}>Assign</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        {showReadModal && (
          <div className="books-modal-overlay">
            <div className="books-modal read-modal">
              <h3>{selectedBook.title}</h3>

              <div className="book-details">
                <p className="book-description">{selectedBook.description}</p>

                <p>
                  <strong>Author:</strong> {selectedBook.author}
                </p>
                <p>
                  <strong>Price:</strong> ₹{selectedBook.price}
                </p>
              </div>

              <div className="books-modal-buttons">
                <button onClick={() => setShowReadModal(false)}>Go Back</button>
              </div>
            </div>
          </div>
        )}

        {showAssignModal && (
          <div className="books-modal-overlay">
            <div className="books-modal">
              <h3>Assign Book</h3>
              <p>
                Enter the user's email to assign <strong>{selectedBook?.title}</strong>:
              </p>
              <input
                type="email"
                placeholder="User email"
                autoFocus
                value={email}
                onChange={(e) => {
                  setMessage("");
                  setError("");
                  setEmail(e.target.value);
                }}
              />
              {error !== "" && <p className="error">{error}</p>}
              {message !== "" && <p className="message" style={{"color": "#16a34a"}}>{message}</p>}
              <div className="books-modal-buttons">
                <button onClick={handleAssignSubmit}>Assign</button>
                <button className="cancel" onClick={() => setShowAssignModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Books;
