import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
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

function SectionSkeleton() {
  return (
    <div className="bg-charcoal rounded-xl p-8 mb-8 border border-cream/5 animate-pulse">
      <div className="h-6 bg-cream/5 rounded w-48 mb-6" />
      <div className="space-y-6">
        <div className="h-12 bg-cream/5 rounded" />
        <div className="h-32 bg-cream/5 rounded" />
      </div>
    </div>
  );
}

export default function AdminSite() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [heroImage, setHeroImage] = useState(null);
  const [heroPreview, setHeroPreview] = useState(null);
  const [authorPhoto, setAuthorPhoto] = useState(null);
  const [authorPreview, setAuthorPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedKey, setSavedKey] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/admin/login'); return; }
    fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/site');
      setSettings(res.data);
    } finally {
      setLoading(false);
    }
  };

  const showSaved = (key) => {
    setSavedKey(key);
    setTimeout(() => setSavedKey(null), 1500);
  };

  const handleTextUpdate = async (key, value) => {
    setSaving(true);
    await api.put('/site', { key, value, type: 'text' });
    await fetchSettings();
    setSaving(false);
    showSaved(key);
  };

  const handleImageUpload = async (key, file) => {
    if (!file) return;
    setSaving(true);
    const data = new FormData();
    data.append('image', file);
    const res = await api.post('/uploads', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    await api.put('/site', { key, value: res.data.imageUrl, type: 'image' });
    await fetchSettings();
    setSaving(false);
    if (key === 'hero_image') { setHeroImage(null); setHeroPreview(null); }
    if (key === 'author_photo') { setAuthorPhoto(null); setAuthorPreview(null); }
    showSaved(key);
  };

  const handleImageDelete = async (key) => {
  if (!confirm('Remove this image?')) return;
  setSaving(true);
  
  // Optionally delete from Cloudinary too
  const currentUrl = settings[key];
  if (currentUrl && currentUrl.includes('cloudinary')) {
    try {
      await api.delete('/uploads/', { data: { imageUrl: currentUrl } });
    } catch (err) {
      console.log('Cloudinary delete failed or image already gone');
    }
  }
  
  await api.put('/site', { key, value: '', type: 'image' });
  await fetchSettings();
  setSaving(false);
  showSaved(key);
};

  const handleHeroChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHeroImage(file);
      setHeroPreview(URL.createObjectURL(file));
    }
  };

  const handleAuthorChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAuthorPhoto(file);
      setAuthorPreview(URL.createObjectURL(file));
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-ink text-cream">
        <header className="bg-charcoal border-b border-cream/10 px-6 lg:px-12 py-5">
          <div className="h-5 bg-cream/5 rounded w-24" />
        </header>
        <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12">
          <div className="h-8 bg-cream/5 rounded w-48 mb-2" />
          <div className="h-4 bg-cream/5 rounded w-64 mb-12" />
          {[1, 2, 3].map(i => <SectionSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-cream">
      <header className="bg-charcoal border-b border-cream/10 px-6 lg:px-12 py-5 flex items-center justify-between sticky top-0 z-30 backdrop-blur-xl bg-charcoal/90">
        <div className="flex items-center gap-4">
          <Link 
            to="/admin" 
            className="text-sm text-cream/40 hover:text-cream transition-colors flex items-center gap-2 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Dashboard
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {saving && (
            <span className="text-sm text-cream/30 flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-cream/20 border-t-warm rounded-full animate-spin" />
              Saving...
            </span>
          )}
          {savedKey && (
            <span className="text-sm text-green-400 flex items-center gap-1 animate-fade-in">
              <span>✓</span> Saved
            </span>
          )}
          <Link 
            to="/" 
            className="text-sm text-cream/40 hover:text-cream transition-colors px-4 py-2 rounded-lg hover:bg-cream/5"
          >
            View Site
          </Link>
          <button 
            onClick={() => { logout(); navigate('/admin/login'); }}
            className="text-sm text-warm hover:text-cream transition-colors px-5 py-2 rounded-lg bg-warm/10 hover:bg-warm/20 border border-warm/20"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12">
        <div className="mb-12">
          <h1 className="font-serif text-3xl lg:text-4xl text-cream mb-2">Site Content</h1>
          <p className="text-cream/30 text-sm">Manage your website appearance</p>
        </div>

        {/* Hero Section */}
        <div className="bg-charcoal rounded-xl p-8 mb-8 border border-cream/10 hover:border-cream/15 transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-warm/20 flex items-center justify-center text-warm text-lg font-serif">1</div>
            <h2 className="font-serif text-xl text-cream">Hero Section</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-cream/40 mb-3">Hero Tagline</label>
              <input
                defaultValue={settings.hero_tagline || ''}
                onBlur={e => handleTextUpdate('hero_tagline', e.target.value)}
                className="w-full px-5 py-4 bg-ink border border-cream/10 rounded-lg text-cream placeholder:text-cream/20 focus:border-warm focus:outline-none transition-colors"
                placeholder="Your main headline"
              />
              {savedKey === 'hero_tagline' && <span className="text-xs text-green-400 mt-1 block">✓ Saved</span>}
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-cream/40 mb-3">Hero Image</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label className="px-5 py-3 bg-cream/5 border border-cream/10 rounded-lg text-sm text-cream/50 hover:text-cream hover:border-cream/20 transition-all cursor-pointer flex-shrink-0 hover:bg-cream/10">
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeroChange}
                    className="hidden"
                  />
                </label>
                {heroImage && <span className="text-sm text-cream/50">{heroImage.name}</span>}
                <button
                  onClick={() => handleImageUpload('hero_image', heroImage)}
                  disabled={!heroImage}
                  className="px-5 py-3 bg-warm text-cream rounded-lg text-sm font-medium hover:bg-warm/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                >
                  Upload
                </button>
              </div>
              
              {(heroPreview || settings.hero_image) && (
                <div className="mt-4 relative inline-block group rounded-lg overflow-hidden">
                  <LazyImage
                    src={heroPreview || getImageUrl(settings.hero_image)}
                    alt="Hero preview"
                    className="h-48 rounded-lg object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => handleImageDelete('hero_image')}
                      className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm hover:bg-red-500/30 transition-colors flex items-center gap-2 hover:scale-105"
                    >
                      <span>🗑</span> Remove Image
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-charcoal rounded-xl p-8 mb-8 border border-cream/10 hover:border-cream/15 transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-warm/20 flex items-center justify-center text-warm text-lg font-serif">2</div>
            <h2 className="font-serif text-xl text-cream">About Page</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-cream/40 mb-3">Author Photo</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label className="px-5 py-3 bg-cream/5 border border-cream/10 rounded-lg text-sm text-cream/50 hover:text-cream hover:border-cream/20 transition-all cursor-pointer flex-shrink-0 hover:bg-cream/10">
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAuthorChange}
                    className="hidden"
                  />
                </label>
                {authorPhoto && <span className="text-sm text-cream/50">{authorPhoto.name}</span>}
                <button
                  onClick={() => handleImageUpload('author_photo', authorPhoto)}
                  disabled={!authorPhoto}
                  className="px-5 py-3 bg-warm text-cream rounded-lg text-sm font-medium hover:bg-warm/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                >
                  Upload
                </button>
              </div>
              
              {(authorPreview || settings.author_photo) && (
                <div className="mt-4 relative inline-block group">
                  <LazyImage
                    src={authorPreview || getImageUrl(settings.author_photo)}
                    alt="Author"
                    className="h-40 w-40 rounded-full object-cover border-2 border-cream/10"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                    <button
                      onClick={() => handleImageDelete('author_photo')}
                      className="px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-sm hover:bg-red-500/30 transition-colors flex items-center gap-1 hover:scale-105"
                    >
                      <span>🗑</span> Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-cream/40 mb-3">About Text</label>
              <textarea
                defaultValue={settings.about_text || ''}
                onBlur={e => handleTextUpdate('about_text', e.target.value)}
                rows={6}
                className="w-full px-5 py-4 bg-ink border border-cream/10 rounded-lg text-cream placeholder:text-cream/20 focus:border-warm focus:outline-none transition-colors resize-none"
                placeholder="Write your bio..."
              />
              {savedKey === 'about_text' && <span className="text-xs text-green-400 mt-1 block">✓ Saved</span>}
            </div>
          </div>
        </div>

        {/* General */}
        <div className="bg-charcoal rounded-xl p-8 border border-cream/10 hover:border-cream/15 transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-warm/20 flex items-center justify-center text-warm text-lg font-serif">3</div>
            <h2 className="font-serif text-xl text-cream">General</h2>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-cream/40 mb-3">Site Title</label>
            <input
              defaultValue={settings.site_title || ''}
              onBlur={e => handleTextUpdate('site_title', e.target.value)}
              className="w-full px-5 py-4 bg-ink border border-cream/10 rounded-lg text-cream placeholder:text-cream/20 focus:border-warm focus:outline-none transition-colors"
              placeholder="Willson Kenedy"
            />
            {savedKey === 'site_title' && <span className="text-xs text-green-400 mt-1 block">✓ Saved</span>}
          </div>
        </div>
      </div>
    </div>
  );
}