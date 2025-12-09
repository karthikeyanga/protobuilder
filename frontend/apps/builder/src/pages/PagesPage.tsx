import { useState } from 'react';
import { mockPages } from '../mocks/mock-app';

type PageDraft = { name: string; route: string; layout: string };

export function PagesPage() {
  const [pages, setPages] = useState(mockPages);
  const [draft, setDraft] = useState<PageDraft>({ name: '', route: '', layout: 'single-column' });

  const add = () => {
    if (!draft.name.trim()) return;
    setPages((prev) => [...prev, { ...draft, components: [] } as any]);
    setDraft({ name: '', route: '', layout: 'single-column' });
  };

  const remove = (name: string) => setPages((prev) => prev.filter((p) => p.name !== name));

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Pages</h3>
        <div className="inline-form">
          <input placeholder="Name" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
          <input placeholder="Route" value={draft.route} onChange={(e) => setDraft((d) => ({ ...d, route: e.target.value }))} />
          <select value={draft.layout} onChange={(e) => setDraft((d) => ({ ...d, layout: e.target.value }))}>
            <option value="single-column">Single column</option>
            <option value="two-column">Two column</option>
            <option value="grid">Grid</option>
          </select>
          <button className="ghost small" onClick={add} disabled={!draft.name.trim()}>
            Add
          </button>
        </div>
      </div>
      {pages.length === 0 ? (
        <div className="panel-placeholder">No pages yet.</div>
      ) : (
        <div className="list">
          {pages.map((p) => (
            <div
              key={p.name}
              className="list-row"
              role="button"
              tabIndex={0}
              onKeyDown={(ev) => {
                if (ev.key === 'Enter' || ev.key === ' ') {
                  ev.preventDefault();
                  remove(p.name);
                }
              }}
            >
              <div>
                <div className="title">{p.name}</div>
                <div className="muted">{p.route}</div>
                <div className="muted">{p.layout}</div>
              </div>
              <button className="ghost small" onClick={() => remove(p.name)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
