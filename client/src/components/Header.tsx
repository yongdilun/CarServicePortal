import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthHeader from './AuthHeader';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState({
    mobile: false,
    login: false,
    register: false
  });
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Close menus when location changes
  useEffect(() => {
    setIsMenuOpen({
      mobile: false,
      login: false,
      register: false
    });
  }, [location]);

  // If user is authenticated, show AuthHeader
  if (isAuthenticated) {
    return <AuthHeader />;
  }

  // Otherwise, show public header
  return (
    <header className="navbar guest-header fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-16 flex items-center">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link
          to="/"
          className="logo-container flex items-center space-x-2 text-xl font-bold"
        >
          <svg className="logo-icon w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="hidden sm:inline bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Auto Service Portal</span>
          <span className="sm:hidden bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ASP</span>
        </Link>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-blue-50 transition-all duration-300"
          onClick={() => setIsMenuOpen(prev => ({ ...prev, mobile: !prev.mobile }))}
          aria-label="Toggle menu"
        >
          <div className={`hamburger-icon ${isMenuOpen.mobile ? 'open' : ''}`}>
            <span className="block w-6 h-0.5 bg-gray-600 mb-1.5 transition-transform"></span>
            <span className="block w-6 h-0.5 bg-gray-600 mb-1.5 transition-opacity"></span>
            <span className="block w-6 h-0.5 bg-gray-600 transition-transform"></span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>

          <div className="relative group">
            <button
              className="nav-link flex items-center focus:outline-none"
              onClick={() => setIsMenuOpen(prev => ({ ...prev, login: !prev.login, register: false }))}
              aria-expanded={isMenuOpen.login}
              aria-haspopup="true"
            >
              <span>Login</span>
              <svg className={`w-4 h-4 ml-1 transition-transform ${isMenuOpen.login ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              className={`dropdown-menu glassmorphism absolute left-0 mt-2 w-56 rounded-md py-1 z-10 ${
                isMenuOpen.login ? 'show' : ''
              }`}
            >
              <Link to="/login/customer" className="dropdown-item flex items-center px-4 py-3 text-sm text-gray-700">
                <svg className="w-5 h-5 mr-3 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Customer Login
              </Link>
              <Link to="/login/staff" className="dropdown-item flex items-center px-4 py-3 text-sm text-gray-700">
                <svg className="w-5 h-5 mr-3 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Staff Login
              </Link>
            </div>
          </div>

          <div className="relative group">
            <button
              className="nav-link flex items-center focus:outline-none"
              onClick={() => setIsMenuOpen(prev => ({ ...prev, register: !prev.register, login: false }))}
              aria-expanded={isMenuOpen.register}
              aria-haspopup="true"
            >
              <span>Register</span>
              <svg className={`w-4 h-4 ml-1 transition-transform ${isMenuOpen.register ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              className={`dropdown-menu glassmorphism absolute left-0 mt-2 w-56 rounded-md py-1 z-10 ${
                isMenuOpen.register ? 'show' : ''
              }`}
            >
              <Link to="/register/customer" className="dropdown-item flex items-center px-4 py-3 text-sm text-gray-700">
                <svg className="w-5 h-5 mr-3 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Customer Registration
              </Link>
              <Link to="/register/staff" className="dropdown-item flex items-center px-4 py-3 text-sm text-gray-700">
                <svg className="w-5 h-5 mr-3 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Staff Registration
              </Link>
            </div>
          </div>


        </nav>

        {/* Mobile Navigation */}
        <div
          className={`fixed inset-0 bg-gray-800 bg-opacity-75 z-40 md:hidden transition-opacity duration-300 ${
            isMenuOpen.mobile ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsMenuOpen(prev => ({ ...prev, mobile: false }))}
        ></div>

        <div
          className={`fixed top-0 right-0 bottom-0 w-64 glassmorphism z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
            isMenuOpen.mobile ? 'translate-x-0 slide-in-right' : 'translate-x-full'
          }`}
        >
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Menu</h2>
            <button
              className="p-2 rounded-md hover:bg-gray-100"
              onClick={() => setIsMenuOpen(prev => ({ ...prev, mobile: false }))}
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="p-4">
            <ul className="space-y-2">
              <li className="staggered-item staggered-item-1">
                <Link
                  to="/"
                  className="flex items-center p-3 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all duration-300"
                  onClick={() => setIsMenuOpen(prev => ({ ...prev, mobile: false }))}
                >
                  <svg className="w-5 h-5 mr-3 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Home
                </Link>
              </li>

              <li className="pt-2 border-t staggered-item staggered-item-2">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Login</h3>
                <ul className="mt-2 space-y-1">
                  <li>
                    <Link
                      to="/login/customer"
                      className="flex items-center p-3 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all duration-300"
                      onClick={() => setIsMenuOpen(prev => ({ ...prev, mobile: false }))}
                    >
                      <svg className="w-5 h-5 mr-3 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Customer Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/login/staff"
                      className="flex items-center p-3 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all duration-300"
                      onClick={() => setIsMenuOpen(prev => ({ ...prev, mobile: false }))}
                    >
                      <svg className="w-5 h-5 mr-3 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Staff Login
                    </Link>
                  </li>
                </ul>
              </li>

              <li className="pt-2 border-t staggered-item staggered-item-3">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Register</h3>
                <ul className="mt-2 space-y-1">
                  <li>
                    <Link
                      to="/register/customer"
                      className="flex items-center p-3 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all duration-300"
                      onClick={() => setIsMenuOpen(prev => ({ ...prev, mobile: false }))}
                    >
                      <svg className="w-5 h-5 mr-3 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Customer Registration
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/register/staff"
                      className="flex items-center p-3 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all duration-300"
                      onClick={() => setIsMenuOpen(prev => ({ ...prev, mobile: false }))}
                    >
                      <svg className="w-5 h-5 mr-3 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Staff Registration
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
