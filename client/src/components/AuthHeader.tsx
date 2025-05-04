import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import '../styles/navbar.css';

const AuthHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  const isStaff = user.userType === 'staff';
  const isCustomer = user.userType === 'customer';

  // Check if a link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className={`navbar fixed top-0 left-0 right-0 z-50 h-16 flex items-center transition-all duration-300 ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          to={isStaff ? "/staff/dashboard" : "/customer/dashboard"}
          className="logo-container flex items-center space-x-2 text-xl font-bold shimmer"
        >
          <svg className="logo-icon w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="hidden sm:inline bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Auto Service Portal</span>
          <span className="sm:hidden bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ASP</span>
        </Link>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-2">
          <NotificationDropdown />

          <button
            className="p-2 rounded-md hover:bg-blue-50 transition-all duration-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className={`hamburger-icon ${isMobileMenuOpen ? 'open' : ''}`}>
              <span className="block w-6 h-0.5 bg-gray-600 mb-1.5 transition-transform"></span>
              <span className="block w-6 h-0.5 bg-gray-600 mb-1.5 transition-opacity"></span>
              <span className="block w-6 h-0.5 bg-gray-600 transition-transform"></span>
            </div>
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {isStaff && (
            <>
              <Link
                to="/staff/dashboard"
                className={`nav-link staggered-item staggered-item-1 ${isActive('/staff/dashboard') ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <Link
                to="/staff/appointments"
                className={`nav-link staggered-item staggered-item-2 ${isActive('/staff/appointments') ? 'active' : ''}`}
              >
                Appointments
              </Link>
              <Link
                to="/staff/schedule"
                className={`nav-link staggered-item staggered-item-3 ${isActive('/staff/schedule') ? 'active' : ''}`}
              >
                Schedule
              </Link>
              <Link
                to="/staff/reports"
                className={`nav-link staggered-item staggered-item-4 ${isActive('/staff/reports') ? 'active' : ''}`}
              >
                Reports
              </Link>
            </>
          )}

          {isCustomer && (
            <>
              <Link
                to="/customer/dashboard"
                className={`nav-link staggered-item staggered-item-1 ${isActive('/customer/dashboard') ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <Link
                to="/customer/vehicles"
                className={`nav-link staggered-item staggered-item-2 ${isActive('/customer/vehicles') ? 'active' : ''}`}
              >
                My Vehicles
              </Link>
              <Link
                to="/customer/appointments"
                className={`nav-link staggered-item staggered-item-3 ${isActive('/customer/appointments') ? 'active' : ''}`}
              >
                My Appointments
              </Link>
            </>
          )}

          {/* Notifications */}
          <NotificationDropdown />

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center px-3 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 focus:outline-none shadow-sm hover:shadow"
            >
              <div className="user-avatar w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold mr-2">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="mr-1 text-gray-700 font-medium">{user.name}</span>
              <svg className={`w-4 h-4 ml-1 text-gray-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className={`dropdown-menu absolute right-0 mt-2 w-56 glassmorphism rounded-lg py-2 z-10 ${isDropdownOpen ? 'show' : ''}`}>
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.userType}</p>
              </div>

              <Link
                to={`/${user.userType}/profile`}
                className="dropdown-item flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
              >
                <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </Link>

              <button
                onClick={handleLogout}
                className="dropdown-item flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className={`mobile-menu absolute top-16 right-0 left-0 glassmorphism shadow-lg md:hidden z-10 ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="flex flex-col p-4 space-y-3">
            {isStaff && (
              <>
                <Link
                  to="/staff/dashboard"
                  className={`flex items-center p-2 rounded-md transition-all duration-300 staggered-item staggered-item-1 ${isActive('/staff/dashboard') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </Link>
                <Link
                  to="/staff/appointments"
                  className={`flex items-center p-2 rounded-md transition-all duration-300 staggered-item staggered-item-2 ${isActive('/staff/appointments') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Appointments
                </Link>
                <Link
                  to="/staff/schedule"
                  className={`flex items-center p-2 rounded-md transition-all duration-300 staggered-item staggered-item-3 ${isActive('/staff/schedule') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Schedule
                </Link>
                <Link
                  to="/staff/reports"
                  className={`flex items-center p-2 rounded-md transition-all duration-300 staggered-item staggered-item-4 ${isActive('/staff/reports') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Reports
                </Link>
              </>
            )}

            {isCustomer && (
              <>
                <Link
                  to="/customer/dashboard"
                  className={`flex items-center p-2 rounded-md transition-all duration-300 staggered-item staggered-item-1 ${isActive('/customer/dashboard') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </Link>
                <Link
                  to="/customer/vehicles"
                  className={`flex items-center p-2 rounded-md transition-all duration-300 staggered-item staggered-item-2 ${isActive('/customer/vehicles') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  My Vehicles
                </Link>
                <Link
                  to="/customer/appointments"
                  className={`flex items-center p-2 rounded-md transition-all duration-300 staggered-item staggered-item-3 ${isActive('/customer/appointments') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  My Appointments
                </Link>
              </>
            )}

            <div className="border-t border-gray-200 pt-3 mt-2">
              <Link
                to={`/${user.userType}/profile`}
                className="flex items-center p-2 rounded-md text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 staggered-item staggered-item-4"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center w-full p-2 rounded-md text-left text-red-600 hover:bg-red-50 transition-all duration-300 staggered-item staggered-item-4"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AuthHeader;
