import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

// Cloudinary URLs are already full — no need to prepend anything
function getImageUrl(path) {
  if (!path) return null;
  // If it's already a full URL (Cloudinary), return as-is
  if (path.startsWith('http')) return path;
  // Fallback for any relative paths
  return path;
}

function LazyImage({ src, alt, className, fallback }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error) {
    return fallback ? (
      <div className={className} dangerouslySetInnerHTML={{ __html: fallback }} />
    ) : (
      <div className={`${className} flex items-center justify-center bg-stone/10`}>
        <span className="font-serif text-4xl text-stone/20">{alt?.[0] || 'W'}</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {!loaded && <div className="absolute inset-0 bg-stone/10 animate-pulse rounded-xl" />}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
}

function PostCardSkeleton({ featured }) {
  return (
    <div className={`group ${featured ? 'md:col-span-2' : ''}`}>
      <article className={`${featured ? 'grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center' : ''}`}>
        <div className={`aspect-[16/10] rounded-xl overflow-hidden bg-parchment ${!featured ? 'mb-4 sm:mb-6' : ''}`}>
          <div className="w-full h-full bg-stone/10 animate-pulse" />
        </div>
        <div className="space-y-2 sm:space-y-3">
          <div className="h-3 bg-stone/10 rounded w-24 sm:w-32" />
          <div className={`h-6 sm:h-8 bg-stone/10 rounded ${featured ? 'w-3/4' : 'w-full'}`} />
          <div className="h-3 sm:h-4 bg-stone/10 rounded w-full" />
          <div className="h-3 sm:h-4 bg-stone/10 rounded w-2/3" />
          <div className="h-3 bg-stone/10 rounded w-20 sm:w-24 pt-2" />
        </div>
      </article>
    </div>
  );
}

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get('/posts')
      .then(res => {
        const publishedPosts = (res.data || []).filter(post => post.is_published);
        setPosts(publishedPosts);
      })
      .catch(err => {
        console.error('Failed to fetch posts:', err);
        setError('Failed to load posts. Please try again later.');
      })
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Draft';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', { 
      month: 'long', day: 'numeric', year: 'numeric' 
    });
  };

  const getExcerpt = (post) => {
    if (post.excerpt) return post.excerpt;
    if (post.content) {
      const plainText = post.content.replace(/<[^>]*>/g, '').slice(0, 150);
      return plainText + (plainText.length >= 150 ? '...' : '');
    }
    return 'No excerpt available';
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-ink text-cream pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-warm text-xs sm:text-sm uppercase tracking-[0.3em] mb-2 sm:mb-4 animate-fade-in">Journal</p>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in">Thoughts & Essays</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {error && (
          <div className="text-center py-16 border border-red-200 bg-red-50 rounded-xl mb-8">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-ink text-cream rounded-lg text-sm hover:bg-ink/80"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
            {[1, 2, 3, 4].map(i => (
              <PostCardSkeleton key={i} featured={i === 1} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
            {posts.map((post, i) => (
              <Link 
                key={post.id} 
                to={`/blog/${post.slug}`}
                className={`group ${i === 0 ? 'md:col-span-2' : ''}`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <article className={`${i === 0 ? 'grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center' : ''}`}>
                  <div className={`aspect-[16/10] rounded-xl overflow-hidden bg-parchment ${i !== 0 ? 'mb-4 sm:mb-6' : ''}`}>
                    {post.cover_image ? (
                      <LazyImage
                        src={getImageUrl(post.cover_image)}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        fallback={`<div class="w-full h-full bg-stone/10 flex items-center justify-center"><span class="font-serif text-4xl text-stone/20">${post.title?.[0] || 'W'}</span></div>`}
                      />
                    ) : (
                      <div className="w-full h-full bg-stone/10 flex items-center justify-center">
                        <span className="font-serif text-4xl text-stone/20">{post.title?.[0] || 'W'}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-muted text-xs sm:text-sm mb-2 sm:mb-3">
                      {formatDate(post.published_at || post.created_at)}
                    </p>
                    <h2 className={`font-serif text-ink group-hover:text-warm transition-colors leading-tight mb-3 sm:mb-4 ${
                      i === 0 ? 'text-2xl sm:text-3xl md:text-4xl' : 'text-xl sm:text-2xl'
                    }`}>
                      {post.title}
                    </h2>
                    <p className="text-stone text-sm sm:text-base line-clamp-3 leading-relaxed">
                      {getExcerpt(post)}
                    </p>
                    <span className="inline-flex items-center gap-2 mt-4 sm:mt-6 text-xs sm:text-sm uppercase tracking-[0.15em] text-ink group-hover:text-warm transition-colors">
                      Read More <span className="group-hover:translate-x-2 transition-transform">→</span>
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-16 sm:py-20 border border-dashed border-stone/20 rounded-xl">
            <div className="text-3xl sm:text-4xl mb-4">📝</div>
            <p className="text-stone text-base sm:text-lg">No entries yet. Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}