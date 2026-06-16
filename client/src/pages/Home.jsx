import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Home() {
  const [settings, setSettings] = useState({});
  const [books, setBooks] = useState([]);
  const [latestPost, setLatestPost] = useState(null);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    api.get('/site').then(res => setSettings(res.data));
    api.get('/books').then(res => setBooks(res.data.slice(0, 3)));
    api.get('/posts').then(res => {
      if (res.data.length > 0) setLatestPost(res.data[0]);
    });
  }, []);

  return (
    <div>
      {/* HERO — Full Screen with Parallax */}
      <section ref={heroRef} className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          {settings.hero_image ? (
            <img 
              src={`https://willson-kenedy-author-website.onrender.com${settings.hero_image}`}
              alt=""
              className={`w-full h-full object-cover transition-all duration-1000 ${heroLoaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0'}`}
              onLoad={() => setHeroLoaded(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-charcoal via-stone to-ink" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-ink/20" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <p className="text-warm text-sm uppercase tracking-[0.4em] mb-6 animate-fade-in">
            Award-Winning Author
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-cream mb-8 leading-[0.95]">
            {settings.hero_tagline || 'Stories That\nStay With You'}
          </h1>
          <p className="text-cream/60 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            Exploring the depths of human experience through fiction that challenges, 
            comforts, and transforms.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/books" 
              className="px-10 py-4 bg-warm text-cream rounded-lg font-medium hover:bg-warm/90 transition-all hover:scale-105"
            >
              Explore Works
            </Link>
            <Link 
              to="/about" 
              className="px-10 py-4 border border-cream/30 text-cream rounded-lg font-medium hover:bg-cream/10 transition-all"
            >
              About the Author
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cream/40">
          <span className="text-xs uppercase tracking-[0.3em]">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-cream/40 to-transparent animate-pulse" />
        </div>
      </section>

      {/* FEATURED BOOKS — Asymmetric Grid */}
      <section className="py-24 lg:py-32 px-6 lg:px-12 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
            <div>
              <p className="text-warm text-sm uppercase tracking-[0.3em] mb-4">Latest Works</p>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-ink">
                Featured Books
              </h2>
            </div>
            <Link 
              to="/books" 
              className="group flex items-center gap-3 text-ink hover:text-warm transition-colors"
            >
              <span className="text-sm uppercase tracking-[0.2em]">View All</span>
              <span className="group-hover:translate-x-2 transition-transform">→</span>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {books.map((book, i) => (
              <Link 
                key={book.id} 
                to={`/books/${book.slug}`}
                className="group block"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="relative aspect-[2/3] mb-6 overflow-hidden rounded-lg bg-parchment">
                  {book.cover_image_url ? (
                    <img 
                      src={`https://willson-kenedy-author-website.onrender.com${book.cover_image_url}`}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted">
                      <span className="font-serif text-6xl opacity-20">{book.title[0]}</span>
                    </div>
                  )}
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/20 transition-all duration-500" />
                </div>
                <div>
                  <p className="text-warm text-xs uppercase tracking-[0.2em] mb-2">{book.genre}</p>
                  <h3 className="font-serif text-2xl text-ink group-hover:text-warm transition-colors mb-2">
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

      {/* ABOUT SECTION — Split Layout */}
      <section className="py-24 lg:py-32 bg-parchment">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Image Side */}
            <div className="relative">
              <div className="aspect-[4/5] rounded-lg overflow-hidden">
                {settings.author_photo ? (
                  <img 
                    src={`https://willson-kenedy-author-website.onrender.com${settings.author_photo}`}
                    alt="Willson Kenedy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-stone/20 flex items-center justify-center">
                    <span className="font-serif text-8xl text-stone/30">W</span>
                  </div>
                )}
              </div>
              {/* Decorative Element */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 border-2 border-warm/30 rounded-lg -z-10" />
            </div>

            {/* Content Side */}
            <div>
              <p className="text-warm text-sm uppercase tracking-[0.3em] mb-4">About the Author</p>
              <h2 className="font-serif text-4xl md:text-5xl text-ink mb-8 leading-tight">
                Crafting Worlds,<br/>One Word at a Time
              </h2>
              <div className="prose prose-lg text-stone leading-relaxed mb-10">
                <p className="mb-4">
                  {settings.about_text || 'Willson Kenedy is a storyteller who believes in the transformative power of fiction. With a career spanning over a decade, his works have captivated readers worldwide, earning critical acclaim and a devoted following.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-8 mb-10">
                <div>
                  <p className="font-serif text-3xl text-warm">12+</p>
                  <p className="text-sm text-muted uppercase tracking-wider">Books Published</p>
                </div>
                <div>
                  <p className="font-serif text-3xl text-warm">3</p>
                  <p className="text-sm text-muted uppercase tracking-wider">Literary Awards</p>
                </div>
                <div>
                  <p className="font-serif text-3xl text-warm">50K+</p>
                  <p className="text-sm text-muted uppercase tracking-wider">Readers</p>
                </div>
              </div>
              <Link 
                to="/about" 
                className="inline-flex items-center gap-3 text-ink hover:text-warm transition-colors group"
              >
                <span className="text-sm uppercase tracking-[0.2em]">Read Full Bio</span>
                <span className="w-8 h-px bg-current group-hover:w-12 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* JOURNAL / BLOG — Minimal List */}
      {latestPost && (
        <section className="py-24 lg:py-32 px-6 lg:px-12 bg-cream">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
              <div>
                <p className="text-warm text-sm uppercase tracking-[0.3em] mb-4">From the Journal</p>
                <h2 className="font-serif text-4xl md:text-5xl text-ink">Latest Thoughts</h2>
              </div>
              <Link 
                to="/blog" 
                className="group flex items-center gap-3 text-ink hover:text-warm transition-colors"
              >
                <span className="text-sm uppercase tracking-[0.2em]">All Entries</span>
                <span className="group-hover:translate-x-2 transition-transform">→</span>
              </Link>
            </div>

            <Link 
              to={`/blog/${latestPost.slug}`}
              className="group grid lg:grid-cols-2 gap-12 items-center"
            >
              <div className="aspect-[16/10] rounded-lg overflow-hidden bg-parchment">
                {latestPost.cover_image ? (
                  <img 
                    src={`https://willson-kenedy-author-website.onrender.com${latestPost.cover_image}`}
                    alt={latestPost.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-stone/10" />
                )}
              </div>
              <div>
                <p className="text-muted text-sm mb-4">
                  {new Date(latestPost.published_at).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
                <h3 className="font-serif text-3xl md:text-4xl text-ink group-hover:text-warm transition-colors mb-6 leading-tight">
                  {latestPost.title}
                </h3>
                <p className="text-stone leading-relaxed mb-8 line-clamp-3">
                  {latestPost.excerpt || latestPost.content?.replace(/<[^>]*>/g, '').slice(0, 200)}...
                </p>
                <span className="inline-flex items-center gap-3 text-ink hover:text-warm transition-colors">
                  <span className="text-sm uppercase tracking-[0.2em]">Read Article</span>
                  <span className="group-hover:translate-x-2 transition-transform">→</span>
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* QUOTE / TESTIMONIAL */}
      <section className="py-24 lg:py-32 bg-ink text-cream">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-12 h-px bg-warm mx-auto mb-10" />
          <blockquote className="font-serif text-3xl md:text-4xl lg:text-5xl leading-tight mb-10">
            "Kenedy doesn't just write stories — 
            he builds entire universes that linger in your mind long after the final page."
          </blockquote>
          <cite className="text-cream/50 not-italic text-sm uppercase tracking-[0.3em]">
            — The New York Times
          </cite>
        </div>
      </section>
    </div>
  );
}