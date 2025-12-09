import { useState } from 'react';

type Widget = { name: string; version: string; desc?: string };

export function WidgetsPage() {
  const [widgets, setWidgets] = useState<Widget[]>([
    { name: 'Autocomplete', version: '1.0.0', desc: 'Suggestive input' }
  ]);
  const [draft, setDraft] = useState<Widget>({ name: '', version: '0.0.1', desc: '' });

  const add = () => {
    if (!draft.name.trim()) return;
    setWidgets((prev) => [...prev, { ...draft }]);
    setDraft({ name: '', version: '0.0.1', desc: '' });
  };

  const remove = (name: string) => setWidgets((prev) => prev.filter((w) => w.name !== name));

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Widgets</h3>
        <div className="inline-form">
          <input placeholder="Name" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
          <input placeholder="Version" value={draft.version} onChange={(e) => setDraft((d) => ({ ...d, version: e.target.value }))} />
          <input placeholder="Description" value={draft.desc} onChange={(e) => setDraft((d) => ({ ...d, desc: e.target.value }))} />
          <button className="ghost small" onClick={add} disabled={!draft.name.trim()}>
            Add
          </button>
        </div>
      </div>
      {widgets.length === 0 ? (
        <div className="panel-placeholder">No widgets yet.</div>
      ) : (
        <div className="list">
          {widgets.map((w) => (
            <div
              key={w.name}
              className="list-row"
              role="button"
              tabIndex={0}
              onKeyDown={(ev) => {
                if (ev.key === 'Enter' || ev.key === ' ') {
                  ev.preventDefault();
                  remove(w.name);
                }
              }}
            >
              <div>
                <div className="title">{w.name}</div>
                <div className="muted">v{w.version}</div>
                {w.desc && <div className="muted">{w.desc}</div>}
              </div>
              <button className="ghost small" onClick={() => remove(w.name)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
