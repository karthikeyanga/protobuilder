import { useState } from 'react';

type Theme = { name: string; primary: string; accent: string };

export function ThemePage() {
  const [themes, setThemes] = useState<Theme[]>([{ name: 'Default', primary: '#1f75ff', accent: '#ff6b6b' }]);
  const [draft, setDraft] = useState<Theme>({ name: '', primary: '#000000', accent: '#ffffff' });

  const add = () => {
    if (!draft.name.trim()) return;
    setThemes((prev) => [...prev, { ...draft }]);
    setDraft({ name: '', primary: '#000000', accent: '#ffffff' });
  };

  const remove = (name: string) => setThemes((prev) => prev.filter((t) => t.name !== name));

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Theme & Navigation</h3>
        <div className="inline-form">
          <input placeholder="Name" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
          <input type="color" value={draft.primary} onChange={(e) => setDraft((d) => ({ ...d, primary: e.target.value }))} />
          <input type="color" value={draft.accent} onChange={(e) => setDraft((d) => ({ ...d, accent: e.target.value }))} />
          <button className="ghost small" onClick={add} disabled={!draft.name.trim()}>
            Add
          </button>
        </div>
      </div>
      {themes.length === 0 ? (
        <div className="panel-placeholder">No themes yet.</div>
      ) : (
        <div className="list">
          {themes.map((t) => (
            <div key={t.name} className="list-row">
              <div>
                <div className="title">{t.name}</div>
                <div className="muted">
                  Primary <span style={{ background: t.primary, padding: '0 8px' }} /> Accent{' '}
                  <span style={{ background: t.accent, padding: '0 8px' }} />
                </div>
              </div>
              <button className="ghost small" onClick={() => remove(t.name)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
