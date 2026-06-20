import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const clickCount = useRef(0);
  const clickTimer = useRef(null);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

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
        scrolled || mobileOpen ? 'bg-ink/95 backdrop-blur-md py-3 sm:py-4 shadow-2xl' : 'bg-transparent py-4 sm:py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            onClick={handleLogoClick}
            className="group relative z-50"
          >
            <span className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-cream">
              Willson Kenedy
            </span>
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-warm transition-all duration-300 group-hover:w-full" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8 xl:gap-10">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative text-xs xl:text-sm uppercase tracking-[0.15em] xl:tracking-[0.2em] font-medium transition-colors duration-300 py-2 ${
                  isActive(link.to) ? 'text-warm' : 'text-cream/70 hover:text-cream'
                }`}
              >
                {link.label}
                {isActive(link.to) && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-warm rounded-full" />
                )}
              </Link>
            ))}
            {user && (
              <Link 
                to="/admin" 
                className="text-xs uppercase tracking-[0.2em] text-gold/80 hover:text-gold transition-colors border border-gold/30 px-3 xl:px-4 py-2 rounded-full hover:border-gold"
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* PERFECT X Hamburger / Close Button */}
          <button 
            className="lg:hidden relative z-50 w-14 h-14 flex items-center justify-center rounded-xl hover:bg-cream/10 transition-colors active:scale-95"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <div className="relative w-7 h-7 flex items-center justify-center">
              {/* Top line */}
              <span 
                className={`absolute block w-7 h-[3px] bg-cream rounded-full transition-all duration-300 ease-in-out ${
                  mobileOpen ? 'rotate-45' : '-translate-y-[8px]'
                }`} 
              />
              {/* Middle line */}
              <span 
                className={`absolute block w-7 h-[3px] bg-cream rounded-full transition-all duration-300 ease-in-out ${
                  mobileOpen ? 'opacity-0 scale-0' : ''
                }`} 
              />
              {/* Bottom line */}
              <span 
                className={`absolute block w-7 h-[3px] bg-cream rounded-full transition-all duration-300 ease-in-out ${
                  mobileOpen ? '-rotate-45' : 'translate-y-[8px]'
                }`} 
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-ink transition-all duration-500 lg:hidden flex flex-col ${
          mobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <div className="flex-1 flex flex-col items-center justify-center gap-6 sm:gap-8 px-6 pb-20 pt-24">
          {links.map((link, i) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`font-serif text-3xl sm:text-4xl text-cream hover:text-warm transition-all duration-300 ${
                mobileOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: `${i * 75}ms` }}
            >
              {link.label}
              {isActive(link.to) && (
                <span className="block w-2 h-2 bg-warm rounded-full mx-auto mt-2" />
              )}
            </Link>
          ))}
          
          {user && (
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className={`mt-4 text-sm uppercase tracking-[0.2em] text-gold/80 hover:text-gold transition-all duration-300 border border-gold/30 px-6 py-3 rounded-full hover:border-gold ${
                mobileOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: `${links.length * 75}ms` }}
            >
              Dashboard
            </Link>
          )}
        </div>

        <div className={`text-center pb-8 text-cream/20 text-xs uppercase tracking-wider transition-all duration-300 ${
          mobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`} style={{ transitionDelay: `${(links.length + 1) * 75}ms` }}>
          © 2026 Willson Kenedy
        </div>
      </div>
    </>
  );
}