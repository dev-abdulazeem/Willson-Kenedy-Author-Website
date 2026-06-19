import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

// Animated counter hook
function useCountUp(end, duration = 1500) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (end === 0) { setCount(0); return; }
    
    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      countRef.current = Math.floor(easeOut * end);
      setCount(countRef.current);
      
      if (progress < 1) requestAnimationFrame(animate);
    };
    
    startTimeRef.current = null;
    requestAnimationFrame(animate);
  }, [end, duration]);

  return count;
}

// Skeleton components
function StatCardSkeleton() {
  return (
    <div className="bg-charcoal rounded-xl p-6 lg:p-8 border border-cream/5 animate-pulse">
      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-cream/5 rounded-lg mb-4" />
      <div className="h-8 lg:h-10 bg-cream/5 rounded w-16 mb-2" />
      <div className="h-3 bg-cream/5 rounded w-20" />
    </div>
  );
}

function ActionCardSkeleton() {
  return (
    <div className="bg-charcoal rounded-xl p-6 border border-cream/5 animate-pulse">
      <div className="w-8 h-8 bg-cream/5 rounded-lg mb-4" />
      <div className="h-5 bg-cream/5 rounded w-32 mb-2" />
      <div className="h-3 bg-cream/5 rounded w-24" />
    </div>
  );
}

function MessageRowSkeleton() {
  return (
    <div className="px-6 py-4 flex items-center justify-between animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-2 h-2 rounded-full bg-cream/5" />
        <div>
          <div className="h-4 bg-cream/5 rounded w-24 mb-1" />
          <div className="h-3 bg-cream/5 rounded w-48" />
        </div>
      </div>
      <div className="h-3 bg-cream/5 rounded w-16" />
    </div>
  );
}

