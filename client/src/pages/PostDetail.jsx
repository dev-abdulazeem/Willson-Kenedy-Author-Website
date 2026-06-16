import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    api.get(`/posts/${slug}`).then(res => setPost(res.data));
  }, [slug]);

  if (!post) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="py-20 px-6 max-w-4xl mx-auto">
      <Link to="/blog" className="text-accent hover:underline mb-8 inline-block">← Back to Blog</Link>
      
      {post.cover_image && (
        <img 
          src={`https://willson-kenedy-author-website.onrender.com${post.cover_image}`}
          alt={post.title}
          className="w-full h-96 object-cover rounded-xl mb-10"
        />
      )}
      
      <p className="text-accent font-semibold mb-2">
        {new Date(post.published_at).toLocaleDateString()}
      </p>
      <h1 className="text-5xl font-bold text-primary mb-8">{post.title}</h1>
      
      <div 
        className="prose prose-lg max-w-none text-secondary/80 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </div>
  );
}