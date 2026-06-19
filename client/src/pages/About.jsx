import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function About() {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    api.get('/site').then(res => setSettings(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-ink text-cream pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-warm text-sm uppercase tracking-[0.3em] mb-4">The Author</p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl">Willson Kenedy</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5">
            <div className="sticky top-28">
              <div className="aspect-[3/4] rounded-xl overflow-hidden">
                {settings.author_photo ? (
                  <img 
                    src={settings.author_photo}
                    alt="Willson Kenedy"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<div class="w-full h-full bg-parchment flex items-center justify-center"><span class="font-serif text-9xl text-stone/20">W</span></div>`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-parchment flex items-center justify-center">
                    <span className="font-serif text-9xl text-stone/20">W</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 py-8">
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
                ].map(item => (
                  <div key={item.award} className="flex justify-between items-center py-4 border-b border-stone/5">
                    <span className="text-ink font-medium">{item.award}</span>
                    <span className="text-muted text-sm">{item.year}</span>
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