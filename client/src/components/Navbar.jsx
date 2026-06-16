import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const clickCount = useRef(0);
  const clickTimer = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { to: '/', label: 'Home' },
    { to: '/books', label: 'Books' },
    { to: '/about', label: 'About' },
    { to: '/blog', label: 'Journal' },
    { to: '/contact', label: 'Contact' },
  ];

  const handleLogoClick = (e) => {
    clickCount.current += 1;
    if (clickCount.current === 4) {
      e.preventDefault();
      clickCount.current = 0;
      clearTimeout(clickTimer.current);
      navigate('/admin/login');
      return;
    }
    clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 800);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-ink/95 backdrop-blur-md py-4 shadow-2xl' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            onClick={handleLogoClick}
            className="group relative"
          >
            <span className={`font-serif text-2xl lg:text-3xl font-bold tracking-tight transition-colors duration-300 ${
              scrolled || location.pathname !== '/' ? 'text-cream' : 'text-cream'
            }`}>
              Willson Kenedy
            </span>
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-warm transition-all duration-300 group-hover:w-full" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative text-sm uppercase tracking-[0.2em] font-medium transition-colors duration-300 ${
                  isActive(link.to) ? 'text-warm' : 'text-cream/70 hover:text-cream'
                }`}
              >
                {link.label}
                {isActive(link.to) && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-warm rounded-full" />
                )}
              </Link>
            ))}
            {user && (
              <Link 
                to="/admin" 
                className="text-xs uppercase tracking-[0.2em] text-gold/80 hover:text-gold transition-colors border border-gold/30 px-4 py-2 rounded-full hover:border-gold"
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button 
            className="lg:hidden relative w-8 h-8 flex flex-col justify-center items-center gap-1.5"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className={`block w-6 h-px bg-cream transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[3.5px]' : ''}`} />
            <span className={`block w-6 h-px bg-cream transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-px bg-cream transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[3.5px]' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 bg-ink transition-all duration-500 lg:hidden ${
        mobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {links.map((link, i) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`font-serif text-4xl text-cream hover:text-warm transition-all duration-300 ${
                mobileOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}