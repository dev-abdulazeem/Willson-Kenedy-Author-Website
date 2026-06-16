import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Blog() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    api.get('/posts').then(res => setPosts(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-ink text-cream pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-warm text-sm uppercase tracking-[0.3em] mb-4">Journal</p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl">Thoughts & Essays</h1>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {posts.map((post, i) => (
            <Link 
              key={post.id} 
              to={`/blog/${post.slug}`}
              className={`group ${i === 0 ? 'md:col-span-2' : ''}`}
            >
              <article className={`${i === 0 ? 'grid lg:grid-cols-2 gap-12 items-center' : ''}`}>
                <div className={`aspect-[16/10] rounded-xl overflow-hidden bg-parchment ${i !== 0 ? 'mb-6' : ''}`}>
                  {post.cover_image ? (
                    <img 
                      src={`https://willson-kenedy-author-website.onrender.com${post.cover_image}`}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-stone/10" />
                  )}
                </div>
                <div>
                  <p className="text-muted text-sm mb-3">
                    {new Date(post.published_at).toLocaleDateString('en-US', { 
                      month: 'long', day: 'numeric', year: 'numeric' 
                    })}
                  </p>
                  <h2 className={`font-serif text-ink group-hover:text-warm transition-colors leading-tight mb-4 ${
                    i === 0 ? 'text-3xl md:text-4xl' : 'text-2xl'
                  }`}>
                    {post.title}
                  </h2>
                  <p className="text-stone line-clamp-3 leading-relaxed">
                    {post.excerpt || post.content?.replace(/<[^>]*>/g, '').slice(0, 150)}...
                  </p>
                  <span className="inline-flex items-center gap-2 mt-6 text-sm uppercase tracking-[0.15em] text-ink group-hover:text-warm transition-colors">
                    Read More <span className="group-hover:translate-x-2 transition-transform">→</span>
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}