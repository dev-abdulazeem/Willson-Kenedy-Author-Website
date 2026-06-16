import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function AdminSubscribers() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [subscribers, setSubscribers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) { navigate('/admin/login'); return; }
    fetchSubscribers();
  }, [user]);

  const fetchSubscribers = async () => {
    const res = await api.get('/subscribers');
    setSubscribers(res.data);
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this subscriber?')) return;
    await api.delete(`/subscribers/${id}`);
    fetchSubscribers();
  };

  const filtered = subscribers.filter(sub => 
    sub.email.toLowerCase().includes(search.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-ink text-cream">
      {/* Header */}
      <header className="bg-charcoal border-b border-cream/10 px-6 lg:px-12 py-5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link 
            to="/admin" 
            className="text-sm text-cream/40 hover:text-cream transition-colors flex items-center gap-2"
          >
            ← Dashboard
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/" 
            className="text-sm text-cream/40 hover:text-cream transition-colors px-4 py-2 rounded-lg hover:bg-cream/5"
          >
            View Site
          </Link>
          <button 
            onClick={() => { logout(); navigate('/admin/login'); }}
            className="text-sm text-warm hover:text-cream transition-colors px-5 py-2 rounded-lg bg-warm/10 hover:bg-warm/20 border border-warm/20"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="font-serif text-3xl lg:text-4xl text-cream mb-2">Subscribers</h1>
            <p className="text-cream/30 text-sm">{subscribers.length} total subscribers</p>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search emails..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full sm:w-64 px-5 py-3 bg-charcoal border border-cream/10 rounded-lg text-cream placeholder:text-cream/20 focus:border-warm focus:outline-none transition-colors pl-10"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/20">🔍</span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-charcoal rounded-xl overflow-hidden border border-cream/10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cream/10">
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.2em] text-cream/40 font-medium">Email</th>
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.2em] text-cream/40 font-medium">Subscribed</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-cream/40 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub, i) => (
                  <tr 
                    key={sub.id} 
                    className={`hover:bg-cream/5 transition-colors ${i !== filtered.length - 1 ? 'border-b border-cream/5' : ''}`}
                  >
                    <td className="px-6 py-4 text-cream">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cream/10 flex items-center justify-center text-sm">
                          {sub.email[0].toUpperCase()}
                        </div>
                        {sub.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-cream/30 text-sm">
                      {new Date(sub.subscribed_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(sub.id)} 
                        className="text-sm text-cream/30 hover:text-red-400 transition-colors px-3 py-1 rounded hover:bg-red-400/10"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-cream/20 text-lg">
                {search ? 'No matching subscribers' : 'No subscribers yet'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}