import { useState } from 'react';
import type { AppConfig } from '@protobuilder/schema';
import { mockAppConfig } from '../mocks/mock-app';

export function App() {
  const [config] = useState<AppConfig>(mockAppConfig);

  return (
    <div className="layout">
      <header className="header">ProtoBuilder — Builder (mocked)</header>
      <div className="body">
        <aside className="sidebar">
          <h3>Palette</h3>
          <ul>
            <li>Text</li>
            <li>Select</li>
            <li>Button</li>
            <li>Table</li>
          </ul>
        </aside>
        <main className="canvas">
          <h3>Canvas (Preview)</h3>
          <div className="canvas-inner">
            <p>App: {config.appId}</p>
            <p>Pages: {config.pages.join(', ') || '—'}</p>
            <p>Connectors: {config.connectors.join(', ') || '—'}</p>
          </div>
        </main>
        <aside className="inspector">
          <h3>Properties</h3>
          <pre>{JSON.stringify(config, null, 2)}</pre>
        </aside>
      </div>
    </div>
  );
}


