import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
}

function LazyImage({ src, alt, className }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`${className} bg-ink flex items-center justify-center`}>
        <span className="font-serif text-4xl text-cream/10">{alt?.[0] || '?'}</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {!loaded && <div className="absolute inset-0 bg-cream/5 animate-pulse" />}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
}

export default function AdminBooks() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '', synopsis: '', genre: '', release_date: '', price: '', buy_link: '', is_published: false
  });
  const [cover, setCover] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/admin/login'); return; }
    fetchBooks();
  }, [user]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/books/admin/all');
      setBooks(res.data);
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
    
    // Append all form fields
    Object.keys(form).forEach(key => {
      data.append(key, form[key] === true ? 'true' : form[key] === false ? 'false' : form[key] || '');
    });
    
    // Append cover image if selected
    if (cover) {
      data.append('cover', cover);
    }
    
    // If editing, send the current image URL so backend knows what to replace
    if (editing) {
      data.append('existing_image_url', editing.cover_image_url || '');
    }

    try {
      if (editing) {
        await api.put(`/books/${editing.id}`, data, { 
          headers: { 'Content-Type': 'multipart/form-data' } 
        });
      } else {
        await api.post('/books', data, { 
          headers: { 'Content-Type': 'multipart/form-data' } 
        });
      }
      
      resetForm();
      setShowForm(false);
      fetchBooks();
    } catch (err) {
      console.error('Submit error:', err);
      alert(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({ 
      title: '', synopsis: '', genre: '', release_date: '', 
      price: '', buy_link: '', is_published: false 
    });
    setCover(null);
    setCoverPreview(null);
    setEditing(null);
  };

  const handleEdit = (book) => {
    setEditing(book);
    setForm({
      title: book.title || '',
      synopsis: book.synopsis || '',
      genre: book.genre || '',
      release_date: book.release_date ? book.release_date.split('T')[0] : '',
      price: book.price || '',
      buy_link: book.buy_link || '',
      is_published: book.is_published
    });
    // Show current image preview
    setCoverPreview(null);
    setCover(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this book permanently?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/books/${id}`);
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  // Clear preview when removing selected image
  const handleRemoveSelectedCover = () => {
    setCover(null);
    setCoverPreview(null);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-ink text-cream">
      <header className="bg-charcoal border-b border-cream/10 px-6 lg:px-12 py-5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="text-sm text-cream/40 hover:text-cream transition-colors flex items-center gap-2">
            ← Dashboard
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="text-sm text-cream/40 hover:text-cream transition-colors px-4 py-2 rounded-lg hover:bg-cream/5">
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
            <h1 className="font-serif text-3xl lg:text-4xl text-cream mb-2">Books</h1>
            <p className="text-cream/30 text-sm">{books.length} titles in collection</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="px-6 py-3 bg-warm text-cream rounded-lg font-medium hover:bg-warm/90 transition-all flex items-center gap-2"
          >
            <span>{showForm ? '✕' : '+'}</span>
            {showForm ? 'Close' : 'Add Book'}
          </button>
        </div>

        {showForm && (
          <div className="bg-charcoal rounded-xl p-8 mb-12 border border-cream/10 animate-fade-in">
            <h2 className="font-serif text-xl text-cream mb-6">
              {editing ? 'Edit Book' : 'New Book'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-cream/40 mb-3">Title *</label>
                  <input
                    placeholder="Book title"
                    value={form.title}
                    onChange={e => setForm({...form, title: e.target.value})}
                    className="w-full px-5 py-4 bg-ink border border-cream/10 rounded-lg text-cream placeholder:text-cream/20 focus:border-warm focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-cream/40 mb-3">Genre</label>
                  <input
                    placeholder="e.g. Fiction, Thriller"
                    value={form.genre}
                    onChange={e => setForm({...form, genre: e.target.value})}
                    className="w-full px-5 py-4 bg-ink border border-cream/10 rounded-lg text-cream placeholder:text-cream/20 focus:border-warm focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-cream/40 mb-3">Release Date</label>
                  <input
                    type="date"
                    value={form.release_date}
                    onChange={e => setForm({...form, release_date: e.target.value})}
                    className="w-full px-5 py-4 bg-ink border border-cream/10 rounded-lg text-cream focus:border-warm focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-cream/40 mb-3">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="19.99"
                    value={form.price}
                    onChange={e => setForm({...form, price: e.target.value})}
                    className="w-full px-5 py-4 bg-ink border border-cream/10 rounded-lg text-cream placeholder:text-cream/20 focus:border-warm focus:outline-none transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-cream/40 mb-3">Buy Link</label>
                <input
                  placeholder="https://amazon.com/..."
                  value={form.buy_link}
                  onChange={e => setForm({...form, buy_link: e.target.value})}
                  className="w-full px-5 py-4 bg-ink border border-cream/10 rounded-lg text-cream placeholder:text-cream/20 focus:border-warm focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-cream/40 mb-3">Synopsis *</label>
                <textarea
                  placeholder="Book description..."
                  rows={4}
                  value={form.synopsis}
                  onChange={e => setForm({...form, synopsis: e.target.value})}
                  className="w-full px-5 py-4 bg-ink border border-cream/10 rounded-lg text-cream placeholder:text-cream/20 focus:border-warm focus:outline-none transition-colors resize-none"
                  required
                />
              </div>

              {/* Cover Image Section */}
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-cream/40 mb-3">Cover Image</label>
                
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="flex items-center gap-3">
                    <label className="px-5 py-3 bg-cream/5 border border-cream/10 rounded-lg text-sm text-cream/50 hover:text-cream hover:border-cream/20 transition-all cursor-pointer hover:bg-cream/10">
                      {cover ? 'Change File' : 'Choose File'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverChange}
                        className="hidden"
                      />
                    </label>
                    {cover && (
                      <button
                        type="button"
                        onClick={handleRemoveSelectedCover}
                        className="text-sm text-red-400 hover:text-red-300 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Image Preview */}
                <div className="mt-4">
                  {coverPreview ? (
                    // New image selected
                    <div className="relative inline-block">
                      <LazyImage
                        src={coverPreview}
                        alt="New cover preview"
                        className="h-48 rounded-lg object-cover"
                      />
                      <span className="absolute bottom-2 left-2 px-2 py-1 bg-warm/80 text-cream text-xs rounded">New</span>
                    </div>
                  ) : editing?.cover_image_url ? (
                    // Existing image (editing mode)
                    <div className="relative inline-block group">
                      <LazyImage
                        src={getImageUrl(editing.cover_image_url)}
                        alt="Current cover"
                        className="h-48 rounded-lg object-cover"
                      />
                      <span className="absolute bottom-2 left-2 px-2 py-1 bg-cream/20 text-cream text-xs rounded backdrop-blur">Current</span>
                    </div>
                  ) : (
                    // No image
                    <div className="h-48 w-32 bg-ink border border-cream/10 rounded-lg flex items-center justify-center">
                      <span className="text-cream/20 text-sm">No cover</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
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
                  {editing ? 'Update Book' : 'Add Book'}
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-charcoal rounded-xl overflow-hidden border border-cream/5 animate-pulse">
                <div className="aspect-[2/3] bg-cream/5" />
                <div className="p-6 space-y-3">
                  <div className="h-3 bg-cream/5 rounded w-1/3" />
                  <div className="h-5 bg-cream/5 rounded w-3/4" />
                  <div className="h-3 bg-cream/5 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book, index) => (
              <div 
                key={book.id} 
                className="bg-charcoal rounded-xl overflow-hidden border border-cream/5 hover:border-cream/10 transition-all group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="aspect-[2/3] bg-ink relative overflow-hidden">
                  {book.cover_image_url ? (
                    <LazyImage
                      src={getImageUrl(book.cover_image_url)}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-serif text-6xl text-cream/10">{book.title?.[0] || '?'}</span>
                    </div>
                  )}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${
                    book.is_published ? 'bg-green-500/20 text-green-400' : 'bg-cream/10 text-cream/50'
                  }`}>
                    {book.is_published ? 'Published' : 'Draft'}
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-warm text-xs uppercase tracking-[0.2em] mb-2">{book.genre || 'No Genre'}</p>
                  <h3 className="font-serif text-xl text-cream mb-2">{book.title}</h3>
                  <p className="text-cream/30 text-sm line-clamp-2 mb-4">{book.synopsis}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-gold font-medium">${book.price || '0.00'}</span>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleEdit(book)}
                        className="text-sm text-cream/40 hover:text-warm transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(book.id)}
                        disabled={deletingId === book.id}
                        className="text-sm text-cream/40 hover:text-red-400 transition-colors disabled:opacity-30"
                      >
                        {deletingId === book.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && books.length === 0 && (
          <div className="text-center py-20">
            <p className="text-cream/20 text-lg">No books yet. Add your first title.</p>
          </div>
        )}
      </div>
    </div>
  );
}