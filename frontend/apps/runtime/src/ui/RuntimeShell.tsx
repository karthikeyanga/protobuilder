import type { AppConfig, PageConfig } from '@protobuilder/schema';
import { mockAppConfig, mockPages } from '../mocks/mock-app';

type ResolvedPage = PageConfig & { route: string };

const pageMap: Record<string, ResolvedPage> = Object.fromEntries(
  mockPages.map((p) => [p.route, { ...p }])
);

export function RuntimeShell() {
  const app: AppConfig = mockAppConfig;
  const currentRoute = app.exposure?.routes?.[0]?.path ?? '/';
  const page = pageMap[currentRoute];

  return (
    <div className="runtime">
      <header className="header">ProtoBuilder — Runtime (mocked)</header>
      <div className="runtime-body">
        <aside className="sidebar">
          <h3>Pages</h3>
          <ul>
            {app.exposure?.routes?.map((r) => (
              <li key={r.path}>{r.path} ({r.auth})</li>
            )) || <li>None</li>}
          </ul>
        </aside>
        <main className="page">
          <h3>{page?.name ?? 'No page'}</h3>
          {page ? (
            <div className="page-components">
              {page.components.map((c) => (
                <div key={c.id} className="component-card">
                  <div className="component-title">{c.widgetRef}</div>
                  <div className="component-body">
                    <div>id: {c.id}</div>
                    {c.props && <div>props: {JSON.stringify(c.props)}</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No page resolved for route {currentRoute}</p>
          )}
        </main>
        <aside className="inspector">
          <h3>App Config</h3>
          <pre>{JSON.stringify(app, null, 2)}</pre>
        </aside>
      </div>
    </div>
  );
}


