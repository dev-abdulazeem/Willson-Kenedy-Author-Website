import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
      {!loaded && <div className="absolute inset-0 bg-stone/10 animate-pulse rounded-xl" />}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={onError}
      />
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className="min-h-screen bg-cream animate-pulse">
      <div className="py-12 sm:py-20 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="h-4 bg-stone/10 rounded w-24 sm:w-32 mb-6 sm:mb-8" />
        <div className="aspect-[21/9] rounded-xl bg-stone/10 mb-8 sm:mb-10" />
        <div className="h-3 sm:h-4 bg-stone/10 rounded w-20 sm:w-24 mb-2" />
        <div className="h-8 sm:h-12 bg-stone/10 rounded w-3/4 mb-6 sm:mb-8" />
        <div className="space-y-3 sm:space-y-4">
          <div className="h-3 sm:h-4 bg-stone/10 rounded w-full" />
          <div className="h-3 sm:h-4 bg-stone/10 rounded w-full" />
          <div className="h-3 sm:h-4 bg-stone/10 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

export default function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/posts/${slug}`)
      .then(res => setPost(res.data))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <PostSkeleton />;

  if (!post) return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-stone text-lg mb-4">Post not found</p>
        <Link to="/blog" className="text-warm hover:underline inline-flex items-center gap-2">
          ← Back to Journal
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream">
      <div className="py-12 sm:py-20 px-4 sm:px-6 max-w-4xl mx-auto">
        <Link 
          to="/blog" 
          className="text-stone hover:text-warm transition-colors mb-6 sm:mb-8 inline-flex items-center gap-2 group text-xs sm:text-sm uppercase tracking-wider"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Journal
        </Link>
        
        {post.cover_image && (
          <div className="rounded-xl overflow-hidden mb-8 sm:mb-10 shadow-lg">
            <LazyImage
              src={getImageUrl(post.cover_image)}
              alt={post.title}
              className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}
        
        <div className="animate-fade-in">
          <p className="text-warm font-medium mb-2 text-xs sm:text-sm uppercase tracking-wider">
            {new Date(post.published_at).toLocaleDateString('en-US', { 
              month: 'long', day: 'numeric', year: 'numeric' 
            })}
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-ink mb-6 sm:mb-8 leading-tight">
            {post.title}
          </h1>
          
          <div 
            className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-stone leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Navigation */}
        <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-stone/10">
          <Link 
            to="/blog"
            className="inline-flex items-center gap-2 text-stone hover:text-warm transition-colors text-xs sm:text-sm uppercase tracking-wider group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> All Entries
          </Link>
        </div>
      </div>
    </div>
  );
}