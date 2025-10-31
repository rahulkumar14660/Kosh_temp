import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import ChatWidget from "./components/ChatWidget";
const App = () => {
  return (
    <>
      <AppRoutes />
      <ChatWidget />
    </>
  );
};

export default App;
