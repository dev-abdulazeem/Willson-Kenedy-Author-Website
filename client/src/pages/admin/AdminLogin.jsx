import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(username, password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 border border-cream/[0.03] rounded-full animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 border border-cream/[0.03] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-cream/[0.02] rounded-full" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl text-cream mb-3 tracking-tight">Willson Kenedy</h1>
          <p className="text-cream/40 text-sm uppercase tracking-[0.3em]">Author Dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-charcoal/50 backdrop-blur rounded-2xl p-8 md:p-10 border border-cream/10 shadow-2xl shadow-black/50">
          <h2 className="font-serif text-2xl text-cream mb-2">Welcome Back</h2>
          <p className="text-cream/40 text-sm mb-8">Enter your credentials to access the dashboard.</p>

          {error && (
            <div className="bg-warm/10 border border-warm/20 text-warm px-4 py-3 rounded-lg mb-6 text-sm animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-cream/50 mb-3">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-5 py-4 bg-ink border border-cream/10 rounded-lg text-cream placeholder:text-cream/20 focus:border-warm focus:outline-none transition-all hover:border-cream/20"
                placeholder="Enter username"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-cream/50 mb-3">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-ink border border-cream/10 rounded-lg text-cream placeholder:text-cream/20 focus:border-warm focus:outline-none transition-all hover:border-cream/20"
                placeholder="Enter password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-warm text-cream rounded-lg font-medium hover:bg-warm/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>Sign In <span className="group-hover:translate-x-1 transition-transform">→</span></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-8">
          <button 
            onClick={() => navigate('/')}
            className="text-cream/30 hover:text-cream/60 text-sm transition-colors flex items-center gap-2 mx-auto group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Website
          </button>
        </p>
      </div>
    </div>
  );
}