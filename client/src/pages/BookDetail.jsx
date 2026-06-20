import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

function getImageUrl(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

function LazyImage({ src, alt, className, fallback }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full h-full">
      {!loaded && <div className="absolute inset-0 bg-stone/10 animate-pulse" />}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
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

function BookSkeleton() {
  return (
    <div className="min-h-screen bg-cream animate-pulse">
      <div className="bg-ink pt-24 sm:pt-28 pb-6 sm:pb-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-4 bg-cream/10 rounded w-24 sm:w-32" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 sm:gap-12 lg:gap-16">
          <div className="lg:col-span-2">
            <div className="aspect-[2/3] sm:aspect-[3/4] lg:aspect-[2/3] rounded-xl bg-stone/10 shadow-2xl max-w-xs sm:max-w-sm mx-auto lg:mx-0" />
          </div>
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            <div className="h-3 bg-stone/10 rounded w-20 sm:w-24" />
            <div className="h-10 sm:h-14 bg-stone/10 rounded w-3/4" />
            <div className="h-3 bg-stone/10 rounded w-32 sm:w-48" />
            <div className="space-y-2 sm:space-y-3 pt-4">
              <div className="h-3 bg-stone/10 rounded w-full" />
              <div className="h-3 bg-stone/10 rounded w-full" />
              <div className="h-3 bg-stone/10 rounded w-2/3" />
            </div>
            <div className="h-10 sm:h-12 bg-stone/10 rounded w-40 sm:w-48 mt-6" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/books/${id}`)
      .then(res => setBook(res.data))
      .catch(() => setBook(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <BookSkeleton />;

  if (!book) return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-stone text-lg mb-4">Book not found</p>
        <Link to="/books" className="text-warm hover:underline inline-flex items-center gap-2">
          ← Back to Collection
        </Link>
      </div>
    </div>
  );

  const fallbackHtml = `<div class="w-full h-full bg-parchment flex items-center justify-center"><span class="font-serif text-6xl sm:text-8xl lg:text-9xl text-stone/20">${book.title[0]}</span></div>`;

  return (
    <div className="min-h-screen bg-cream">
      {/* Breadcrumb */}
      <div className="bg-ink text-cream pt-24 sm:pt-28 pb-6 sm:pb-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <Link 
            to="/books" 
            className="text-cream/50 hover:text-warm transition-colors text-sm inline-flex items-center gap-2 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Back to Collection
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 sm:gap-12 lg:gap-16">
          {/* Cover Image */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-28">
              <div className="aspect-[2/3] sm:aspect-[3/4] lg:aspect-[2/3] rounded-xl overflow-hidden shadow-2xl bg-parchment max-w-xs sm:max-w-sm mx-auto lg:mx-0">
                {book.cover_image_url ? (
                  <LazyImage
                    src={getImageUrl(book.cover_image_url)}
                    alt={book.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    fallback={fallbackHtml}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-serif text-6xl sm:text-8xl lg:text-9xl text-stone/20">{book.title[0]}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-3 py-2 sm:py-4 animate-fade-in">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <p className="text-warm text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em]">{book.genre}</p>
              {book.is_published !== undefined && (
                <span className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium ${
                  book.is_published ? 'bg-green-500/10 text-green-600' : 'bg-stone/10 text-stone'
                }`}>
                  {book.is_published ? 'Available' : 'Coming Soon'}
                </span>
              )}
            </div>
            
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-ink mb-6 sm:mb-8 leading-tight">
              {book.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-8 sm:mb-10">
              {book.release_date && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-warm" />
                  <span>Published {new Date(book.release_date).getFullYear()}</span>
                </div>
              )}
              {book.price && (
                <div className="flex items-center gap-2">
                  <span className="text-ink font-bold text-xl sm:text-2xl">${book.price}</span>
                </div>
              )}
            </div>

            <div className="prose prose-sm sm:prose-lg max-w-none text-stone leading-relaxed mb-10 sm:mb-12">
              <p className="text-base sm:text-lg">{book.synopsis}</p>
            </div>

            {book.buy_link ? (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <a 
                  href={book.buy_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 sm:gap-3 px-8 sm:px-10 py-3.5 sm:py-4 bg-ink text-cream rounded-lg font-medium hover:bg-charcoal transition-all hover:scale-105 active:scale-95 text-sm sm:text-base"
                >
                  Purchase Book
                  <span>→</span>
                </a>
                <Link
                  to="/books"
                  className="inline-flex items-center justify-center gap-2 sm:gap-3 px-8 sm:px-10 py-3.5 sm:py-4 border border-ink/20 text-ink rounded-lg font-medium hover:bg-ink/5 transition-all text-sm sm:text-base"
                >
                  Browse More
                </Link>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-stone/10 text-stone rounded-lg text-xs sm:text-sm">
                <span className="w-2 h-2 rounded-full bg-stone/30" />
                Not available for purchase yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}