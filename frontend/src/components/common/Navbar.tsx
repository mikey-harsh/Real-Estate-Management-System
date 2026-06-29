import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const navRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isMobileMenuOpen && navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);
  const [theme, setTheme] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
    return 'light';
  });

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 100], [0.8, 0.95]);
  const backdropBlur = useTransform(scrollY, [0, 100], ["blur(8px)", "blur(12px)"]);
  const isSellerAccount = (user?.role || '').toLowerCase() === 'seller';

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMobileMenu();
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/properties', label: 'Properties' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <motion.nav
      ref={navRef}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        backgroundColor: theme === 'dark'
          ? `rgba(28, 27, 26, ${bgOpacity.get()})`
          : `rgba(255, 255, 255, ${bgOpacity.get()})`,
        backdropFilter: backdropBlur
      }}
      className="sticky top-0 z-50 border-b border-[#E6D5C3] dark:border-gray-800 transition-colors duration-200"
    >
      <div className="max-w-[1280px] mx-auto px-8 flex items-center justify-between h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3" onClick={closeMobileMenu}>
          <img src="/logo.png" alt="Estate Management" className="h-9 w-auto" />
          <span className="font-fraunces text-2xl font-bold text-[#111827] dark:text-white">Estate Management</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`font-manrope transition-colors ${
                isActive(link.path)
                  ? 'text-[#2563EB] dark:text-blue-400 font-semibold'
                  : 'text-[#374151] hover:text-[#2563EB] dark:text-gray-300 dark:hover:text-blue-400'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[#374151] dark:text-gray-300 hover:text-[#2563EB] dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            <span className="font-material-icons text-xl">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {isAuthenticated && user ? (
            <>
              {isSellerAccount && (
                <>
                  <Link
                    to="/my-listings"
                    className={`font-manrope transition-colors ${
                      isActive('/my-listings')
                        ? 'text-[#2563EB] dark:text-blue-400 font-semibold'
                        : 'text-[#374151] hover:text-[#2563EB] dark:text-gray-300 dark:hover:text-blue-400'
                    }`}
                  >
                    My Listings
                  </Link>
                  <Link
                    to="/seller/requests"
                    className={`font-manrope transition-colors ${
                      isActive('/seller/requests')
                        ? 'text-[#2563EB] dark:text-blue-400 font-semibold'
                        : 'text-[#374151] hover:text-[#2563EB] dark:text-gray-300 dark:hover:text-blue-400'
                    }`}
                  >
                    Requests
                  </Link>
                  <Link
                    to="/add-property"
                    className="bg-[#2563EB] text-white font-manrope font-bold px-5 py-2 rounded-lg hover:bg-[#1D4ED8] transition-all hover:shadow-lg"
                  >
                    + List Property
                  </Link>
                </>
              )}
              <Link
                to="/appointments"
                className={`font-manrope transition-colors ${
                  isActive('/appointments')
                    ? 'text-[#2563EB] dark:text-blue-400 font-semibold'
                    : 'text-[#374151] hover:text-[#2563EB] dark:text-gray-300 dark:hover:text-blue-400'
                }`}
              >
                Appointments
              </Link>
              <Link
                to="/favorites"
                className={`font-manrope transition-colors ${
                  isActive('/favorites')
                    ? 'text-[#2563EB] dark:text-blue-400 font-semibold'
                    : 'text-[#374151] hover:text-[#2563EB] dark:text-gray-300 dark:hover:text-blue-400'
                }`}
              >
                Saved
              </Link>
              <button
                onClick={handleLogout}
                className="font-manrope font-semibold text-[#374151] hover:text-[#2563EB] dark:text-gray-300 dark:hover:text-blue-400 transition-colors px-4 py-2"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/signin"
                className="font-manrope font-semibold text-[#374151] hover:text-[#2563EB] dark:text-gray-300 dark:hover:text-blue-400 transition-colors px-4 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-[#2563EB] text-white font-manrope font-bold px-6 py-2 rounded-lg hover:bg-[#1D4ED8] transition-all hover:shadow-lg"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-[#374151] dark:text-gray-300 hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="font-material-icons text-2xl">
            {isMobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white dark:bg-[#1C1B1A] border-b border-[#E6D5C3] dark:border-gray-800 shadow-lg py-4 px-8 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`font-manrope text-lg py-2 transition-colors ${
                isActive(link.path)
                  ? 'text-[#2563EB] dark:text-blue-400 font-semibold'
                  : 'text-[#374151] hover:text-[#2563EB] dark:text-gray-300 dark:hover:text-blue-400'
              }`}
              onClick={closeMobileMenu}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-gray-100 dark:border-gray-800 my-2 pt-4 flex flex-col gap-4">
            {/* Mobile Theme Toggle */}
            <div className="flex items-center justify-between py-2">
              <span className="font-manrope text-sm text-[#374151] dark:text-gray-300">Theme</span>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-[#374151] dark:text-gray-300 hover:text-[#2563EB] dark:hover:text-blue-400 bg-gray-100 dark:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                <span className="font-material-icons text-xl">
                  {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                </span>
              </button>
            </div>

            {isAuthenticated && user ? (
              <>
                <span className="font-manrope text-sm text-[#374151] dark:text-gray-300">
                  Signed in as <span className="font-semibold">{user.name}</span>
                </span>
                {isSellerAccount && (
                  <>
                    <Link
                      to="/my-listings"
                      className="font-manrope font-semibold text-[#374151] hover:text-[#2563EB] dark:text-gray-300 dark:hover:text-blue-400 transition-colors py-2"
                      onClick={closeMobileMenu}
                    >
                      My Listings
                    </Link>
                    <Link
                      to="/add-property"
                      className="bg-[#2563EB] text-white font-manrope font-bold px-6 py-3 rounded-lg hover:bg-[#1D4ED8] transition-all hover:shadow-lg text-center"
                      onClick={closeMobileMenu}
                    >
                      + List Property
                    </Link>
                  </>
                )}
                <Link
                  to="/appointments"
                  className="font-manrope font-semibold text-[#374151] hover:text-[#2563EB] dark:text-gray-300 dark:hover:text-blue-400 transition-colors py-2"
                  onClick={closeMobileMenu}
                >
                  Appointments
                </Link>
                <Link
                  to="/favorites"
                  className="font-manrope font-semibold text-[#374151] hover:text-[#2563EB] dark:text-gray-300 dark:hover:text-blue-400 transition-colors py-2"
                  onClick={closeMobileMenu}
                >
                  Saved
                </Link>
                <button
                  onClick={handleLogout}
                  className="font-manrope font-semibold text-[#374151] hover:text-[#2563EB] dark:text-gray-300 dark:hover:text-blue-400 transition-colors py-2 text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="font-manrope font-semibold text-[#374151] hover:text-[#2563EB] dark:text-gray-300 dark:hover:text-blue-400 transition-colors py-2"
                  onClick={closeMobileMenu}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-[#2563EB] text-white font-manrope font-bold px-6 py-3 rounded-lg hover:bg-[#1D4ED8] transition-all hover:shadow-lg text-center"
                  onClick={closeMobileMenu}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </motion.nav>
  );
};

export default Navbar;