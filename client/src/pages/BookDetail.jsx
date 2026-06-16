import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function BookDetail() {
  const { slug } = useParams();
  const [book, setBook] = useState(null);

  useEffect(() => {
    api.get(`/books/${slug}`).then(res => setBook(res.data));
  }, [slug]);

  if (!book) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-warm border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-cream">
      {/* Breadcrumb */}
      <div className="bg-ink text-cream pt-28 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <Link to="/books" className="text-cream/50 hover:text-warm transition-colors text-sm">
            ← Back to Collection
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-5 gap-16">
          {/* Cover Image */}
          <div className="lg:col-span-2">
            <div className="sticky top-28">
              <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
                {book.cover_image_url ? (
                  <img 
                    src={`https://willson-kenedy-author-website.onrender.com${book.cover_image_url}`}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-parchment flex items-center justify-center">
                    <span className="font-serif text-9xl text-stone/20">{book.title[0]}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-3 py-4">
            <p className="text-warm text-sm uppercase tracking-[0.3em] mb-4">{book.genre}</p>
            <h1 className="font-serif text-5xl md:text-6xl text-ink mb-8 leading-tight">
              {book.title}
            </h1>
            
            <div className="flex flex-wrap gap-6 mb-10 text-sm text-muted">
              {book.release_date && (
                <span>Published {new Date(book.release_date).getFullYear()}</span>
              )}
              {book.price && <span className="text-ink font-bold text-lg">${book.price}</span>}
            </div>

            <div className="prose prose-lg max-w-none text-stone leading-relaxed mb-12">
              <p>{book.synopsis}</p>
            </div>

            {book.buy_link && (
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href={book.buy_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-ink text-cream rounded-lg font-medium hover:bg-charcoal transition-all"
                >
                  Purchase Book
                  <span>→</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}