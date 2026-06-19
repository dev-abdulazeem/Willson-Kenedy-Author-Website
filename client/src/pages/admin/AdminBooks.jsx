import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function AdminBooks() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({
    title: '', synopsis: '', genre: '', release_date: '', price: '', buy_link: '', is_published: false
  });
  const [cover, setCover] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/admin/login'); return; }
    fetchBooks();
  }, [user]);

  const fetchBooks = async () => {
    const res = await api.get('/books/admin/all');
    setBooks(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(form).forEach(key => data.append(key, form[key]));
    if (cover) data.append('cover', cover);
    if (editing) data.append('existing_image', editing.cover_image_url || '');

    if (editing) {
      await api.put(`/books/${editing.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
    } else {
      await api.post('/books', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    }

    resetForm();
    setShowForm(false);
    fetchBooks();
  };

  const resetForm = () => {
    setForm({ title: '', synopsis: '', genre: '', release_date: '', price: '', buy_link: '', is_published: false });
    setCover(null);
    setEditing(null);
  };

  const handleEdit = (book) => {
    setEditing(book);
    setForm({
      title: book.title,
      synopsis: book.synopsis || '',
      genre: book.genre || '',
      release_date: book.release_date ? book.release_date.split('T')[0] : '',
      price: book.price || '',
      buy_link: book.buy_link || '',
      is_published: book.is_published
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this book permanently?')) return;
    await api.delete(`/books/${id}`);
    fetchBooks();
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

        {/* Form — Collapsible */}
        {showForm && (
          <div className="bg-charcoal rounded-xl p-8 mb-12 border border-cream/10">
            <h2 className="font-serif text-xl text-cream mb-6">
              {editing ? 'Edit Book' : 'New Book'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-cream/40 mb-3">Title</label>
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
                <label className="block text-xs uppercase tracking-[0.2em] text-cream/40 mb-3">Synopsis</label>
                <textarea
                  placeholder="Book description..."
                  rows={4}
                  value={form.synopsis}
                  onChange={e => setForm({...form, synopsis: e.target.value})}
                  className="w-full px-5 py-4 bg-ink border border-cream/10 rounded-lg text-cream placeholder:text-cream/20 focus:border-warm focus:outline-none transition-colors resize-none"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-cream/40 mb-3">Cover Image</label>
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
                
                {editing?.cover_image_url && !cover && (
                  <img 
                    src={editing.cover_image_url} 
                    className="h-20 rounded-lg object-cover" 
                    alt="Current"
                    onError={(e) => { e.target.style.display = 'none'; }}
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

        {/* Books Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map(book => (
            <div 
              key={book.id} 
              className="bg-charcoal rounded-xl overflow-hidden border border-cream/5 hover:border-cream/10 transition-all group"
            >
              <div className="aspect-[2/3] bg-ink relative overflow-hidden">
                {book.cover_image_url ? (
                  <img 
                    src={book.cover_image_url} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={book.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center"><span class="font-serif text-6xl text-cream/10">${book.title[0]}</span></div>`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-serif text-6xl text-cream/10">{book.title[0]}</span>
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
                      className="text-sm text-cream/40 hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {books.length === 0 && (
          <div className="text-center py-20">
            <p className="text-cream/20 text-lg">No books yet. Add your first title.</p>
          </div>
        )}
      </div>
    </div>
  );
}