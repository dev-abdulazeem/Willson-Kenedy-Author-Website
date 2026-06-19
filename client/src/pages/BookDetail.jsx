import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const API_BASE = 'https://willson-kenedy-author-website.onrender.com';

function getImageUrl(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

// Reusable image with loading skeleton
function LazyImage({ src, alt, className, fallback }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <div className="absolute inset-0 bg-stone/10 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          e.target.onerror = null;
          e.target.style.display = 'none';
          if (fallback) {
            e.target.parentElement.innerHTML = fallback;
          }
        }}
      />
    </div>
  );
}

// Skeleton for loading state
function BookSkeleton() {
  return (
    <div className="min-h-screen bg-cream animate-pulse">
      <div className="bg-ink pt-28 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-4 bg-cream/10 rounded w-32" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-5 gap-16">
          <div className="lg:col-span-2">
            <div className="sticky top-28">
              <div className="aspect-[2/3] rounded-xl bg-stone/10 shadow-2xl" />
            </div>
          </div>

          <div className="lg:col-span-3 py-4 space-y-6">
            <div className="h-3 bg-stone/10 rounded w-24" />
            <div className="h-14 bg-stone/10 rounded w-3/4" />
            <div className="h-3 bg-stone/10 rounded w-48" />
            <div className="space-y-3 pt-4">
              <div className="h-3 bg-stone/10 rounded w-full" />
              <div className="h-3 bg-stone/10 rounded w-full" />
              <div className="h-3 bg-stone/10 rounded w-2/3" />
            </div>
            <div className="h-12 bg-stone/10 rounded w-48 mt-8" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookDetail() {
  const { slug } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/books/${slug}`)
      .then(res => setBook(res.data))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <BookSkeleton />;

  if (!book) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <p className="text-stone text-lg mb-4">Book not found</p>
        <Link to="/books" className="text-warm hover:underline">
          ← Back to Collection
        </Link>
      </div>
    </div>
  );

  const fallbackHtml = `<div class="w-full h-full bg-parchment flex items-center justify-center"><span class="font-serif text-9xl text-stone/20">${book.title[0]}</span></div>`;

  return (
    <div className="min-h-screen bg-cream">
      {/* Breadcrumb */}
      <div className="bg-ink text-cream pt-28 pb-8 px-6">
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
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-5 gap-16">
          {/* Cover Image */}
          <div className="lg:col-span-2">
            <div className="sticky top-28">
              <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl bg-parchment">
                {book.cover_image_url ? (
                  <LazyImage
                    src={getImageUrl(book.cover_image_url)}
                    alt={book.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    fallback={fallbackHtml}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-serif text-9xl text-stone/20">{book.title[0]}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-3 py-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <p className="text-warm text-sm uppercase tracking-[0.3em]">{book.genre}</p>
              {book.is_published !== undefined && (
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  book.is_published ? 'bg-green-500/10 text-green-600' : 'bg-stone/10 text-stone'
                }`}>
                  {book.is_published ? 'Available' : 'Coming Soon'}
                </span>
              )}
            </div>
            
            <h1 className="font-serif text-5xl md:text-6xl text-ink mb-8 leading-tight">
              {book.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 mb-10">
              {book.release_date && (
                <div className="flex items-center gap-2 text-sm text-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-warm" />
                  <span>Published {new Date(book.release_date).getFullYear()}</span>
                </div>
              )}
              {book.price && (
                <div className="flex items-center gap-2">
                  <span className="text-ink font-bold text-2xl">${book.price}</span>
                </div>
              )}
            </div>

            <div className="prose prose-lg max-w-none text-stone leading-relaxed mb-12">
              <p className="text-lg">{book.synopsis}</p>
            </div>

            {book.buy_link ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href={book.buy_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-ink text-cream rounded-lg font-medium hover:bg-charcoal transition-all hover:scale-105 active:scale-95"
                >
                  Purchase Book
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
                <Link
                  to="/books"
                  className="inline-flex items-center justify-center gap-3 px-10 py-4 border border-ink/20 text-ink rounded-lg font-medium hover:bg-ink/5 transition-all"
                >
                  Browse More
                </Link>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-stone/10 text-stone rounded-lg text-sm">
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