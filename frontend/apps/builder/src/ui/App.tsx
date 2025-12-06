import { useEffect, useMemo, useRef, useState } from 'react';
import type { AppConfig } from '@protobuilder/schema';
import { mockAppConfig, mockPages, mockConnectors } from '../mocks/mock-app';

type LeftTab = 'toolbox' | 'pages' | 'workflows' | 'data';
type MainTab = 'design' | 'code';
type RightTab = 'properties' | 'ai';
type Mode = 'builder' | 'applications' | 'checklist';

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
const controlDesc: Record<string, string> = {
  Text: 'Single-line text input',
  TextArea: 'Multi-line text input',
  Select: 'Dropdown select',
  ComboBox: 'Selectable with typing',
  Radio: 'Radio options',
  Checkbox: 'Boolean toggle',
  Date: 'Date picker',
  FileUpload: 'Upload a file',
  Button: 'Button',
  Table: 'Simple table',
  Tabs: 'Tabbed content',
  'Grid-2col': 'Two-column layout',
  'Grid-3col': 'Three-column layout',
  TableLayout: 'Table layout section',
  Autocomplete: 'Suggestions as you type',
  MultiSelect: 'Select multiple options',
  DataTable: 'Data table with header',
  Stepper: 'Step indicator',
  FileUploader: 'Upload with progress',
  DateRangePicker: 'Start/end date'
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
  const [components, setComponents] = useState(() =>
    (mockPages[0]?.components ?? []).map((c, idx) => ({
      ...c,
      xPct: 10 + idx * 5,
      yPct: 10 + idx * 4
    }))
  );
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragPayload, setDragPayload] = useState<{ kind: 'control' | 'layout'; name: string } | null>(null);
  const [dropHover, setDropHover] = useState(false);
  const [leftTab, setLeftTab] = useState<LeftTab>('toolbox');
  const [mainTab, setMainTab] = useState<MainTab>('design');
  const [rightTab, setRightTab] = useState<RightTab>('properties');
  const [mode, setMode] = useState<Mode>('applications');
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [bottomCollapsed, setBottomCollapsed] = useState(false);
  const [leftWidth, setLeftWidth] = useState(260);
  const [rightWidth, setRightWidth] = useState(320);
  const [bottomHeight, setBottomHeight] = useState(160);
  const [resizing, setResizing] = useState<{ side: 'left' | 'right' | 'bottom' | null }>({ side: null });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toolboxOpen, setToolboxOpen] = useState<Record<string, boolean>>({
    'Basic UI': true,
    Layout: true,
    'Alignment & Layout': true,
    'Built-in Widgets': true
  });
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const navWidth = 96;
  const [snapGrid, setSnapGrid] = useState(true);
  const snap = (v: number) => (snapGrid ? Math.min(100, Math.max(0, Math.round(v / 5) * 5)) : Math.min(100, Math.max(0, v)));
  const apps = [
    { id: 'new', name: '+ New Application' },
    { id: 'claims', name: 'Claims Ops' },
    { id: 'vehicle', name: 'Vehicle Search' }
  ];
  const checklist = useMemo(
    () => [
      { id: 'entities', title: 'Define Entities', desc: 'Model fields, constraints, hints.', action: 'Open Entities' },
      { id: 'connectors', title: 'Set up Connectors', desc: 'REST/GraphQL/DB/storage + auth.', action: 'Open Connectors' },
      { id: 'pages', title: 'Build Pages', desc: 'Forms, lists, bindings, validations.', action: 'Open Pages' },
      { id: 'widgets', title: 'Create Widgets', desc: 'Reusable UI with inputs/outputs.', action: 'Open Widgets' },
      { id: 'workflows', title: 'Define Workflows', desc: 'Map tasks to pages, signals.', action: 'Open Workflows' },
      { id: 'permissions', title: 'Permissions', desc: 'Roles, page/action access, tasks.', action: 'Set Permissions' },
      { id: 'theme', title: 'Theme & Nav', desc: 'Branding, navigation, route exposure.', action: 'Theme & Nav' },
      { id: 'release', title: 'Test & Release', desc: 'Mocks, approvals, deploy/export.', action: 'Release' }
    ],
    []
  );

  const codePreview = useMemo(
    () =>
      `// generated UI (placeholder)\nexport const config = ${JSON.stringify(
        { ...config, pages: [{ ...mockPages[0], components }] },
        null,
        2
      )};`,
    [config, components]
  );

  const addControl = (control: string, posPct?: { xPct: number; yPct: number }) => {
    setComponents((prev) => [
      ...prev,
      {
        id: `${control}-${prev.length + 1}`,
        widgetRef: control,
        props: { label: control, placeholder: `${control} placeholder` },
        xPct: posPct?.xPct ?? 10 + prev.length * 2,
        yPct: posPct?.yPct ?? 10 + prev.length * 2
      }
    ]);
  };

  const removeLast = () => setComponents((prev) => prev.slice(0, -1));
  const addLayout = (layout: string, posPct?: { xPct: number; yPct: number }) => {
    setComponents((prev) => [
      ...prev,
      {
        id: `${layout}-${prev.length + 1}`,
        widgetRef: layout,
        props: { columns: layout === 'Grid-2col' ? 2 : 3 },
        xPct: posPct?.xPct ?? 10 + prev.length * 2,
        yPct: posPct?.yPct ?? 10 + prev.length * 2
      }
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
  const onCanvasDrop = (e: React.DragEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    let posPct = { xPct: 5, yPct: 5 };
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      posPct = {
        xPct: snap((x / rect.width) * 100),
        yPct: snap((y / rect.height) * 100)
      };
    }
    if (!dragPayload) return;
    if (dragPayload.kind === 'control') {
      addControl(dragPayload.name, posPct);
    } else {
      addLayout(dragPayload.name, posPct);
    }
    setDragPayload(null);
    setDropHover(false);
  };
  const onCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDropHover(true);
  };
  const onCanvasDragLeave = () => setDropHover(false);

  // resize handlers
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (resizing.side === 'left') {
        setLeftWidth((w) => Math.min(400, Math.max(160, w + e.movementX)));
      } else if (resizing.side === 'right') {
        setRightWidth((w) => Math.min(400, Math.max(200, w - e.movementX)));
      } else if (resizing.side === 'bottom') {
        setBottomHeight((h) => Math.min(300, Math.max(100, h - e.movementY)));
      }
    };
    const onUp = () => setResizing({ side: null });
    if (resizing.side) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [resizing]);

  const updateSelectedProp = (key: string, value: unknown) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === selectedId ? { ...c, props: { ...(c.props ?? {}), [key]: value } } : c))
    );
  };

  const selectedComponent = components.find((c) => c.id === selectedId) || null;

  const renderControl = (c: typeof components[number]) => {
    const common = { className: 'control-preview' };
    switch (c.widgetRef) {
      case 'Text':
      case 'TextInput':
        return <input {...common} placeholder={String(c.props?.placeholder ?? 'Text input')} />;
      case 'TextArea':
        return <textarea {...common} placeholder={String(c.props?.placeholder ?? 'Textarea')} rows={3} />;
      case 'Select':
      case 'ComboBox':
      case 'MultiSelect':
        return (
          <select {...common}>
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
        );
      case 'Radio':
        return (
          <div className="control-preview radio-group">
            <label><input type="radio" name={c.id} /> One</label>
            <label><input type="radio" name={c.id} /> Two</label>
          </div>
        );
      case 'Checkbox':
        return (
          <label className="control-preview">
            <input type="checkbox" /> Checkbox
          </label>
        );
      case 'Date':
      case 'DateRangePicker':
        return <input {...common} type="date" />;
      case 'Button':
        return <button className="control-btn">{c.props?.label ?? 'Button'}</button>;
      case 'Table':
      case 'DataTable':
        return (
          <table className="control-table">
            <thead><tr><th>A</th><th>B</th></tr></thead>
            <tbody><tr><td>Row1</td><td>Val</td></tr></tbody>
          </table>
        );
      case 'FileUpload':
      case 'FileUploader':
        return <input {...common} type="file" />;
      case 'Tabs':
        return (
          <div className="control-tabs">
            <div className="tab">Tab 1</div>
            <div className="tab">Tab 2</div>
          </div>
        );
      case 'Stepper':
        return <div className="control-stepper"><span className="dot active" /> <span className="dot" /> <span className="dot" /></div>;
      case 'Grid-2col':
      case 'Grid-3col':
        return <div className={`control-grid ${c.widgetRef === 'Grid-2col' ? 'cols-2' : 'cols-3'}`}><div /> <div /> {c.widgetRef === 'Grid-3col' && <div />}</div>;
      case 'TableLayout':
        return <div className="control-tablelayout">Table layout placeholder</div>;
      default:
        return <div className="control-preview">{c.widgetRef}</div>;
    }
  };

  return (
    <div className="layout">
      <header className="topbar">
        <div className="logo">ProtoBuilder — {mode === 'builder' ? 'Builder' : mode === 'applications' ? 'Applications' : 'Checklist'}</div>
        <div className="menu-actions">
          <button type="button" onClick={() => setMode('applications')}>Applications</button>
          <button type="button" onClick={() => setMode('builder')}>Builder</button>
          <button type="button" onClick={() => setMode('checklist')}>Checklist</button>
          <button type="button">New App</button>
          <button type="button">Load App</button>
          <button type="button">Save App</button>
          <button type="button">List Apps</button>
        </div>
        <div className="top-actions">
          <button type="button">Test</button>
          <button type="button">Debug</button>
          <button type="button">Deploy</button>
        </div>
      </header>

      <div
        className="main"
        style={{
          gridTemplateColumns: `${navWidth}px ${leftCollapsed ? '0px' : `${leftWidth}px`} 1fr ${rightCollapsed ? '0px' : `${rightWidth}px`}`
        }}
      >
        <aside className="nav-rail">
          <div className="nav-title">Navigation</div>
          <button className={`nav-item ${mode === 'applications' ? 'active' : ''}`} onClick={() => setMode('applications')}>Applications</button>
          <button className={`nav-item ${mode === 'builder' ? 'active' : ''}`} onClick={() => setMode('builder')}>Builder</button>
          <button className="nav-item">Workflows</button>
          <button className="nav-item">Users</button>
          <button className="nav-item">Deployments</button>
        </aside>

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
                    <div key={group.group} className="group drawer">
                      <div className="group-title" onClick={() => setToolboxOpen((p) => ({ ...p, [group.group]: !p[group.group] }))}>
                        {group.group} <span className="chevron">{toolboxOpen[group.group] ? '▾' : '▸'}</span>
                      </div>
                      {toolboxOpen[group.group] && (
                        <div className="tool-grid">
                          {group.items.map((c) => (
                            <button
                              key={c}
                              className="tool-btn"
                            title={`${c} — ${controlDesc[c] ?? ''}`}
                            aria-label={c}
                              onClick={() => addControl(c)}
                              draggable
                              onDragStart={() => setDragPayload({ kind: 'control', name: c })}
                            >
                            <span className="icon">{controlIcon[c] ?? '🔧'}</span>
                            <span className="sr-only">{c}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="group drawer">
                    <div className="group-title" onClick={() => setToolboxOpen((p) => ({ ...p, 'Alignment & Layout': !p['Alignment & Layout'] }))}>
                      Alignment & Layout <span className="chevron">{toolboxOpen['Alignment & Layout'] ? '▾' : '▸'}</span>
                    </div>
                    {toolboxOpen['Alignment & Layout'] && (
                      <div className="tool-grid">
                        <button className="tool-btn" title="2-column section" aria-label="2-column section" onClick={() => addLayout('Grid-2col')} draggable onDragStart={() => setDragPayload({ kind: 'layout', name: 'Grid-2col' })}>
                          <span className="icon">{controlIcon['Grid-2col']}</span>
                          <span className="sr-only">2-col</span>
                        </button>
                        <button className="tool-btn" title="3-column section" aria-label="3-column section" onClick={() => addLayout('Grid-3col')} draggable onDragStart={() => setDragPayload({ kind: 'layout', name: 'Grid-3col' })}>
                          <span className="icon">{controlIcon['Grid-3col']}</span>
                          <span className="sr-only">3-col</span>
                        </button>
                        <button className="tool-btn" title="Table layout" aria-label="Table layout" onClick={() => addLayout('TableLayout')} draggable onDragStart={() => setDragPayload({ kind: 'layout', name: 'TableLayout' })}>
                          <span className="icon">{controlIcon['TableLayout']}</span>
                          <span className="sr-only">Table</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="group drawer">
                    <div className="group-title" onClick={() => setToolboxOpen((p) => ({ ...p, 'Built-in Widgets': !p['Built-in Widgets'] }))}>
                      Built-in Widgets <span className="chevron">{toolboxOpen['Built-in Widgets'] ? '▾' : '▸'}</span>
                    </div>
                    {toolboxOpen['Built-in Widgets'] && (
                      <div className="tool-grid">
                        {builtInWidgets.map((w) => (
                          <button
                            key={w}
                            className="tool-btn"
                            title={`${w} — ${controlDesc[w] ?? ''}`}
                            aria-label={w}
                            onClick={() => addControl(w)}
                            draggable
                            onDragStart={() => setDragPayload({ kind: 'control', name: w })}
                          >
                            <span className="icon">{controlIcon[w] ?? '✨'}</span>
                            <span className="sr-only">{w}</span>
                          </button>
                        ))}
                      </div>
                    )}
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
            {mode === 'applications' ? (
              <div className="apps-grid">
                {apps.map((a) => (
                  <div
                    key={a.id}
                    className={`app-card ${a.id === 'new' ? 'new' : ''}`}
                    onClick={() => {
                      setSelectedApp(a.id === 'new' ? 'Untitled App' : a.name);
                      setMode(a.id === 'new' ? 'checklist' : 'builder');
                    }}
                  >
                    {a.name}
                  </div>
                ))}
              </div>
            ) : mode === 'checklist' ? (
              <div className="checklist-grid">
                {checklist.map((item) => (
                  <div key={item.id} className="check-card">
                    <div className="check-title">{item.title}</div>
                    <div className="check-desc">{item.desc}</div>
                    <button className="ghost small">{item.action}</button>
                  </div>
                ))}
              </div>
            ) : mainTab === 'design' ? (
              <div
                className={`canvas-inner ${dropHover ? 'drop-over' : ''}`}
                onDragOver={onCanvasDragOver}
                onDragLeave={onCanvasDragLeave}
                onDrop={onCanvasDrop}
                ref={canvasRef}
              >
                <div className="canvas-toolbar">
                  <p className="hint">Drag controls to the canvas; position them as desired.</p>
                  <button className="ghost small" onClick={() => setSnapGrid((v) => !v)}>
                    {snapGrid ? 'Snap: On (5%)' : 'Snap: Off'}
                  </button>
                </div>
                <div className="chip-row">
                  <span className="chip">App: {selectedApp ?? config.appId}</span>
                  <span className="chip">Pages: {config.pages.length}</span>
                  <span className="chip">Connectors: {config.connectors.length}</span>
                </div>
                <div className="stage-row">
                  {stages.map((s) => (
                    <span key={s} className="stage-chip">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="component-surface">
                  {components.length === 0 && <div className="empty">No components yet. Drag from the left.</div>}
                  {components.map((c) => (
                    <div
                      key={c.id}
                      className="component-card"
                      style={{ left: `${c.xPct ?? 5}%`, top: `${c.yPct ?? 5}%` }}
                      draggable
                      onDragStart={() => onDragStart(c.id)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        onDragOver(c.id);
                      }}
                      onDragEnd={onDragEnd}
                      onClick={() => setSelectedId(c.id)}
                      aria-pressed={selectedId === c.id}
                    >
                      <div className="component-title">
                        <span className="drag-handle">≡</span> {c.widgetRef}
                      </div>
                      <div className="component-body">{renderControl(c)}</div>
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

        <aside className={`right-pane ${rightCollapsed ? 'collapsed' : ''}`} style={{ width: rightCollapsed ? 10 : rightWidth }}>
          <div className="right-header">
            <div className="right-tabs">
              <button className={rightTab === 'properties' ? 'active' : ''} onClick={() => setRightTab('properties')}>
                Properties
              </button>
              <button className={rightTab === 'ai' ? 'active' : ''} onClick={() => setRightTab('ai')}>
                AI
              </button>
            </div>
            <button className="collapse" onClick={() => setRightCollapsed((v) => !v)}>
              {rightCollapsed ? '◀' : '▶'}
            </button>
          </div>
          {!rightCollapsed && (
            <div className="right-content">
              {rightTab === 'properties' ? (
                selectedComponent ? (
                  <div className="props-panel">
                    <div className="prop-field">
                      <label>Label</label>
                      <input
                        value={String(selectedComponent.props?.label ?? '')}
                        onChange={(e) => updateSelectedProp('label', e.target.value)}
                      />
                    </div>
                    <div className="prop-field">
                      <label>Placeholder</label>
                      <input
                        value={String(selectedComponent.props?.placeholder ?? '')}
                        onChange={(e) => updateSelectedProp('placeholder', e.target.value)}
                      />
                    </div>
                    <div className="prop-field">
                      <label>Width</label>
                      <input
                        type="number"
                        value={Number(selectedComponent.props?.width ?? 100)}
                        onChange={(e) => updateSelectedProp('width', Number(e.target.value))}
                      />
                    </div>
                    <div className="prop-field">
                      <label>
                        <input
                          type="checkbox"
                          checked={Boolean(selectedComponent.props?.required)}
                          onChange={(e) => updateSelectedProp('required', e.target.checked)}
                        />{' '}
                        Required
                      </label>
                    </div>
                    {selectedComponent.widgetRef === 'Autocomplete' && (
                      <>
                        <div className="prop-field">
                          <label>Suggestions API</label>
                          <input
                            value={String(selectedComponent.props?.suggestApi ?? '')}
                            onChange={(e) => updateSelectedProp('suggestApi', e.target.value)}
                          />
                        </div>
                        <div className="prop-field">
                          <label>Static options (comma)</label>
                          <input
                            value={String(selectedComponent.props?.staticOptions ?? '')}
                            onChange={(e) => updateSelectedProp('staticOptions', e.target.value)}
                          />
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="muted">Select a component to edit properties.</div>
                )
              ) : (
                <div className="ai-panel">
                  <div className="ai-history">
                    <div className="ai-bubble">Ask AI to build a Vehicle Search form.</div>
                    <div className="ai-bubble secondary">"Add a workflow step for document review."</div>
                  </div>
                  <div className="ai-input-row">
                    <button className="ghost small">📎 Upload mock</button>
                    <input className="ai-input" placeholder="Ask AI..." />
                    <button className="ghost small">Send</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>
        {!leftCollapsed && (
          <div
            className="resizer vertical"
            style={{ left: `${navWidth + leftWidth - 3}px` }}
            onMouseDown={() => setResizing({ side: 'left' })}
          />
        )}
        {!rightCollapsed && (
          <div
            className="resizer vertical right"
            style={{ right: `${rightWidth - 3}px` }}
            onMouseDown={() => setResizing({ side: 'right' })}
          />
        )}
      </div>

      <footer className={`bottom-pane ${bottomCollapsed ? 'collapsed' : ''}`} style={{ height: bottomCollapsed ? 12 : bottomHeight }}>
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


