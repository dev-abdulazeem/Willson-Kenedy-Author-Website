import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

function getImageUrl(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

export default function Books() {
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/books').then(res => setBooks(res.data));
  }, []);

  const genres = ['all', ...new Set(books.map(b => b.genre).filter(Boolean))];
  const filtered = filter === 'all' ? books : books.filter(b => b.genre === filter);

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-ink text-cream pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-warm text-sm uppercase tracking-[0.3em] mb-4">Collection</p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl">All Books</h1>
        </div>
      </div>

      <div className="sticky top-20 z-30 bg-cream/95 backdrop-blur border-b border-stone/10 py-4 px-6">
        <div className="max-w-7xl mx-auto flex gap-4 overflow-x-auto scrollbar-hide">
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => setFilter(genre)}
              className={`px-5 py-2 rounded-full text-sm uppercase tracking-wider whitespace-nowrap transition-all ${
                filter === genre 
                  ? 'bg-ink text-cream' 
                  : 'bg-parchment text-stone hover:bg-stone/10'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10">
          {filtered.map((book, i) => (
            <Link 
              key={book.id} 
              to={`/books/${book.id}`}
              className="group"
            >
              <div className="relative aspect-[2/3] mb-6 rounded-lg overflow-hidden bg-parchment shadow-lg group-hover:shadow-2xl transition-all duration-500">
                {book.cover_image_url ? (
                  <img 
                    src={getImageUrl(book.cover_image_url)}
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center"><span class="font-serif text-8xl text-stone/20">${book.title[0]}</span></div>`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-serif text-8xl text-stone/20">{book.title[0]}</span>
                  </div>
                )}
                {book.price && (
                  <div className="absolute top-4 right-4 bg-cream/90 backdrop-blur px-3 py-1 rounded-full">
                    <span className="text-ink font-bold text-sm">${book.price}</span>
                  </div>
                )}
              </div>
              <p className="text-warm text-xs uppercase tracking-[0.2em] mb-2">{book.genre}</p>
              <h3 className="font-serif text-xl text-ink group-hover:text-warm transition-colors mb-2">
                {book.title}
              </h3>
              <p className="text-muted text-sm line-clamp-2">{book.synopsis}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}