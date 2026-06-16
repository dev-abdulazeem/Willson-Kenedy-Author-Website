import { useState } from 'react';
import api from '../api/axios';

// SVG Icons
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

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const GoodreadsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M11.43 23.67c-6.6 0-11.43-5.53-11.43-12.33S4.83 0 11.43 0C17.67 0 22 4.9 22 10.83c0 .62-.08 1.19-.25 1.7h.04c-.42 1.35-1.35 2.5-2.6 3.25-.5.31-1.06.54-1.67.68v.04c.25.08.5.17.73.29.46.25.88.58 1.25.98.37.4.67.88.88 1.42.21.54.33 1.13.35 1.75 0 .54-.08 1.06-.25 1.54-.17.48-.42.9-.73 1.27-.31.37-.69.67-1.13.9-.44.23-.94.35-1.48.35-.73 0-1.38-.21-1.94-.63-.56-.42-1.02-1.02-1.38-1.81-.33.77-.77 1.38-1.31 1.81-.54.44-1.19.65-1.94.65-.77 0-1.42-.23-1.94-.69-.52-.46-.94-1.08-1.25-1.87-.31.77-.73 1.38-1.25 1.83-.52.44-1.15.67-1.9.67z"/>
  </svg>
);

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', body: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const socialLinks = [
    { name: 'X', icon: <XIcon />, url: 'https://x.com/willsonkenedy', color: 'hover:bg-white hover:text-ink' },
    { name: 'Instagram', icon: <InstagramIcon />, url: 'https://instagram.com/willsonkenedy', color: 'hover:bg-gradient-to-br hover:from-purple-500 hover:via-pink-500 hover:to-yellow-500 hover:text-white' },
    { name: 'LinkedIn', icon: <LinkedInIcon />, url: 'https://linkedin.com', color: 'hover:bg-blue-700 hover:text-white' },
    { name: 'Goodreads', icon: <GoodreadsIcon />, url: 'https://goodreads.com', color: 'hover:bg-amber-700 hover:text-white' },
  ];

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim() || form.name.length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Valid email required';
    if (!form.body.trim() || form.body.length < 10) newErrors.body = 'Message must be at least 10 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      await api.post('/messages', form);
      setSent(true);
      setForm({ name: '', email: '', subject: '', body: '' });
      setErrors({});
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Failed to send. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const inputClasses = (field) => `
    w-full px-5 py-4 bg-parchment border rounded-lg text-ink placeholder:text-stone/50 
    focus:outline-none transition-all duration-300
    ${errors[field] 
      ? 'border-red-400 focus:ring-2 focus:ring-red-400/20' 
      : 'border-stone/10 focus:border-warm focus:ring-2 focus:ring-warm/20 hover:border-stone/30'
    }
  `;

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-ink text-cream pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-warm text-sm uppercase tracking-[0.3em] mb-4">Get in Touch</p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl">Contact</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-5 gap-16 lg:gap-20">
          {/* Info Side */}
          <div className="lg:col-span-2">
            <h2 className="font-serif text-3xl text-ink mb-6">Let's Connect</h2>
            <p className="text-stone leading-relaxed mb-12 text-lg">
              Whether you're a reader with thoughts to share, a fellow writer seeking collaboration, 
              or a publisher with an opportunity — I'd love to hear from you.
            </p>
            
            <div className="space-y-8">
              <div className="group">
                <p className="text-xs uppercase tracking-[0.2em] text-muted mb-2">Email</p>
                <a href="mailto:hello@willsonkenedy.com" className="text-ink text-lg group-hover:text-warm transition-colors">
                  hello@willsonkenedy.com
                </a>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted mb-2">Literary Agent</p>
                <p className="text-ink">Penguin Random House<br/>New York, NY 10019</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted mb-4">Follow</p>
                <div className="flex gap-3">
                  {socialLinks.map(social => (
                    <a 
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-12 h-12 rounded-full border border-stone/20 flex items-center justify-center text-stone hover:border-transparent hover:text-cream transition-all duration-300 ${social.color}`}
                      title={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="bg-parchment rounded-2xl p-12 lg:p-16 text-center border border-stone/10">
                <div className="w-20 h-20 bg-warm/10 rounded-full flex items-center justify-center mx-auto mb-8">
                  <svg className="w-10 h-10 text-warm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-serif text-3xl text-ink mb-3">Message Sent</h3>
                <p className="text-stone text-lg mb-8">Thank you for reaching out. I'll respond as soon as possible.</p>
                <button 
                  onClick={() => setSent(false)}
                  className="px-8 py-3 bg-ink text-cream rounded-lg font-medium hover:bg-charcoal transition-colors"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm">
                    {errors.submit}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.2em] text-muted mb-3">
                      Name <span className="text-warm">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => handleChange('name', e.target.value)}
                      className={inputClasses('name')}
                      placeholder="John Doe"
                    />
                    {errors.name && <p className="text-red-400 text-sm mt-2">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-[0.2em] text-muted mb-3">
                      Email <span className="text-warm">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => handleChange('email', e.target.value)}
                      className={inputClasses('email')}
                      placeholder="john@example.com"
                    />
                    {errors.email && <p className="text-red-400 text-sm mt-2">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-muted mb-3">Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={e => handleChange('subject', e.target.value)}
                    className={inputClasses('subject')}
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-muted mb-3">
                    Message <span className="text-warm">*</span>
                  </label>
                  <textarea
                    rows={6}
                    value={form.body}
                    onChange={e => handleChange('body', e.target.value)}
                    className={inputClasses('body')}
                    placeholder="Tell me your thoughts..."
                  />
                  <div className="flex justify-between mt-2">
                    {errors.body && <p className="text-red-400 text-sm">{errors.body}</p>}
                    <p className="text-muted text-xs ml-auto">{form.body.length} chars</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-ink text-cream rounded-lg font-medium hover:bg-charcoal transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
                >
                  {loading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}