import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

const Navbar = ({ dark, setDark }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/95 px-4 py-3 backdrop-blur dark:bg-slate-900/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link to="/" className="text-xl font-bold text-brand-700">AuctionAI</Link>
        <div className="flex items-center gap-3 text-sm">
          <Link to="/">Home</Link>
          <Link to="/live">Live Auctions</Link>
          <Link to="/trending">Trending</Link>
          <Link to="/sell">Sell Item</Link>
          <Link to="/dashboard">Dashboard</Link>
          <ThemeToggle dark={dark} setDark={setDark} />
          {user ? (
            <>
              <span className="rounded bg-slate-200 px-2 py-1 dark:bg-slate-700">{user.name}</span>
              <button className="btn border" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
