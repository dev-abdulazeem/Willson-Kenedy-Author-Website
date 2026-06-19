import { useEffect, useState } from 'react';
import api from '../api/axios';

const API_BASE = 'https://willson-kenedy-author-website.onrender.com';

function getImageUrl(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}

function LazyImage({ src, alt, className, fallback }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full h-full">
      {!loaded && <div className="absolute inset-0 bg-stone/10 animate-pulse" />}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          e.target.onerror = null;
          e.target.style.display = 'none';
          if (fallback) e.target.parentElement.innerHTML = fallback;
        }}
      />
    </div>
  );
}

function AboutSkeleton() {
  return (
    <div className="min-h-screen bg-cream animate-pulse">
      <div className="bg-ink pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-3 bg-cream/10 rounded w-32 mb-4" />
          <div className="h-16 bg-cream/10 rounded w-96" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5">
            <div className="aspect-[3/4] rounded-xl bg-stone/10" />
          </div>
          <div className="lg:col-span-7 py-8 space-y-6">
            <div className="h-8 bg-stone/10 rounded w-3/4" />
            <div className="h-4 bg-stone/10 rounded w-full" />
            <div className="h-4 bg-stone/10 rounded w-full" />
            <div className="h-4 bg-stone/10 rounded w-2/3" />
            <div className="pt-8 space-y-4">
              <div className="h-6 bg-stone/10 rounded w-48" />
              {[1,2,3,4].map(i => (
                <div key={i} className="flex justify-between py-4 border-b border-stone/5">
                  <div className="h-4 bg-stone/10 rounded w-48" />
                  <div className="h-4 bg-stone/10 rounded w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function About() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/site')
      .then(res => setSettings(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AboutSkeleton />;

  const fallbackHtml = `<div class="w-full h-full bg-parchment flex items-center justify-center"><span class="font-serif text-9xl text-stone/20">W</span></div>`;

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-ink text-cream pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-warm text-sm uppercase tracking-[0.3em] mb-4 animate-fade-in">The Author</p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl animate-fade-in">Willson Kenedy</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5">
            <div className="sticky top-28">
              <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-xl bg-parchment">
                {settings.author_photo ? (
                  <LazyImage
                    src={getImageUrl(settings.author_photo)}
                    alt="Willson Kenedy"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    fallback={fallbackHtml}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-serif text-9xl text-stone/20">W</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 py-8 animate-fade-in">
            <div className="prose prose-xl max-w-none text-stone leading-relaxed space-y-6">
              <p className="font-serif text-2xl text-ink leading-relaxed">
                {settings.about_text || 'Willson Kenedy is an acclaimed author whose work explores the intersection of memory, identity, and the stories we tell ourselves.'}
              </p>
              <p>
                With a distinctive voice that blends literary fiction with elements of mystery and magical realism, 
                Kenedy has established himself as one of the most compelling storytellers of his generation.
              </p>
              <p>
                His debut novel, <em>The Silent Echo</em>, was published to critical acclaim and has been translated 
                into over twenty languages. Since then, he has continued to push the boundaries of contemporary fiction, 
                earning numerous awards and a devoted global readership.
              </p>
            </div>

            <div className="mt-16 pt-16 border-t border-stone/10">
              <h3 className="font-serif text-2xl text-ink mb-8">Recognition</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { award: 'Pulitzer Prize Finalist', year: '2023' },
                  { award: 'National Book Award', year: '2022' },
                  { award: 'PEN/Faulkner Award', year: '2021' },
                  { award: 'Guggenheim Fellowship', year: '2020' },
                ].map((item, i) => (
                  <div 
                    key={item.award} 
                    className="flex justify-between items-center py-4 border-b border-stone/5 group hover:border-warm/30 transition-colors"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <span className="text-ink font-medium group-hover:text-warm transition-colors">{item.award}</span>
                    <span className="text-muted text-sm font-mono">{item.year}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}