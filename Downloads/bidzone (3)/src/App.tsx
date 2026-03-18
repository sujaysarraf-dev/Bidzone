import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { store } from "./store";
import { UserRole } from "./types";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Auctions from "./pages/Auctions";
import AuctionDetails from "./pages/AuctionDetails";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import InstitutionDashboard from "./pages/InstitutionDashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CreateAuction from "./pages/CreateAuction";
import ChatBot from "./components/ChatBot";

// Placeholder components for now
const NotFound = () => <div className="p-8"><h1>404 - Not Found</h1></div>;

export default function App() {
  const [user, setUser] = useState(store.getUser());

  useEffect(() => {
    // Basic listener for store changes (mocking auth state)
    const interval = setInterval(() => {
      const currentUser = store.getUser();
      if (JSON.stringify(currentUser) !== JSON.stringify(user)) {
        setUser(currentUser);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [user]);

  const renderDashboard = () => {
    if (!user) return <Navigate to="/login" />;
    switch (user.role) {
      case UserRole.ADMIN:
        return <AdminDashboard />;
      case UserRole.INSTITUTION:
        return <InstitutionDashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auctions" element={<Auctions />} />
            <Route path="/auctions/:id" element={<AuctionDetails />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/dashboard" element={renderDashboard()} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/institution" element={<InstitutionDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/create-auction" element={<CreateAuction />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
        <ChatBot />
      </div>
    </Router>
  );
}
