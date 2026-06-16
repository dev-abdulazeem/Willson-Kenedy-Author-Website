import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function AdminPosts() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', excerpt: '', is_published: false });
  const [cover, setCover] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/admin/login'); return; }
    fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    const res = await api.get('/posts/admin/all');
    setPosts(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(form).forEach(key => data.append(key, form[key]));
    if (cover) data.append('cover', cover);
    if (editing) data.append('existing_image', editing.cover_image || '');

    if (editing) {
      await api.put(`/posts/${editing.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
    } else {
      await api.post('/posts', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    }

    resetForm();
    setShowForm(false);
    fetchPosts();
  };

  const resetForm = () => {
    setForm({ title: '', content: '', excerpt: '', is_published: false });
    setCover(null);
    setEditing(null);
  };

  const handleEdit = (post) => {
    setEditing(post);
    setForm({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || '',
      is_published: post.is_published
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this post permanently?')) return;
    await api.delete(`/posts/${id}`);
    fetchPosts();
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

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

      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12">
        {/* Title + Add Button */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-serif text-3xl lg:text-4xl text-cream mb-2">Journal</h1>
            <p className="text-cream/30 text-sm">{posts.length} entries</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="px-6 py-3 bg-warm text-cream rounded-lg font-medium hover:bg-warm/90 transition-all flex items-center gap-2"
          >
            <span>{showForm ? '✕' : '+'}</span>
            {showForm ? 'Close' : 'New Post'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-charcoal rounded-xl p-8 mb-12 border border-cream/10">
            <h2 className="font-serif text-xl text-cream mb-6">
              {editing ? 'Edit Post' : 'New Post'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-cream/40 mb-3">Title</label>
                <input
                  placeholder="Post title"
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full px-5 py-4 bg-ink border border-cream/10 rounded-lg text-cream placeholder:text-cream/20 focus:border-warm focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-cream/40 mb-3">Excerpt</label>
                <input
                  placeholder="Short description for previews"
                  value={form.excerpt}
                  onChange={e => setForm({...form, excerpt: e.target.value})}
                  className="w-full px-5 py-4 bg-ink border border-cream/10 rounded-lg text-cream placeholder:text-cream/20 focus:border-warm focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-cream/40 mb-3">Content (HTML supported)</label>
                <textarea
                  placeholder="<p>Write your post here...</p>"
                  rows={10}
                  value={form.content}
                  onChange={e => setForm({...form, content: e.target.value})}
                  className="w-full px-5 py-4 bg-ink border border-cream/10 rounded-lg text-cream placeholder:text-cream/20 focus:border-warm focus:outline-none transition-colors resize-none font-mono text-sm"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-cream/40 mb-3">Featured Image</label>
                  <div className="flex items-center gap-4">
                    <label className="px-5 py-3 bg-cream/5 border border-cream/10 rounded-lg text-sm text-cream/50 hover:text-cream hover:border-cream/20 transition-all cursor-pointer">
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => setCover(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                    {cover && <span className="text-sm text-cream/50">{cover.name}</span>}
                  </div>
                </div>
                
                {editing?.cover_image && !cover && (
                  <img 
                    src={`https://willson-kenedy-author-website.onrender.com${editing.cover_image}`} 
                    className="h-20 rounded-lg object-cover" 
                    alt="Current" 
                  />
                )}

                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-5 h-5 rounded border ${form.is_published ? 'bg-warm border-warm' : 'border-cream/20'} flex items-center justify-center transition-colors`}>
                    {form.is_published && <span className="text-cream text-xs">✓</span>}
                  </div>
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={e => setForm({...form, is_published: e.target.checked})}
                    className="hidden"
                  />
                  <span className="text-sm text-cream/50">Published</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  className="px-8 py-3 bg-warm text-cream rounded-lg font-medium hover:bg-warm/90 transition-colors"
                >
                  {editing ? 'Update Post' : 'Publish Post'}
                </button>
                <button 
                  type="button" 
                  onClick={handleCancel}
                  className="px-8 py-3 bg-cream/5 text-cream/50 rounded-lg hover:bg-cream/10 hover:text-cream transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-4">
          {posts.map(post => (
            <div 
              key={post.id} 
              className="bg-charcoal rounded-xl p-6 flex items-center gap-6 border border-cream/5 hover:border-cream/10 transition-all"
            >
              <div className="w-20 h-20 rounded-lg bg-ink flex-shrink-0 overflow-hidden">
                {post.cover_image ? (
                  <img 
                    src={`https://willson-kenedy-author-website.onrender.com${post.cover_image}`} 
                    className="w-full h-full object-cover"
                    alt="" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-serif text-2xl text-cream/10">{post.title[0]}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-serif text-lg text-cream truncate">{post.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    post.is_published ? 'bg-green-500/20 text-green-400' : 'bg-cream/10 text-cream/50'
                  }`}>
                    {post.is_published ? 'Live' : 'Draft'}
                  </span>
                </div>
                <p className="text-cream/30 text-sm truncate">{post.excerpt || 'No excerpt'}</p>
                <p className="text-cream/20 text-xs mt-1">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-4 flex-shrink-0">
                <button 
                  onClick={() => handleEdit(post)}
                  className="text-sm text-cream/40 hover:text-warm transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(post.id)}
                  className="text-sm text-cream/40 hover:text-red-400 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-cream/20 text-lg">No posts yet. Write your first entry.</p>
          </div>
        )}
      </div>
    </div>
  );
}