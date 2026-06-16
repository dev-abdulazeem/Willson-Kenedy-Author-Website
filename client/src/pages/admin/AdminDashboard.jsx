import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ books: 0, posts: 0, subscribers: 0, messages: 0 });
  const [recentMessages, setRecentMessages] = useState([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (!user) return null;

  const cards = [
    { label: 'Books', count: stats.books, icon: '📚', color: 'bg-warm', path: '/admin/books' },
    { label: 'Posts', count: stats.posts, icon: '📝', color: 'bg-gold', path: '/admin/posts' },
    { label: 'Subscribers', count: stats.subscribers, icon: '✉️', color: 'bg-green-600', path: '/admin/subscribers' },
    { label: 'Messages', count: stats.messages, icon: '💬', color: 'bg-blue-600', path: '#' },
  ];

  const quickActions = [
    { label: 'Add New Book', desc: 'Publish a new title', path: '/admin/books', icon: '+' },
    { label: 'Write Journal Entry', desc: 'Create blog post', path: '/admin/posts', icon: '✎' },
    { label: 'Edit Site Content', desc: 'Update hero & about', path: '/admin/site', icon: '⚙' },
    { label: 'View Subscribers', desc: 'Email list', path: '/admin/subscribers', icon: '👥' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-warm border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-cream">
      {/* Header */}
      <header className="bg-charcoal border-b border-cream/10 px-6 lg:px-12 py-5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <h1 className="font-serif text-2xl">Dashboard</h1>
          <span className="hidden md:inline text-cream/20 text-sm">|</span>
          <span className="hidden md:inline text-cream/40 text-sm">Welcome, {user.username}</span>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/" 
            className="text-sm text-cream/40 hover:text-cream transition-colors px-4 py-2 rounded-lg hover:bg-cream/5"
          >
            View Site
          </Link>
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="text-sm text-warm hover:text-cream transition-colors px-5 py-2 rounded-lg bg-warm/10 hover:bg-warm/20 border border-warm/20"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 backdrop-blur-sm">
          <div className="bg-charcoal rounded-2xl p-8 max-w-sm w-full mx-6 shadow-2xl border border-cream/10">
            <h3 className="font-serif text-2xl text-cream mb-2">Sign Out?</h3>
            <p className="text-cream/50 mb-6">Are you sure you want to log out?</p>
            <div className="flex gap-3">
              <button 
                onClick={handleLogout}
                className="flex-1 py-3 bg-warm text-cream rounded-lg font-medium hover:bg-warm/90 transition-colors"
              >
                Yes, Logout
              </button>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 bg-cream/5 text-cream/70 rounded-lg font-medium hover:bg-cream/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        {/* Stats Cards — Big Numbers */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12">
          {cards.map(card => (
            <Link 
              key={card.label}
              to={card.path}
              className="bg-charcoal rounded-xl p-6 lg:p-8 hover:bg-charcoal/80 transition-all group border border-cream/5 hover:border-warm/20"
            >
              <div className={`w-10 h-10 lg:w-12 lg:h-12 ${card.color} rounded-lg flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
              <p className="font-serif text-3xl lg:text-4xl text-cream mb-1">{card.count}</p>
              <p className="text-cream/40 text-xs uppercase tracking-[0.2em] group-hover:text-warm transition-colors">
                {card.label}
              </p>
            </Link>
          ))}
        </div>

        {/* Quick Actions Grid */}
        <h2 className="font-serif text-xl text-cream/70 mb-6 uppercase tracking-[0.2em] text-xs">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {quickActions.map(action => (
            <Link 
              key={action.label}
              to={action.path}
              className="bg-charcoal rounded-xl p-6 hover:bg-charcoal/80 transition-all group border border-cream/5 hover:border-warm/20"
            >
              <div className="w-8 h-8 rounded-lg bg-cream/5 flex items-center justify-center text-cream/50 mb-4 group-hover:bg-warm/20 group-hover:text-warm transition-all">
                <span className="text-lg">{action.icon}</span>
              </div>
              <h3 className="font-medium text-cream mb-1 group-hover:text-warm transition-colors">{action.label}</h3>
              <p className="text-cream/30 text-sm">{action.desc}</p>
            </Link>
          ))}
        </div>

        {/* Recent Messages */}
        {recentMessages.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl text-cream/70 uppercase tracking-[0.2em] text-xs">Recent Messages</h2>
              <span className="text-sm text-cream/30">{stats.messages} total</span>
            </div>
            <div className="bg-charcoal rounded-xl overflow-hidden border border-cream/5">
              {recentMessages.map((msg, i) => (
                <div 
                  key={msg.id} 
                  className={`px-6 py-4 flex items-center justify-between hover:bg-cream/5 transition-colors ${i !== recentMessages.length - 1 ? 'border-b border-cream/5' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${msg.is_read ? 'bg-cream/20' : 'bg-warm'}`} />
                    <div>
                      <p className="font-medium text-cream text-sm">{msg.name}</p>
                      <p className="text-xs text-cream/30 truncate max-w-xs sm:max-w-md">{msg.subject || 'No subject'}</p>
                    </div>
                  </div>
                  <span className="text-xs text-cream/20 whitespace-nowrap">
                    {new Date(msg.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {recentMessages.length === 0 && (
          <div className="bg-charcoal rounded-xl p-12 text-center border border-cream/5">
            <p className="text-cream/30 text-sm">No messages yet</p>
          </div>
        )}
      </div>
    </div>
  );
}