import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const API_BASE = 'https://willson-kenedy-author-website.onrender.com';

function getImageUrl(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

function LazyImage({ src, alt, className, onError }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full h-full">
      {!loaded && <div className="absolute inset-0 bg-cream/5 animate-pulse" />}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={onError}
      />
    </div>
  );
}

// Skeleton for loading
function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-cream animate-pulse">
      <div className="h-[70vh] sm:h-[80vh] lg:h-screen bg-charcoal" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-20 lg:py-32">
        <div className="h-4 bg-stone/10 rounded w-32 mb-4" />
        <div className="h-10 sm:h-12 lg:h-16 bg-stone/10 rounded w-64 mb-16" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {[1, 2, 3].map(i => (
            <div key={i} className="aspect-[2/3] bg-stone/10 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [settings, setSettings] = useState({});
  const [books, setBooks] = useState([]);
  const [latestPost, setLatestPost] = useState(null);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/site'),
      api.get('/books'),
      api.get('/posts')
    ]).then(([siteRes, booksRes, postsRes]) => {
      setSettings(siteRes.data);
      setBooks(booksRes.data.slice(0, 3));
      if (postsRes.data.length > 0) setLatestPost(postsRes.data[0]);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <HomeSkeleton />;

  return (
    <div>
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[70vh] sm:h-[80vh] lg:h-screen min-h-[500px] sm:min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {settings.hero_image ? (
            <LazyImage
              src={getImageUrl(settings.hero_image)}
              alt=""
              className={`w-full h-full object-cover transition-all duration-1000 ${heroLoaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0'}`}
              onLoad={() => setHeroLoaded(true)}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-charcoal via-stone to-ink" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-ink/20" />
        </div>

        <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto">
          <p className="text-warm text-xs sm:text-sm uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-4 sm:mb-6 animate-fade-in">
            Award-Winning Author
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-cream mb-6 sm:mb-8 leading-[0.95]">
            {settings.hero_tagline || 'Stories That\nStay With You'}
          </h1>
          <p className="text-cream/60 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 sm:mb-12 font-light leading-relaxed px-4">
            Exploring the depths of human experience through fiction that challenges, 
            comforts, and transforms.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
            <Link 
              to="/books" 
              className="px-8 sm:px-10 py-3.5 sm:py-4 bg-warm text-cream rounded-lg font-medium hover:bg-warm/90 transition-all hover:scale-105 active:scale-95 text-sm sm:text-base"
            >
              Explore Works
            </Link>
            <Link 
              to="/about" 
              className="px-8 sm:px-10 py-3.5 sm:py-4 border border-cream/30 text-cream rounded-lg font-medium hover:bg-cream/10 transition-all text-sm sm:text-base"
            >
              About the Author
            </Link>
          </div>
        </div>

        <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cream/40">
          <span className="text-xs uppercase tracking-[0.3em]">Scroll</span>
          <div className="w-px h-8 sm:h-12 bg-gradient-to-b from-cream/40 to-transparent animate-pulse" />
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-16 sm:py-20 lg:py-32 px-4 sm:px-6 lg:px-12 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-16 gap-4 sm:gap-6">
            <div>
              <p className="text-warm text-xs sm:text-sm uppercase tracking-[0.3em] mb-2 sm:mb-4">Latest Works</p>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-ink">
                Featured Books
              </h2>
            </div>
            <Link 
              to="/books" 
              className="group flex items-center gap-2 sm:gap-3 text-ink hover:text-warm transition-colors"
            >
              <span className="text-xs sm:text-sm uppercase tracking-[0.2em]">View All</span>
              <span className="group-hover:translate-x-2 transition-transform">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {books.map((book, i) => (
              <Link 
                key={book.id} 
                to={`/books/${book.slug}`}
                className="group block"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="relative aspect-[2/3] mb-4 sm:mb-6 overflow-hidden rounded-lg bg-parchment shadow-md group-hover:shadow-xl transition-all duration-500">
                  {book.cover_image_url ? (
                    <LazyImage
                      src={getImageUrl(book.cover_image_url)}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-muted"><span class="font-serif text-4xl sm:text-6xl opacity-20">${book.title[0]}</span></div>`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted">
                      <span className="font-serif text-4xl sm:text-6xl opacity-20">{book.title[0]}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/20 transition-all duration-500" />
                </div>
                <div>
                  <p className="text-warm text-xs uppercase tracking-[0.2em] mb-1 sm:mb-2">{book.genre}</p>
                  <h3 className="font-serif text-lg sm:text-xl md:text-2xl text-ink group-hover:text-warm transition-colors mb-1 sm:mb-2">
                    {book.title}
                  </h3>
                  <p className="text-muted text-sm line-clamp-2 leading-relaxed">
                    {book.synopsis}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 sm:py-20 lg:py-32 bg-parchment">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 lg:gap-24 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="aspect-[4/5] rounded-lg overflow-hidden">
                {settings.author_photo ? (
                  <LazyImage
                    src={getImageUrl(settings.author_photo)}
                    alt="Willson Kenedy"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full bg-stone/20 flex items-center justify-center">
                    <span className="font-serif text-6xl sm:text-8xl text-stone/30">W</span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-4 sm:-bottom-6 -right-4 sm:-right-6 w-20 sm:w-32 h-20 sm:h-32 border-2 border-warm/30 rounded-lg -z-10" />
            </div>

            <div className="order-1 lg:order-2">
              <p className="text-warm text-xs sm:text-sm uppercase tracking-[0.3em] mb-3 sm:mb-4">About the Author</p>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-ink mb-6 sm:mb-8 leading-tight">
                Crafting Worlds,<br className="hidden sm:block" /> One Word at a Time
              </h2>
              <div className="prose prose-sm sm:prose-lg text-stone leading-relaxed mb-8 sm:mb-10">
                <p className="mb-4">
                  {settings.about_text || 'Willson Kenedy is a storyteller who believes in the transformative power of fiction. With a career spanning over a decade, his works have captivated readers worldwide, earning critical acclaim and a devoted following.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-6 sm:gap-8 mb-8 sm:mb-10">
                <div>
                  <p className="font-serif text-2xl sm:text-3xl text-warm">12+</p>
                  <p className="text-xs sm:text-sm text-muted uppercase tracking-wider">Books Published</p>
                </div>
                <div>
                  <p className="font-serif text-2xl sm:text-3xl text-warm">3</p>
                  <p className="text-xs sm:text-sm text-muted uppercase tracking-wider">Literary Awards</p>
                </div>
                <div>
                  <p className="font-serif text-2xl sm:text-3xl text-warm">50K+</p>
                  <p className="text-xs sm:text-sm text-muted uppercase tracking-wider">Readers</p>
                </div>
              </div>
              <Link 
                to="/about" 
                className="inline-flex items-center gap-2 sm:gap-3 text-ink hover:text-warm transition-colors group text-sm sm:text-base"
              >
                <span className="text-xs sm:text-sm uppercase tracking-[0.2em]">Read Full Bio</span>
                <span className="w-6 sm:w-8 h-px bg-current group-hover:w-10 sm:group-hover:w-12 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Post */}
      {latestPost && (
        <section className="py-16 sm:py-20 lg:py-32 px-4 sm:px-6 lg:px-12 bg-cream">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-16 gap-4 sm:gap-6">
              <div>
                <p className="text-warm text-xs sm:text-sm uppercase tracking-[0.3em] mb-2 sm:mb-4">From the Journal</p>
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-ink">Latest Thoughts</h2>
              </div>
              <Link 
                to="/blog" 
                className="group flex items-center gap-2 sm:gap-3 text-ink hover:text-warm transition-colors"
              >
                <span className="text-xs sm:text-sm uppercase tracking-[0.2em]">All Entries</span>
                <span className="group-hover:translate-x-2 transition-transform">→</span>
              </Link>
            </div>

            <Link 
              to={`/blog/${latestPost.slug}`}
              className="group grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center"
            >
              <div className="aspect-[16/10] rounded-lg overflow-hidden bg-parchment">
                {latestPost.cover_image ? (
                  <LazyImage
                    src={getImageUrl(latestPost.cover_image)}
                    alt={latestPost.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<div class="w-full h-full bg-stone/10"></div>`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-stone/10" />
                )}
              </div>
              <div>
                <p className="text-muted text-xs sm:text-sm mb-3 sm:mb-4">
                  {new Date(latestPost.published_at).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
                <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-ink group-hover:text-warm transition-colors mb-4 sm:mb-6 leading-tight">
                  {latestPost.title}
                </h3>
                <p className="text-stone leading-relaxed mb-6 sm:mb-8 line-clamp-3 text-sm sm:text-base">
                  {latestPost.excerpt || latestPost.content?.replace(/<[^>]*>/g, '').slice(0, 200)}...
                </p>
                <span className="inline-flex items-center gap-2 sm:gap-3 text-ink hover:text-warm transition-colors text-sm sm:text-base">
                  <span className="text-xs sm:text-sm uppercase tracking-[0.2em]">Read Article</span>
                  <span className="group-hover:translate-x-2 transition-transform">→</span>
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Quote Section */}
      <section className="py-16 sm:py-20 lg:py-32 bg-ink text-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-10 sm:w-12 h-px bg-warm mx-auto mb-8 sm:mb-10" />
          <blockquote className="font-serif text-xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight mb-8 sm:mb-10 px-4">
            "Kenedy doesn't just write stories — 
            he builds entire universes that linger in your mind long after the final page."
          </blockquote>
          <cite className="text-cream/50 not-italic text-xs sm:text-sm uppercase tracking-[0.3em]">
            — The New York Times
          </cite>
        </div>
      </section>
    </div>
  );
}