import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ChatbotWidget from "./components/ChatbotWidget";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import LiveAuctions from "./pages/LiveAuctions";
import AuctionDetail from "./pages/AuctionDetail";
import Trending from "./pages/Trending";
import SellItem from "./pages/SellItem";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className="min-h-screen">
      <Navbar dark={dark} setDark={setDark} />
      <main className="mx-auto max-w-6xl p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/live" element={<LiveAuctions />} />
          <Route path="/auctions/:id" element={<AuctionDetail />} />
          <Route path="/trending" element={<Trending />} />
          <Route
            path="/sell"
            element={
              <ProtectedRoute>
                <SellItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
}

export default App;