// Animated stat card
function StatCard({ label, count, icon, color, path, delay }) {
  const animatedCount = useCountUp(count);
  const [hovered, setHovered] = useState(false);

  return (
    <Link 
      to={path}
      className="bg-charcoal rounded-xl p-6 lg:p-8 hover:bg-charcoal/80 transition-all group border border-cream/5 hover:border-warm/30 relative overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hover glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br from-warm/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      <div className="relative z-10">
        <div className={`w-10 h-10 lg:w-12 lg:h-12 ${color} rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
          {icon}
        </div>
        <p className="font-serif text-3xl lg:text-4xl text-cream mb-1 tabular-nums">
          {animatedCount}
        </p>
        <p className="text-cream/40 text-xs uppercase tracking-[0.2em] group-hover:text-warm transition-colors duration-300">
          {label}
        </p>
      </div>
      
      {/* Corner accent */}
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-${color.replace('bg-', '')}/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity`} />
    </Link>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ books: 0, posts: 0, subscribers: 0, messages: 0 });
  const [recentMessages, setRecentMessages] = useState([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) { 
      navigate('/admin/login'); 
      return; 
    }
    fetchStats();
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      const [books, posts, subscribers, messages] = await Promise.all([
        api.get('/books/admin/all').catch(() => ({ data: [] })),
        api.get('/posts/admin/all').catch(() => ({ data: [] })),
        api.get('/subscribers').catch(() => ({ data: [] })),
        api.get('/messages').catch(() => ({ data: [] })),
      ]);
      setStats({
        books: books.data.length,
        posts: posts.data.length,
        subscribers: subscribers.data.length,
        messages: messages.data.length,
      });
      setRecentMessages(messages.data.slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (!user) return null;

  const cards = [
    { label: 'Books', count: stats.books, icon: '📚', color: 'bg-warm', path: '/admin/books' },
    { label: 'Posts', count: stats.posts, icon: '📝', color: 'bg-amber-600', path: '/admin/posts' },
    { label: 'Subscribers', count: stats.subscribers, icon: '✉️', color: 'bg-emerald-600', path: '/admin/subscribers' },
    { label: 'Messages', count: stats.messages, icon: '💬', color: 'bg-sky-600', path: '#' },
  ];

  const quickActions = [
    { label: 'Add New Book', desc: 'Publish a new title', path: '/admin/books', icon: '+', color: 'group-hover:text-warm group-hover:bg-warm/20' },
    { label: 'Write Journal Entry', desc: 'Create blog post', path: '/admin/posts', icon: '✎', color: 'group-hover:text-amber-400 group-hover:bg-amber-400/20' },
    { label: 'Edit Site Content', desc: 'Update hero & about', path: '/admin/site', icon: '⚙', color: 'group-hover:text-emerald-400 group-hover:bg-emerald-400/20' },
    { label: 'View Subscribers', desc: 'Email list', path: '/admin/subscribers', icon: '👥', color: 'group-hover:text-sky-400 group-hover:bg-sky-400/20' },
  ];

  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ink text-cream">
        <header className="bg-charcoal border-b border-cream/10 px-6 lg:px-12 py-5">
          <div className="flex items-center gap-6">
            <div className="h-7 bg-cream/5 rounded w-24" />
            <div className="hidden md:block h-4 bg-cream/5 rounded w-32" />
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
          <div className="mb-8">
            <div className="h-4 bg-cream/5 rounded w-48 mb-2" />
            <div className="h-8 bg-cream/5 rounded w-64" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12">
            {[1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)}
          </div>

          <div className="h-4 bg-cream/5 rounded w-32 mb-6" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[1, 2, 3, 4].map(i => <ActionCardSkeleton key={i} />)}
          </div>

          <div className="h-4 bg-cream/5 rounded w-32 mb-6" />
          <div className="bg-charcoal rounded-xl border border-cream/5 overflow-hidden">
            {[1, 2, 3].map(i => <MessageRowSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-cream">
      {/* Header */}
      <header className="bg-charcoal border-b border-cream/10 px-6 lg:px-12 py-5 flex items-center justify-between sticky top-0 z-30 backdrop-blur-xl bg-charcoal/90">
        <div className="flex items-center gap-6">
          <h1 className="font-serif text-2xl tracking-tight">Dashboard</h1>
          <span className="hidden md:inline text-cream/20 text-sm">|</span>
          <div className="hidden md:flex flex-col">
            <span className="text-cream/40 text-sm">{greeting()}, <span className="text-cream/60">{user.username}</span></span>
            <span className="text-cream/20 text-xs">{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/" 
            className="text-sm text-cream/40 hover:text-cream transition-colors px-4 py-2 rounded-lg hover:bg-cream/5 flex items-center gap-2"
          >
            <span>↗</span> View Site
          </Link>
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="text-sm text-warm hover:text-cream transition-colors px-5 py-2 rounded-lg bg-warm/10 hover:bg-warm/20 border border-warm/20 hover:border-warm/40"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-charcoal rounded-2xl p-8 max-w-sm w-full mx-6 shadow-2xl border border-cream/10 transform scale-100 animate-modal-in">
            <div className="w-12 h-12 rounded-full bg-warm/10 flex items-center justify-center text-2xl mb-4 mx-auto">
              👋
            </div>
            <h3 className="font-serif text-2xl text-cream mb-2 text-center">Sign Out?</h3>
            <p className="text-cream/50 mb-6 text-center text-sm">Are you sure you want to log out of your dashboard?</p>
            <div className="flex gap-3">
              <button 
                onClick={handleLogout}
                className="flex-1 py-3 bg-warm text-cream rounded-lg font-medium hover:bg-warm/90 transition-all hover:scale-105 active:scale-95"
              >
                Yes, Logout
              </button>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 bg-cream/5 text-cream/70 rounded-lg font-medium hover:bg-cream/10 hover:text-cream transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        {/* Welcome Section */}
        <div className="mb-10 animate-fade-in">
          <p className="text-cream/30 text-sm uppercase tracking-[0.2em] mb-2">Overview</p>
          <h2 className="font-serif text-3xl lg:text-4xl text-cream">
            {greeting()}, <span className="text-warm">{user.username}</span>
          </h2>
          <p className="text-cream/30 text-sm mt-2">Here's what's happening with your site today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12">
          {cards.map((card, i) => (
            <StatCard key={card.label} {...card} delay={i * 100} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl text-cream/70 uppercase tracking-[0.2em] text-xs">Quick Actions</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, i) => (
              <Link 
                key={action.label}
                to={action.path}
                className="bg-charcoal rounded-xl p-6 hover:bg-charcoal/80 transition-all group border border-cream/5 hover:border-cream/15 relative overflow-hidden"
                style={{ animationDelay: `${i * 75}ms` }}
              >
                <div className={`w-10 h-10 rounded-lg bg-cream/5 flex items-center justify-center text-cream/50 mb-4 transition-all duration-300 ${action.color}`}>
                  <span className="text-lg">{action.icon}</span>
                </div>
                <h3 className="font-medium text-cream mb-1 group-hover:text-warm transition-colors duration-300">{action.label}</h3>
                <p className="text-cream/30 text-sm">{action.desc}</p>
                
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <span className="text-warm text-lg">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Messages */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="font-serif text-xl text-cream/70 uppercase tracking-[0.2em] text-xs">Recent Messages</h2>
              {stats.messages > 0 && (
                <span className="px-2 py-0.5 bg-warm/20 text-warm text-xs rounded-full font-medium">
                  {stats.messages}
                </span>
              )}
            </div>
            <span className="text-sm text-cream/20">{stats.messages} total</span>
          </div>
          
          {recentMessages.length > 0 ? (
            <div className="bg-charcoal rounded-xl overflow-hidden border border-cream/5">
              {recentMessages.map((msg, i) => (
                <div 
                  key={msg.id} 
                  className={`px-6 py-4 flex items-center justify-between hover:bg-cream/5 transition-all cursor-pointer group ${i !== recentMessages.length - 1 ? 'border-b border-cream/5' : ''}`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2.5 h-2.5 rounded-full ${msg.is_read ? 'bg-cream/20' : 'bg-warm'} ring-4 ${msg.is_read ? 'ring-cream/5' : 'ring-warm/20'} transition-all`} />
                    <div>
                      <p className="font-medium text-cream text-sm group-hover:text-warm transition-colors">{msg.name}</p>
                      <p className="text-xs text-cream/30 truncate max-w-xs sm:max-w-md group-hover:text-cream/50 transition-colors">{msg.subject || 'No subject'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {!msg.is_read && (
                      <span className="px-2 py-0.5 bg-warm/20 text-warm text-[10px] rounded-full uppercase tracking-wider font-medium">
                        New
                      </span>
                    )}
                    <span className="text-xs text-cream/20 whitespace-nowrap group-hover:text-cream/40 transition-colors">
                      {new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-charcoal rounded-xl p-12 text-center border border-cream/5 border-dashed">
              <div className="w-12 h-12 rounded-full bg-cream/5 flex items-center justify-center text-2xl mx-auto mb-3">
                📭
              </div>
              <p className="text-cream/30 text-sm">No messages yet</p>
              <p className="text-cream/20 text-xs mt-1">Messages from visitors will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}