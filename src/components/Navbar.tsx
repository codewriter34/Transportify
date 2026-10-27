import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/transportify-logo.png';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `${isActive ? 'text-blue-700 font-semibold' : 'text-gray-700 hover:text-blue-700'} px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200`;

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `${isActive ? 'text-blue-700 font-semibold bg-blue-50' : 'text-gray-700 hover:text-blue-700'} block px-3 py-2 rounded-md text-base font-medium`;

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 z-50 w-full transition-shadow ${scrolled ? 'bg-white/95 shadow-md backdrop-blur' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <NavLink to="/" end onClick={closeMenu} aria-label="Transportify" className="flex items-center">
            <img src={logo} alt="" className="h-8 w-auto" />
          </NavLink>

          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={linkClass}>Home</NavLink>
            <NavLink to="/features" className={linkClass}>Features</NavLink>
            <NavLink to="/about" className={linkClass}>About</NavLink>
            <NavLink to="/contact" className={linkClass}>Contact</NavLink>
            <a href="https://transportify-phi.vercel.app/admin/login" className="text-gray-700 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">Admin</a>
            <NavLink
              to="/track"
              className="ml-3 bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200"
            >
              Track a shipment
            </NavLink>
          </div>

          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white">
            <NavLink to="/" end className={mobileLinkClass} onClick={closeMenu}>Home</NavLink>
            <NavLink to="/features" className={mobileLinkClass} onClick={closeMenu}>Features</NavLink>
            <NavLink to="/about" className={mobileLinkClass} onClick={closeMenu}>About</NavLink>
            <NavLink to="/contact" className={mobileLinkClass} onClick={closeMenu}>Contact</NavLink>
            <a href="https://transportify-phi.vercel.app/admin/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-700">Admin</a>
            <NavLink
              to="/track"
              onClick={closeMenu}
              className="block text-center bg-lime-500 hover:bg-lime-600 text-white px-3 py-2 rounded-md text-base font-semibold"
            >
              Track a shipment
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
