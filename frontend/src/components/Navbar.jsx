import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

const Navbar = ({ dark, setDark }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/login");
  };

  const closeMenu = () => setOpen(false);

  const NavLinks = () => (
    <>
      <Link to="/" onClick={closeMenu}>Home</Link>
      <Link to="/live" onClick={closeMenu}>Live Auctions</Link>
      <Link to="/trending" onClick={closeMenu}>Trending</Link>
      <Link to="/sell" onClick={closeMenu}>Sell Item</Link>
      <Link to="/dashboard" onClick={closeMenu}>Dashboard</Link>
    </>
  );

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/95 px-3 py-3 backdrop-blur dark:bg-slate-900/95 sm:px-4">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="text-xl font-bold text-brand-700" onClick={closeMenu}>AuctionAI</Link>

          <div className="hidden items-center gap-3 text-sm md:flex">
            <NavLinks />
            <ThemeToggle dark={dark} setDark={setDark} />
            {user ? (
              <>
                <span className="max-w-28 truncate rounded bg-slate-200 px-2 py-1 dark:bg-slate-700">{user.name}</span>
                <button className="btn border" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>

          <button
            className="rounded-md border px-3 py-2 text-sm md:hidden"
            onClick={() => setOpen((p) => !p)}
            aria-label="Toggle menu"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>

        {open && (
          <div className="mt-3 space-y-3 rounded-xl border p-3 text-sm md:hidden">
            <div className="grid grid-cols-2 gap-3">
              <NavLinks />
            </div>
            <div className="flex items-center justify-between gap-2">
              <ThemeToggle dark={dark} setDark={setDark} />
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="max-w-24 truncate rounded bg-slate-200 px-2 py-1 dark:bg-slate-700">{user.name}</span>
                  <button className="btn border" onClick={handleLogout}>Logout</button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link to="/login" onClick={closeMenu}>Login</Link>
                  <Link to="/register" onClick={closeMenu}>Register</Link>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500">Current: {location.pathname}</p>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
