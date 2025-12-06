import { useMemo, useState } from 'react';
import type { AppConfig } from '@protobuilder/schema';
import { mockAppConfig, mockPages, mockConnectors } from '../mocks/mock-app';

type LeftTab = 'toolbox' | 'pages' | 'workflows' | 'data';
type MainTab = 'design' | 'code';

const controlIcon: Record<string, string> = {
  Text: '📝',
  TextArea: '📄',
  Select: '🔽',
  ComboBox: '🧩',
  Radio: '🔘',
  Checkbox: '☑️',
  Date: '📅',
  FileUpload: '📤',
  Button: '🔲',
  Table: '📊',
  Tabs: '📑',
  'Grid-2col': '⬜⬜',
  'Grid-3col': '⬜⬜⬜',
  TableLayout: '📋',
  Autocomplete: '✨',
  MultiSelect: '🗂️',
  DataTable: '📈',
  Stepper: '🪜',
  FileUploader: '☁️',
  DateRangePicker: '📆'
};

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
  const [components, setComponents] = useState(() => mockPages[0]?.components ?? []);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragPayload, setDragPayload] = useState<{ kind: 'control' | 'layout'; name: string } | null>(null);
  const [dropHover, setDropHover] = useState(false);
  const [leftTab, setLeftTab] = useState<LeftTab>('toolbox');
  const [mainTab, setMainTab] = useState<MainTab>('design');
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [bottomCollapsed, setBottomCollapsed] = useState(false);

  const codePreview = useMemo(
    () =>
      `// generated UI (placeholder)\nexport const config = ${JSON.stringify(
        { ...config, pages: [{ ...mockPages[0], components }] },
        null,
        2
      )};`,
    [config, components]
  );

  const addControl = (control: string) => {
    setComponents((prev) => [
      ...prev,
      {
        id: `${control}-${prev.length + 1}`,
        widgetRef: control,
        props: { label: control, placeholder: `${control} placeholder` }
      }
    ]);
  };

  const removeLast = () => setComponents((prev) => prev.slice(0, -1));
  const addLayout = (layout: string) => {
    setComponents((prev) => [
      ...prev,
      { id: `${layout}-${prev.length + 1}`, widgetRef: layout, props: { columns: layout === 'Grid-2col' ? 2 : 3 } }
    ]);
  };

  const onDragStart = (id: string) => setDragId(id);
  const onDragOver = (targetId: string) => {
    setComponents((prev) => {
      if (!dragId || dragId === targetId) return prev;
      const fromIdx = prev.findIndex((c) => c.id === dragId);
      const toIdx = prev.findIndex((c) => c.id === targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const next = [...prev];
      const [item] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, item);
      return next;
    });
  };
  const onDragEnd = () => setDragId(null);
  const onCanvasDrop = () => {
    if (!dragPayload) return;
    if (dragPayload.kind === 'control') {
      addControl(dragPayload.name);
    } else {
      addLayout(dragPayload.name);
    }
    setDragPayload(null);
    setDropHover(false);
  };
  const onCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDropHover(true);
  };
  const onCanvasDragLeave = () => setDropHover(false);

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
                      <div className="tool-grid">
                        {group.items.map((c) => (
                          <button
                            key={c}
                            className="tool-btn"
                            title={c}
                            aria-label={c}
                            onClick={() => addControl(c)}
                            draggable
                            onDragStart={() => setDragPayload({ kind: 'control', name: c })}
                          >
                            <span className="icon">{controlIcon[c] ?? '🔧'}</span>
                            <span className="label">{c}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="group">
                    <div className="group-title">Alignment & Layout</div>
                    <div className="tool-grid">
                      <button className="tool-btn" title="2-column section" aria-label="2-column section" onClick={() => addLayout('Grid-2col')}>
                        <span className="icon">{controlIcon['Grid-2col']}</span>
                        <span className="label">2-col</span>
                      </button>
                      <button className="tool-btn" title="3-column section" aria-label="3-column section" onClick={() => addLayout('Grid-3col')}>
                        <span className="icon">{controlIcon['Grid-3col']}</span>
                        <span className="label">3-col</span>
                      </button>
                      <button className="tool-btn" title="Table layout" aria-label="Table layout" onClick={() => addLayout('TableLayout')}>
                        <span className="icon">{controlIcon['TableLayout']}</span>
                        <span className="label">Table</span>
                      </button>
                    </div>
                  </div>
                  <div className="group">
                    <div className="group-title">Built-in Widgets</div>
                    <div className="tool-grid">
                      {builtInWidgets.map((w) => (
                        <button
                          key={w}
                          className="tool-btn"
                          title={w}
                          aria-label={w}
                          onClick={() => addControl(w)}
                          draggable
                          onDragStart={() => setDragPayload({ kind: 'control', name: w })}
                        >
                          <span className="icon">{controlIcon[w] ?? '✨'}</span>
                          <span className="label">{w}</span>
                        </button>
                      ))}
                    </div>
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
              <div
                className={`canvas-inner ${dropHover ? 'drop-over' : ''}`}
                onDragOver={onCanvasDragOver}
                onDragLeave={onCanvasDragLeave}
                onDrop={onCanvasDrop}
              >
                <p className="hint">Add controls from the toolbox; they appear below.</p>
                <div className="chip-row">
                  <span className="chip">App: {config.appId}</span>
                  <span className="chip">Pages: {config.pages.length}</span>
                  <span className="chip">Connectors: {config.connectors.length}</span>
                </div>
                <div className="component-grid">
                  {components.length === 0 && <div className="empty">No components yet. Add from the left.</div>}
                  {components.map((c) => (
                    <div
                      key={c.id}
                      className="component-card"
                      draggable
                      onDragStart={() => onDragStart(c.id)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        onDragOver(c.id);
                      }}
                      onDragEnd={onDragEnd}
                    >
                      <div className="component-title">
                        <span className="drag-handle">≡</span> {c.widgetRef}
                      </div>
                      <div className="component-body">
                        <div>ID: {c.id}</div>
                        {c.props && <div>Props: {JSON.stringify(c.props)}</div>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="canvas-actions">
                  <button type="button" className="ghost" onClick={removeLast} disabled={components.length === 0}>
                    Remove last
                  </button>
                </div>
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


