import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import { Moon, Sun, LogOut, Layout, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <nav className="navbar navbar-expand-lg glass sticky-top py-3">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/">
          <div className="bg-primary p-2 rounded-3 text-white">
            <Layout size={20} />
          </div>
          <span>Taskora</span>
        </Link>

        <div className="d-flex align-items-center gap-3">
          <button 
            className="btn btn-link nav-link p-2 rounded-circle hover-bg" 
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {user ? (
            <div className="dropdown">
              <button 
                className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center gap-2 py-2 px-3 rounded-pill"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 24, height: 24, fontSize: 12 }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span>{user.name}</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2 p-2 rounded-4">
                <li>
                  <Link className="dropdown-item d-flex align-items-center gap-2 py-2 rounded-3" to="/profile">
                    <User size={16} />
                    Profile Settings
                  </Link>
                </li>
                <li><hr className="dropdown-divider opacity-50" /></li>
                <li>
                  <button className="dropdown-item d-flex align-items-center gap-2 py-2 rounded-3 text-danger" onClick={logout}>
                    <LogOut size={16} />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <div className="d-flex gap-2">
              <Link to="/login" className="btn btn-link nav-link">Login</Link>
              <Link to="/register" className="btn btn-primary rounded-pill px-4">Get Started</Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .hover-bg:hover {
          background-color: var(--bg-tertiary);
        }
        .navbar {
          border-bottom: 1px solid var(--border-color);
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
