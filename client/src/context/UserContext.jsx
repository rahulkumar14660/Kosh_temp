import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import React from "react";
import { AuthContext } from "./AuthContext";
export const UserContext = createContext();
const UserProvider = ({ children }) => {
  const [activeLink, setActiveLink] = useState("");
  const [allBooks, setAllBooks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [userContextUpdated, setUserContextUpdated] = useState(false);
  const { user, isAdmin, isAuthenticated, refreshAuthContext } = useContext(AuthContext);
  const apiUrl = import.meta.env.VITE_API_URL
  useEffect(() => {
    if (!isAuthenticated) {
      setAllBooks([]);
      setAllUsers([]);
      setBorrows([]);
    }
  }, [isAuthenticated]);
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchBooks = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/v1/book/getAllBooks`, {
          withCredentials: true,
        });
        setAllBooks(res.data.books);
      } catch (error) {
        console.error(" Error fetching books:", error);
      }
    };
    fetchBooks();
  }, [isAuthenticated, userContextUpdated, refreshAuthContext]);
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!isAdmin(user, ["Admin", "Librarian", "Asset Manager"])) {
      return;
    }
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/v1/user/all`, {
          withCredentials: true,
        });
        setAllUsers(res.data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [isAuthenticated, userContextUpdated, refreshAuthContext]);
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchUserBorrows = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/v1/borrow/getBorrowedBooks`, {
          withCredentials: true,
        });
        setBorrows(res.data.borrows);
      } catch (error) {
        console.error("Error fetching borrows:", error);
      }
    };
    const fetchBorrows = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/v1/borrow/getAllBorrows`, {
          withCredentials: true,
        });
        setBorrows(res.data.borrows);
      } catch (error) {
        console.error(" Error fetching borrows:", error);
      }
    };
    if (!isAdmin(user, ["Admin", "Librarian"])) {
      fetchUserBorrows();
    } else {
      fetchBorrows();
    }
  }, [isAuthenticated, userContextUpdated, refreshAuthContext]);
  return <UserContext.Provider value={{ activeLink, setActiveLink, allBooks, allUsers, borrows, userContextUpdated, setUserContextUpdated }}>{children}</UserContext.Provider>;
};
export default UserProvider;
