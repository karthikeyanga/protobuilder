import { useEffect, useMemo, useRef, useState } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import type { AppConfig } from '@protobuilder/schema';
import { mockAppConfig } from '../mocks/mock-app';
import { ApplicationsPage } from '../pages/ApplicationsPage';
import { NewAppPage } from '../pages/NewAppPage';
import { ChecklistPage } from '../pages/ChecklistPage';
import { EntitiesPage } from '../pages/EntitiesPage';
import { ConnectorsPage } from '../pages/ConnectorsPage';
import { WorkflowsPage } from '../pages/WorkflowsPage';
import { PagesPage } from '../pages/PagesPage';
import { WidgetsPage } from '../pages/WidgetsPage';
import { PermissionsPage } from '../pages/PermissionsPage';
import { ThemePage } from '../pages/ThemePage';
import { UsersPage } from '../pages/UsersPage';
import { DeploymentsPage } from '../pages/DeploymentsPage';
import { NavRail } from './NavRail';
import { fetchAppDetail, updateApp, deleteApp } from '../services/appService';
import { listConnectors } from '../services/connectorService';
import { listWorkflows } from '../services/workflowService';

type LeftTab = 'toolbox' | 'pages' | 'workflows' | 'data';
type MainTab = 'design' | 'code';
type RightTab = 'properties' | 'ai';
type ComponentsByPage = Record<string, any[]>;
const LOCAL_KEY = (appId: string, page: string) => `pb:${appId}:page:${page}`;

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
  const [config, setConfig] = useState<AppConfig>(mockAppConfig);
  const [componentsByPage, setComponentsByPage] = useState<ComponentsByPage>({});
  const [pages, setPages] = useState<string[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>('');
  const [dataConnectors, setDataConnectors] = useState<string[]>([]);
  const [dataWorkflows, setDataWorkflows] = useState<string[]>([]);
  const [selectedAppName, setSelectedAppName] = useState<string>('');
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragPayload, setDragPayload] = useState<{ kind: 'control' | 'layout'; name: string } | null>(null);
  const [dropHover, setDropHover] = useState(false);
  const [leftTab, setLeftTab] = useState<LeftTab>('toolbox');
  const [mainTab, setMainTab] = useState<MainTab>('design');
  const [rightTab, setRightTab] = useState<RightTab>('properties');
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [bottomCollapsed, setBottomCollapsed] = useState(false);
  const [leftWidth, setLeftWidth] = useState(260);
  const [rightWidth, setRightWidth] = useState(320);
  const [bottomHeight, setBottomHeight] = useState(160);
  const [resizing, setResizing] = useState<{ side: 'left' | 'right' | 'bottom' | null }>({ side: null });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedConnectorId, setSelectedConnectorId] = useState<string | null>(null);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [aiMessages, setAiMessages] = useState<Array<{ from: 'user' | 'ai'; text: string }>>([
    { from: 'ai', text: 'Need help? Ask me to scaffold entities, pages, or bindings.' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [loadingApp, setLoadingApp] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
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
  const stages = ['Entities', 'Connectors', 'Workflows', 'Pages', 'Widgets', 'Permissions', 'Theme/Nav', 'Release'];
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
        { ...config, pages: [{ name: selectedPage || 'Page1', components: componentsByPage[selectedPage] ?? [] }] },
        null,
        2
      )};`,
    [config, selectedPage, componentsByPage]
  );

  const savePageToStorage = (pageName: string, comps: ComponentsByPage[keyof ComponentsByPage]) => {
    try {
      window.localStorage.setItem(LOCAL_KEY(config.appId, pageName), JSON.stringify(comps));
      setStatusMsg(`Saved ${pageName}`);
    } catch {
      setStatusMsg('Save failed');
    }
  };

  const loadPageFromStorage = (pageName: string) => {
    const raw = window.localStorage.getItem(LOCAL_KEY(config.appId, pageName));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ComponentsByPage[keyof ComponentsByPage];
    } catch {
      return null;
    }
  };

  const updatePageComponents = (updater: (prev: ComponentsByPage[keyof ComponentsByPage]) => ComponentsByPage[keyof ComponentsByPage]) => {
    setComponentsByPage((prev) => {
      const current = prev[selectedPage] ?? [];
      const next = updater(current);
      const merged = { ...prev, [selectedPage]: next };
      return merged;
    });
  };

  const addControl = (control: string, posPct?: { xPct: number; yPct: number }) => {
    updatePageComponents((prev) => [
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

  const removeLast = () => updatePageComponents((prev) => prev.slice(0, -1));
  const addLayout = (layout: string, posPct?: { xPct: number; yPct: number }) => {
    updatePageComponents((prev) => [
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
    updatePageComponents((prev) => {
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
    updatePageComponents((prev) => prev.map((c) => (c.id === selectedId ? { ...c, props: { ...(c.props ?? {}), [key]: value } } : c)));
  };

  const selectedComponent = componentsByPage[selectedPage]?.find((c) => c.id === selectedId) || null;

  const renderControl = (c: ComponentsByPage[keyof ComponentsByPage][number]) => {
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

  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const currentAppId = params.appId ?? selectedApp;
  const isEditor = location.pathname.includes('/editor');

  useEffect(() => {
    if (!currentAppId) return;
    setLoadingApp(true);
    setLoadError(null);
    fetchAppDetail(currentAppId)
      .then((cfg) => {
        const nextConfig = cfg ?? { ...mockAppConfig, appId: currentAppId };
        setConfig(nextConfig);
        setSelectedAppName((prev) => prev || nextConfig.appId);

        const loadedLayouts = (nextConfig as any).pageLayouts as ComponentsByPage | undefined;
        const layouts = loadedLayouts ?? {};
        setComponentsByPage(layouts);

        const pageList = nextConfig.pages ?? Object.keys(layouts);
        const finalPages = pageList.length > 0 ? pageList : ['Page1'];
        setPages(finalPages);
        setSelectedPage((prev) => (finalPages.includes(prev) ? prev : finalPages[0] ?? 'Page1'));

        // reset selections for the new app
        setSelectedId(null);
        setSelectedConnectorId(null);
        setSelectedWorkflowId(null);

        // pre-load connectors into left-pane data list
        listConnectors(currentAppId)
          .then((rows) => {
            const ids = rows.map((r) => r.dto.name ?? r.dto.id);
            setDataConnectors(ids);
          })
          .catch(() => {
            // ignore for now
          });
        listWorkflows(currentAppId)
          .then((rows) => {
            const ids = rows.map((r) => r.dto.name ?? r.dto.id);
            setDataWorkflows(ids);
          })
          .catch(() => {
            // ignore for now
          });
        setStatusMsg(`Loaded ${nextConfig.appId}`);
      })
      .catch(() => setLoadError('Failed to load application'))
      .finally(() => setLoadingApp(false));
  }, [currentAppId]);

  const handleSelectApp = (id: string, name: string) => {
    if (id === 'new') {
      navigate('/apps/new');
      return;
    }
    setSelectedApp(id);
    setSelectedAppName(name || id);
    navigate(`/apps/${id}/editor`);
  };

  const handleAppCreated = (id: string, name: string) => {
    setSelectedApp(id);
    setSelectedAppName(name || id);
    setConfig((c) => ({ ...c, appId: id }));
  };

  const handleSelectPage = (pageName: string) => {
    setSelectedId(null);
    setSelectedPage(pageName);
    const stored = loadPageFromStorage(pageName);
    if (stored) {
      setComponentsByPage((prev) => ({ ...prev, [pageName]: stored }));
    } else {
      setComponentsByPage((prev) => ({ ...prev, [pageName]: prev[pageName] ?? [] }));
    }
  };

  const saveCurrentPage = () => {
    const pageName = selectedPage || 'Page1';
    const comps = componentsByPage[pageName] ?? [];
    savePageToStorage(pageName, comps);
    if (currentAppId) {
      const nextConfig = {
        ...config,
        pages: Array.from(new Set([...(config.pages ?? []), pageName])),
        pageLayouts: { ...componentsByPage, [pageName]: comps }
      } as any;
      const nextPages = Array.from(new Set([...(config.pages ?? []), pageName]));
      setPages(nextPages);
      setConfig(nextConfig);
      updateApp(currentAppId, nextConfig, selectedAppName).catch(() => setStatusMsg('Save to backend failed'));
    }
  };

  const resetCurrentPage = () => {
    const pageName = selectedPage || 'Page1';
    setComponentsByPage((prev) => ({ ...prev, [pageName]: [] }));
    window.localStorage.removeItem(LOCAL_KEY(config.appId, pageName));
    setStatusMsg(`Reset ${pageName}`);
  };

  const handleTopbarAction = (action: 'new' | 'load' | 'save' | 'delete' | 'test' | 'debug' | 'deploy') => {
    switch (action) {
      case 'new':
        navigate('/apps');
        break;
      case 'load':
        setStatusMsg('Load app coming soon');
        break;
      case 'save':
        saveCurrentPage();
        break;
      case 'delete':
        if (currentAppId && window.confirm('Delete this app?')) {
          deleteApp(currentAppId)
            .then(() => {
              setSelectedApp(null);
              setComponentsByPage({});
              setPages([]);
              setSelectedPage('');
              setStatusMsg('App deleted');
              navigate('/apps');
            })
            .catch(() => setStatusMsg('Delete failed'));
        }
        break;
      case 'test':
      case 'debug':
      case 'deploy':
        setStatusMsg(`${action} is not wired yet`);
        break;
    }
  };

  return (
    <div className="layout">
      <header className="topbar">
        <div className="logo">ProtoBuilder</div>
        <div className="menu-actions">
          <button type="button" onClick={() => navigate('/apps')}>Applications</button>
          <button type="button" onClick={() => currentAppId && navigate(`/apps/${currentAppId}/editor`)} disabled={!currentAppId}>Builder</button>
          <button type="button" onClick={() => currentAppId && navigate(`/apps/${currentAppId}/checklist`)} disabled={!currentAppId}>Checklist</button>
          <button type="button" onClick={() => handleTopbarAction('new')}>New App</button>
          <button type="button" onClick={() => handleTopbarAction('load')}>Load App</button>
          <button type="button" onClick={() => handleTopbarAction('save')} disabled={!currentAppId}>Save App</button>
          <button type="button" onClick={() => handleTopbarAction('delete')} disabled={!currentAppId}>Delete App</button>
          <button type="button" onClick={() => navigate('/apps')}>List Apps</button>
        </div>
        <div className="top-actions">
          <button type="button" onClick={() => handleTopbarAction('test')}>Test</button>
          <button type="button" onClick={() => handleTopbarAction('debug')}>Debug</button>
          <button type="button" onClick={() => handleTopbarAction('deploy')}>Deploy</button>
        </div>
      </header>

      <div
        className="main"
        style={{
          gridTemplateColumns: isEditor
            ? rightCollapsed
              ? `${navWidth}px ${leftCollapsed ? '0px' : `${leftWidth}px`} 1fr`
              : `${navWidth}px ${leftCollapsed ? '0px' : `${leftWidth}px`} 1fr ${rightWidth}px`
            : rightCollapsed
              ? `${navWidth}px 1fr`
              : `${navWidth}px 1fr ${rightWidth}px`
        }}
      >
        <NavRail selectedApp={currentAppId} />

        {isEditor && (
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
                  <ul className="select-list">
                    {pages.map((p) => (
                      <li
                        key={p}
                        className={p === selectedPage ? 'active' : ''}
                        onClick={() => handleSelectPage(p)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && handleSelectPage(p)}
                      >
                        {p}
                      </li>
                    ))}
                    {pages.length === 0 && <li className="muted">No pages yet</li>}
                  </ul>
                </div>
              )}
              {leftTab === 'workflows' && (
                <div className="group">
                  <div className="group-title">Workflows</div>
                  <ul className="select-list">
                    {dataWorkflows.map((w) => (
                      <li
                        key={w}
                        className={selectedWorkflowId === w ? 'active' : ''}
                        onClick={() => {
                          setSelectedWorkflowId(w);
                          setSelectedConnectorId(null);
                          setSelectedId(null);
                        }}
                      >
                        {w}
                      </li>
                    ))}
                    {dataWorkflows.length === 0 && <li className="muted">No workflows yet</li>}
                  </ul>
                </div>
              )}
              {leftTab === 'data' && (
                <div className="group">
                  <div className="group-title">Connectors & Data</div>
                  <ul className="select-list">
                    {dataConnectors.map((id) => (
                      <li
                        key={id}
                        className={selectedConnectorId === id ? 'active' : ''}
                        onClick={() => {
                          setSelectedConnectorId(id);
                          setSelectedWorkflowId(null);
                          setSelectedId(null);
                        }}
                      >
                        {id}
                      </li>
                    ))}
                    {dataConnectors.length === 0 && <li className="muted">No connectors yet</li>}
                  </ul>
                </div>
              )}
              </div>
            )}
        </aside>
        )}

        <section className="center-pane">
          <Routes>
            <Route path="/apps/new" element={<NewAppPage onCreated={handleAppCreated} />} />
            <Route path="/apps" element={<ApplicationsPage onSelectApp={(id, name) => handleSelectApp(id, name)} />} />
            <Route path="/apps/:appId/checklist" element={<ChecklistPage appName={selectedAppName || currentAppId} />} />
            <Route path="/apps/:appId/entities" element={<EntitiesPage />} />
            <Route path="/apps/:appId/connectors" element={<ConnectorsPage />} />
            <Route path="/apps/:appId/workflows" element={<WorkflowsPage />} />
            <Route path="/apps/:appId/pages" element={<PagesPage />} />
            <Route path="/apps/:appId/widgets" element={<WidgetsPage />} />
            <Route path="/apps/:appId/permissions" element={<PermissionsPage />} />
            <Route path="/apps/:appId/theme" element={<ThemePage />} />
            <Route path="/workflows" element={<WorkflowsPage global />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/deployments" element={<DeploymentsPage />} />
            <Route
              path="/apps/:appId/editor"
              element={
                <div className="canvas">
                  {loadingApp && <div className="panel-placeholder">Loading application...</div>}
                  {loadError && !loadingApp && <div className="panel-placeholder error">{loadError}</div>}
                  {!loadingApp && !loadError && (
                    <>
                      <div className="tab-bar">
                        <div className="tabs">
                          <button className={mainTab === 'design' ? 'active' : ''} onClick={() => setMainTab('design')}>
                            Design
                          </button>
                          <button className={mainTab === 'code' ? 'active' : ''} onClick={() => setMainTab('code')}>
                            Code
                          </button>
                        </div>
                        <div className="breadcrumbs">
                          <span>{selectedAppName || currentAppId || 'Select an app'}</span>
                          {isEditor && pages.length > 0 && (
                            <span className="breadcrumb-page">
                              <select value={selectedPage} onChange={(e) => handleSelectPage(e.target.value)}>
                                {pages.map((p) => (
                                  <option key={p} value={p}>
                                    {p}
                                  </option>
                                ))}
                              </select>
                            </span>
                          )}
                        </div>
                      </div>

                      {mainTab === 'design' ? (
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
                            <span className="chip">App: {currentAppId ?? config.appId}</span>
                        <span className="chip">Page: {selectedPage || 'Page1'}</span>
                        <span className="chip">Connectors: {dataConnectors.length}</span>
                          </div>
                          <div className="stage-row">
                            {stages.map((s) => (
                              <span key={s} className="stage-chip">
                                {s}
                              </span>
                            ))}
                          </div>
                          <div className="component-surface">
                            {(componentsByPage[selectedPage]?.length ?? 0) === 0 && <div className="empty">No components yet. Drag from the left.</div>}
                            {(componentsByPage[selectedPage] ?? []).map((c) => (
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
                            <button type="button" className="ghost" onClick={removeLast} disabled={(componentsByPage[selectedPage]?.length ?? 0) === 0}>
                              Remove last
                            </button>
                            <button type="button" className="ghost" onClick={saveCurrentPage} disabled={!currentAppId}>
                              Save page
                            </button>
                            <button type="button" className="ghost" onClick={resetCurrentPage}>
                              Reset page
                            </button>
                          </div>
                        </div>
                      ) : (
                        <pre className="code-view">{codePreview}</pre>
                      )}
                    </>
                  )}
                </div>
              }
            />
            <Route path="*" element={<Navigate to="/apps" />} />
          </Routes>
        </section>

        <aside className={`right-pane ${rightCollapsed ? 'collapsed' : ''}`} style={{ width: rightCollapsed ? 0 : rightWidth }}>
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
                isEditor ? (
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
                  ) : selectedConnectorId ? (
                    <div className="props-panel">
                      <div className="prop-field">
                        <label>Connector</label>
                        <div>{selectedConnectorId}</div>
                      </div>
                      <div className="prop-field">
                        <label>Details</label>
                        <div className="muted">Configure bindings from canvas coming soon.</div>
                      </div>
                    </div>
                  ) : selectedWorkflowId ? (
                    <div className="props-panel">
                      <div className="prop-field">
                        <label>Workflow</label>
                        <div>{selectedWorkflowId}</div>
                      </div>
                      <div className="prop-field">
                        <label>Steps</label>
                        <ul className="muted">
                          <li>Start → Task → End (placeholder)</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="muted">Select a component, workflow, or connector to see details.</div>
                  )
                ) : (
                  <div className="muted">Properties available in the Builder editor.</div>
                )
              ) : (
                <div className="ai-panel">
                  <div className="ai-history">
                    {aiMessages.map((m, idx) => (
                      <div key={idx} className={`ai-bubble ${m.from === 'ai' ? 'secondary' : ''}`}>
                        {m.text}
                      </div>
                    ))}
                  </div>
                  <div className="ai-input-row">
                    <input
                      className="ai-input"
                      placeholder="Ask AI to scaffold an entity or page..."
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && aiInput.trim()) {
                          const prompt = aiInput.trim();
                          setAiMessages((prev) => [...prev, { from: 'user', text: prompt }, { from: 'ai', text: 'AI reply coming soon (mock).' }]);
                          setAiInput('');
                        }
                      }}
                    />
                    <button
                      className="ghost small"
                      onClick={() => {
                        if (!aiInput.trim()) return;
                        const prompt = aiInput.trim();
                        setAiMessages((prev) => [...prev, { from: 'user', text: prompt }, { from: 'ai', text: 'AI reply coming soon (mock).' }]);
                        setAiInput('');
                      }}
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>

        {isEditor && !leftCollapsed && (
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
            {statusMsg && <div>[status] {statusMsg}</div>}
          </div>
        )}
      </footer>
    </div>
  );
}


