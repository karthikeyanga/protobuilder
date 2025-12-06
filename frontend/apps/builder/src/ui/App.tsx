import { useMemo, useState } from 'react';
import type { AppConfig } from '@protobuilder/schema';
import { mockAppConfig, mockPages, mockConnectors } from '../mocks/mock-app';

type LeftTab = 'toolbox' | 'pages' | 'workflows' | 'data';
type MainTab = 'design' | 'code';

const paletteControls = [
  { group: 'Basic UI', items: ['Text', 'TextArea', 'Select', 'ComboBox', 'Radio', 'Checkbox', 'Date', 'FileUpload', 'Button', 'Table', 'Tabs'] },
  { group: 'Layout', items: ['Grid', 'Section', 'Accordion'] }
];

const builtInWidgets = [
  'Autocomplete',
  'MultiSelect',
  'DataTable',
  'Stepper',
  'FileUploader',
  'DateRangePicker'
];

export function App() {
  const [config] = useState<AppConfig>(mockAppConfig);
  const [leftTab, setLeftTab] = useState<LeftTab>('toolbox');
  const [mainTab, setMainTab] = useState<MainTab>('design');
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [bottomCollapsed, setBottomCollapsed] = useState(false);

  const codePreview = useMemo(
    () => `// generated UI (placeholder)\nexport const config = ${JSON.stringify(config, null, 2)};`,
    [config]
  );

  return (
    <div className="layout">
      <header className="topbar">
        <div className="logo">ProtoBuilder — Builder (mocked)</div>
        <div className="top-actions">
          <button type="button">Test</button>
          <button type="button">Debug</button>
          <button type="button">Deploy</button>
        </div>
      </header>

      <div className="main">
        <aside className={`left-pane ${leftCollapsed ? 'collapsed' : ''}`}>
          <div className="left-tabs">
            <button className={leftTab === 'toolbox' ? 'active' : ''} onClick={() => setLeftTab('toolbox')}>
              Toolbox
            </button>
            <button className={leftTab === 'pages' ? 'active' : ''} onClick={() => setLeftTab('pages')}>
              Pages
            </button>
            <button className={leftTab === 'workflows' ? 'active' : ''} onClick={() => setLeftTab('workflows')}>
              Workflows
            </button>
            <button className={leftTab === 'data' ? 'active' : ''} onClick={() => setLeftTab('data')}>
              Data
            </button>
            <button className="collapse" onClick={() => setLeftCollapsed((v) => !v)}>
              {leftCollapsed ? '▶' : '◀'}
            </button>
          </div>

          {!leftCollapsed && (
            <div className="left-content">
              {leftTab === 'toolbox' && (
                <>
                  {paletteControls.map((group) => (
                    <div key={group.group} className="group">
                      <div className="group-title">{group.group}</div>
                      <ul>
                        {group.items.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <div className="group">
                    <div className="group-title">Built-in Widgets</div>
                    <ul>
                      {builtInWidgets.map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
              {leftTab === 'pages' && (
                <div className="group">
                  <div className="group-title">Pages</div>
                  <ul>
                    {mockPages.map((p) => (
                      <li key={p.name}>{p.name}</li>
                    ))}
                  </ul>
                </div>
              )}
              {leftTab === 'workflows' && (
                <div className="group">
                  <div className="group-title">Workflows</div>
                  <ul>
                    <li>VehicleLookupFlow</li>
                    <li>ClaimsReviewFlow</li>
                    <li>Custom Task Nodes (placeholder)</li>
                  </ul>
                </div>
              )}
              {leftTab === 'data' && (
                <div className="group">
                  <div className="group-title">Connectors & Data</div>
                  <ul>
                    {mockConnectors.map((c) => (
                      <li key={c.id}>{c.id}</li>
                    ))}
                    <li>DB Sources (placeholder)</li>
                    <li>Storage Buckets (placeholder)</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </aside>

        <section className="center-pane">
          <div className="tab-bar">
            <div className="tabs">
              <button className={mainTab === 'design' ? 'active' : ''} onClick={() => setMainTab('design')}>
                Design
              </button>
              <button className={mainTab === 'code' ? 'active' : ''} onClick={() => setMainTab('code')}>
                Code
              </button>
            </div>
            <div className="breadcrumbs">vehicle-ops / VehicleSearch</div>
          </div>

          <div className="canvas">
            {mainTab === 'design' ? (
              <div className="canvas-inner">
                <p className="hint">Canvas preview (mock). Drag controls from the toolbox.</p>
                <p>App: {config.appId}</p>
                <p>Pages: {config.pages.join(', ') || '—'}</p>
                <p>Connectors: {config.connectors.join(', ') || '—'}</p>
              </div>
            ) : (
              <pre className="code-view">{codePreview}</pre>
            )}
          </div>
        </section>

        <aside className={`right-pane ${rightCollapsed ? 'collapsed' : ''}`}>
          <div className="right-header">
            <span>AI Assistant</span>
            <button className="collapse" onClick={() => setRightCollapsed((v) => !v)}>
              {rightCollapsed ? '◀' : '▶'}
            </button>
          </div>
          {!rightCollapsed && (
            <div className="right-content">
              <div className="ai-bubble">Ask AI to build a Vehicle Search form.</div>
              <div className="ai-bubble secondary">"Add a workflow step for document review."</div>
            </div>
          )}
        </aside>
      </div>

      <footer className={`bottom-pane ${bottomCollapsed ? 'collapsed' : ''}`}>
        <div className="bottom-header">
          <span>Logs / Debug</span>
          <button className="collapse" onClick={() => setBottomCollapsed((v) => !v)}>
            {bottomCollapsed ? '▲' : '▼'}
          </button>
        </div>
        {!bottomCollapsed && (
          <div className="bottom-content">
            <div>[info] Mock preview ready</div>
            <div>[warn] Connectors not wired (mock mode)</div>
          </div>
        )}
      </footer>
    </div>
  );
}


