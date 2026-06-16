import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function AdminSite() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({});
  const [heroImage, setHeroImage] = useState(null);
  const [authorPhoto, setAuthorPhoto] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/admin/login'); return; }
    fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    const res = await api.get('/site');
    setSettings(res.data);
  };

  const handleTextUpdate = async (key, value) => {
    setSaving(true);
    await api.put('/site', { key, value, type: 'text' });
    await fetchSettings();
    setSaving(false);
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
    // Reset file input
    if (key === 'hero_image') setHeroImage(null);
    if (key === 'author_photo') setAuthorPhoto(null);
  };

  const handleImageDelete = async (key) => {
    if (!confirm('Remove this image?')) return;
    setSaving(true);
    await api.put('/site', { key, value: '', type: 'image' });
    await fetchSettings();
    setSaving(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-ink text-cream">
      {/* Header */}
      <header className="bg-charcoal border-b border-cream/10 px-6 lg:px-12 py-5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link 
            to="/admin" 
            className="text-sm text-cream/40 hover:text-cream transition-colors flex items-center gap-2"
          >
            ← Dashboard
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {saving && (
            <span className="text-sm text-cream/30 flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-cream/20 border-t-warm rounded-full animate-spin" />
              Saving...
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
        <h1 className="font-serif text-3xl lg:text-4xl text-cream mb-2">Site Content</h1>
        <p className="text-cream/30 text-sm mb-12">Manage your website appearance</p>

        {/* Hero Section */}
        <div className="bg-charcoal rounded-xl p-8 mb-8 border border-cream/10">
          <h2 className="font-serif text-xl text-cream mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-warm/20 flex items-center justify-center text-warm text-sm">1</span>
            Hero Section
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-cream/40 mb-3">Hero Tagline</label>
              <input
                defaultValue={settings.hero_tagline || ''}
                onBlur={e => handleTextUpdate('hero_tagline', e.target.value)}
                className="w-full px-5 py-4 bg-ink border border-cream/10 rounded-lg text-cream placeholder:text-cream/20 focus:border-warm focus:outline-none transition-colors"
                placeholder="Your main headline"
              />
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-cream/40 mb-3">Hero Image</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label className="px-5 py-3 bg-cream/5 border border-cream/10 rounded-lg text-sm text-cream/50 hover:text-cream hover:border-cream/20 transition-all cursor-pointer flex-shrink-0">
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setHeroImage(e.target.files[0])}
                    className="hidden"
                  />
                </label>
                {heroImage && <span className="text-sm text-cream/50">{heroImage.name}</span>}
                <button
                  onClick={() => handleImageUpload('hero_image', heroImage)}
                  disabled={!heroImage}
                  className="px-5 py-3 bg-warm text-cream rounded-lg text-sm font-medium hover:bg-warm/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Upload
                </button>
              </div>
              
              {/* Image Preview with Delete */}
              {settings.hero_image && (
                <div className="mt-4 relative inline-block group">
                  <img 
                    src={`https://willson-kenedy-author-website.onrender.com${settings.hero_image}`} 
                    className="h-48 rounded-lg object-cover" 
                    alt="Hero preview" 
                  />
                  <div className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <button
                      onClick={() => handleImageDelete('hero_image')}
                      className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm hover:bg-red-500/30 transition-colors flex items-center gap-2"
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
        <div className="bg-charcoal rounded-xl p-8 mb-8 border border-cream/10">
          <h2 className="font-serif text-xl text-cream mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-warm/20 flex items-center justify-center text-warm text-sm">2</span>
            About Page
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-cream/40 mb-3">Author Photo</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label className="px-5 py-3 bg-cream/5 border border-cream/10 rounded-lg text-sm text-cream/50 hover:text-cream hover:border-cream/20 transition-all cursor-pointer flex-shrink-0">
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setAuthorPhoto(e.target.files[0])}
                    className="hidden"
                  />
                </label>
                {authorPhoto && <span className="text-sm text-cream/50">{authorPhoto.name}</span>}
                <button
                  onClick={() => handleImageUpload('author_photo', authorPhoto)}
                  disabled={!authorPhoto}
                  className="px-5 py-3 bg-warm text-cream rounded-lg text-sm font-medium hover:bg-warm/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Upload
                </button>
              </div>
              
              {/* Image Preview with Delete */}
              {settings.author_photo && (
                <div className="mt-4 relative inline-block group">
                  <img 
                    src={`https://willson-kenedy-author-website.onrender.com${settings.author_photo}`} 
                    className="h-40 w-40 rounded-full object-cover border-2 border-cream/10" 
                    alt="Author" 
                  />
                  <div className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                    <button
                      onClick={() => handleImageDelete('author_photo')}
                      className="px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-sm hover:bg-red-500/30 transition-colors flex items-center gap-1"
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
            </div>
          </div>
        </div>

        {/* General */}
        <div className="bg-charcoal rounded-xl p-8 border border-cream/10">
          <h2 className="font-serif text-xl text-cream mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-warm/20 flex items-center justify-center text-warm text-sm">3</span>
            General
          </h2>
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-cream/40 mb-3">Site Title</label>
            <input
              defaultValue={settings.site_title || ''}
              onBlur={e => handleTextUpdate('site_title', e.target.value)}
              className="w-full px-5 py-4 bg-ink border border-cream/10 rounded-lg text-cream placeholder:text-cream/20 focus:border-warm focus:outline-none transition-colors"
              placeholder="Willson Kenedy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}