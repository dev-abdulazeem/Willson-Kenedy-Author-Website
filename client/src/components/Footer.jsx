import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/subscribers', { email });
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      alert(err.response?.data?.message || 'Already subscribed or error occurred');
    } finally {
      setLoading(false);
    }
  };

  // SVG Icons - sized for touch targets
  const XIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );

  const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );

  const GoodreadsIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M11.43 23.67c-6.6 0-11.43-5.53-11.43-12.33S4.83 0 11.43 0C17.67 0 22 4.9 22 10.83c0 .62-.08 1.19-.25 1.7h.04c-.42 1.35-1.35 2.5-2.6 3.25-.5.31-1.06.54-1.67.68v.04c.25.08.5.17.73.29.46.25.88.58 1.25.98.37.4.67.88.88 1.42.21.54.33 1.13.35 1.75 0 .54-.08 1.06-.25 1.54-.17.48-.42.9-.73 1.27-.31.37-.69.67-1.13.9-.44.23-.94.35-1.48.35-.73 0-1.38-.21-1.94-.63-.56-.42-1.02-1.02-1.38-1.81-.33.77-.77 1.38-1.31 1.81-.54.44-1.19.65-1.94.65-.77 0-1.42-.23-1.94-.69-.52-.46-.94-1.08-1.25-1.87-.31.77-.73 1.38-1.25 1.83-.52.44-1.15.67-1.9.67z"/>
    </svg>
  );

  const socialLinks = [
    { name: 'X', icon: <XIcon />, url: 'https://x.com/willsonkenedy', color: 'hover:bg-white hover:text-ink' },
    { name: 'Instagram', icon: <InstagramIcon />, url: 'https://instagram.com/willsonkenedy', color: 'hover:bg-gradient-to-br hover:from-purple-500 hover:via-pink-500 hover:to-yellow-500 hover:text-white' },
    { name: 'Goodreads', icon: <GoodreadsIcon />, url: 'https://goodreads.com', color: 'hover:bg-amber-700 hover:text-white' },
  ];

  return (
    <footer className="bg-ink text-cream/50">
      {/* Newsletter Strip */}
      <div className="border-b border-cream/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-10">
            <div className="text-center lg:text-left w-full lg:w-auto">
              <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-cream mb-2 sm:mb-3">Stay in the Story</h3>
              <p className="text-cream/40 text-base sm:text-lg">New releases, essays, and behind-the-scenes.</p>
            </div>
            
            {subscribed ? (
              <div className="bg-warm/10 border border-warm/20 rounded-xl px-6 sm:px-8 py-4 text-center w-full sm:w-auto animate-fade-in">
                <p className="text-warm font-medium text-sm sm:text-base">✓ You're subscribed!</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full sm:w-72 lg:w-80 px-4 sm:px-5 py-3.5 sm:py-4 bg-charcoal border border-cream/10 rounded-lg text-cream placeholder:text-cream/20 focus:border-warm focus:outline-none transition-colors text-sm sm:text-base"
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-6 sm:px-8 py-3.5 sm:py-4 bg-warm text-cream rounded-lg font-medium hover:bg-warm/90 transition-colors whitespace-nowrap text-sm sm:text-base disabled:opacity-50 active:scale-95"
                >
                  {loading ? '...' : 'Subscribe'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-12 lg:gap-20">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="font-serif text-xl sm:text-2xl text-cream mb-3 sm:mb-4">Willson Kenedy</h4>
            <p className="text-sm leading-relaxed text-cream/40 mb-6 sm:mb-8 max-w-xs">
              Crafting stories that resonate across generations. 
              Every word is a bridge between imagination and truth.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(social => (
                <a 
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-12 h-12 rounded-full border border-cream/20 flex items-center justify-center text-cream/50 hover:border-transparent hover:text-cream transition-all duration-300 min-h-[48px] min-w-[48px] ${social.color}`}
                  title={social.name}
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-xs uppercase tracking-[0.2em] text-cream/30 mb-4 sm:mb-6">Explore</h5>
            <div className="space-y-3 sm:space-y-4">
              {[
                { to: '/books', label: 'All Books' },
                { to: '/about', label: 'About the Author' },
                { to: '/blog', label: 'Journal' },
                { to: '/contact', label: 'Get in Touch' },
              ].map(link => (
                <Link 
                  key={link.to}
                  to={link.to} 
                  className="block text-cream/50 hover:text-warm transition-colors text-sm py-1"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h5 className="text-xs uppercase tracking-[0.2em] text-cream/30 mb-4 sm:mb-6">Contact</h5>
            <div className="space-y-3 sm:space-y-4 text-sm text-cream/50">
              <a href="mailto:hello@willsonkenedy.com" className="block hover:text-cream transition-colors py-1">
                hello@willsonkenedy.com
              </a>
              <p className="leading-relaxed">
                Literary Agency<br/>
                New York, NY 10019
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-cream/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-cream/20">
          <p className="text-center sm:text-left">© 2024 Willson Kenedy. All rights reserved.</p>
          <div className="flex gap-4 sm:gap-6">
            <span className="hover:text-cream/40 cursor-pointer transition-colors py-1">Privacy Policy</span>
            <span className="hover:text-cream/40 cursor-pointer transition-colors py-1">Terms of Use</span>
          </div>
        </div>
      </div>
    </footer>
  );
}