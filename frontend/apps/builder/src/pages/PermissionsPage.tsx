import { useState } from 'react';

type Role = { name: string; grants: string };

export function PermissionsPage() {
  const [roles, setRoles] = useState<Role[]>([
    { name: 'admin', grants: 'all' },
    { name: 'agent', grants: 'view, edit' }
  ]);
  const [draft, setDraft] = useState<Role>({ name: '', grants: '' });

  const add = () => {
    if (!draft.name.trim()) return;
    setRoles((prev) => [...prev, { ...draft }]);
    setDraft({ name: '', grants: '' });
  };

  const remove = (name: string) => setRoles((prev) => prev.filter((r) => r.name !== name));

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Permissions</h3>
        <div className="inline-form">
          <input placeholder="Role" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
          <input placeholder="Grants" value={draft.grants} onChange={(e) => setDraft((d) => ({ ...d, grants: e.target.value }))} />
          <button className="ghost small" onClick={add} disabled={!draft.name.trim()}>
            Add
          </button>
        </div>
      </div>
      {roles.length === 0 ? (
        <div className="panel-placeholder">No roles yet.</div>
      ) : (
        <div className="list">
          {roles.map((r) => (
            <div key={r.name} className="list-row">
              <div>
                <div className="title">{r.name}</div>
                <div className="muted">{r.grants}</div>
              </div>
              <button className="ghost small" onClick={() => remove(r.name)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
