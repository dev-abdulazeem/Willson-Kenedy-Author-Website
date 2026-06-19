import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const API_BASE = 'https://willson-kenedy-author-website.onrender.com';

function getImageUrl(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

function LazyImage({ src, alt, className, fallback }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full h-full">
      {!loaded && <div className="absolute inset-0 bg-cream/5 animate-pulse" />}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          e.target.onerror = null;
          e.target.style.display = 'none';
          if (fallback) e.target.parentElement.innerHTML = fallback;
        }}
      />
    </div>
  );
}

function PostCardSkeleton() {
  return (
    <div className="bg-charcoal rounded-xl p-6 flex items-center gap-6 border border-cream/5 animate-pulse">
      <div className="w-20 h-20 rounded-lg bg-cream/5 flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-cream/5 rounded w-3/4" />
        <div className="h-3 bg-cream/5 rounded w-1/2" />
        <div className="h-3 bg-cream/5 rounded w-24" />
      </div>
      <div className="flex gap-4 flex-shrink-0">
        <div className="h-4 bg-cream/5 rounded w-8" />
        <div className="h-4 bg-cream/5 rounded w-10" />
      </div>
    </div>
  );
}

export default function AdminPosts() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', content: '', excerpt: '', is_published: false });
  const [cover, setCover] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/admin/login'); return; }
    fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/posts/admin/all');
      setPosts(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCover(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const data = new FormData();
    Object.keys(form).forEach(key => data.append(key, form[key]));
    if (cover) data.append('cover', cover);
    if (editing) data.append('existing_image', editing.cover_image || '');

    try {
      if (editing) {
        await api.put(`/posts/${editing.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/posts', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      resetForm();
      setShowForm(false);
      fetchPosts();
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({ title: '', content: '', excerpt: '', is_published: false });
    setCover(null);
    setCoverPreview(null);
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
    setCoverPreview(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this post permanently?')) return;
    setDeletingId(id);
    await api.delete(`/posts/${id}`);
    setDeletingId(null);
    fetchPosts();
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-ink text-cream">
      <header className="bg-charcoal border-b border-cream/10 px-6 lg:px-12 py-5 flex items-center justify-between sticky top-0 z-30 backdrop-blur-xl bg-charcoal/90">
        <div className="flex items-center gap-4">
          <Link 
            to="/admin" 
            className="text-sm text-cream/40 hover:text-cream transition-colors flex items-center gap-2 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Dashboard
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
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-serif text-3xl lg:text-4xl text-cream mb-2">Journal</h1>
            <p className="text-cream/30 text-sm">{posts.length} entries</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="px-6 py-3 bg-warm text-cream rounded-lg font-medium hover:bg-warm/90 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <span>{showForm ? '✕' : '+'}</span>
            {showForm ? 'Close' : 'New Post'}
          </button>
        </div>

        {showForm && (
          <div className="bg-charcoal rounded-xl p-8 mb-12 border border-cream/10 animate-fade-in">
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
                        onChange={handleCoverChange}
                        className="hidden"
                      />
                    </label>
                    {cover && <span className="text-sm text-cream/50">{cover.name}</span>}
                  </div>
                </div>
                
                {(coverPreview || (editing?.cover_image && !cover)) && (
                  <div className="relative h-20 rounded-lg overflow-hidden">
                    <LazyImage
                      src={coverPreview || getImageUrl(editing.cover_image)}
                      alt="Current"
                      className="h-20 rounded-lg object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
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
                  disabled={submitting}
                  className="px-8 py-3 bg-warm text-cream rounded-lg font-medium hover:bg-warm/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting && <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />}
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

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => <PostCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <div 
                key={post.id} 
                className="bg-charcoal rounded-xl p-6 flex items-center gap-6 border border-cream/5 hover:border-cream/10 transition-all group hover:bg-charcoal/80"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-20 h-20 rounded-lg bg-ink flex-shrink-0 overflow-hidden">
                  {post.cover_image ? (
                    <LazyImage
                      src={getImageUrl(post.cover_image)}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      fallback={`<div class="w-full h-full flex items-center justify-center"><span class="font-serif text-2xl text-cream/10">${post.title[0]}</span></div>`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-serif text-2xl text-cream/10">{post.title[0]}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-serif text-lg text-cream truncate group-hover:text-warm transition-colors">{post.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      post.is_published ? 'bg-green-500/20 text-green-400' : 'bg-cream/10 text-cream/50'
                    }`}>
                      {post.is_published ? 'Live' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-cream/30 text-sm truncate">{post.excerpt || 'No excerpt'}</p>
                  <p className="text-cream/20 text-xs mt-1">
                    {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex gap-4 flex-shrink-0">
                  <button 
                    onClick={() => handleEdit(post)}
                    className="text-sm text-cream/40 hover:text-warm transition-colors px-3 py-1 rounded hover:bg-cream/5"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(post.id)}
                    disabled={deletingId === post.id}
                    className="text-sm text-cream/40 hover:text-red-400 transition-colors px-3 py-1 rounded hover:bg-red-500/5 disabled:opacity-30"
                  >
                    {deletingId === post.id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-20 border border-dashed border-cream/10 rounded-xl">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-cream/20 text-lg">No posts yet. Write your first entry.</p>
          </div>
        )}
      </div>
    </div>
  );
}