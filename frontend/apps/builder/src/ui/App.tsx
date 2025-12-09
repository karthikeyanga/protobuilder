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
import { listConnectors, testConnector, type ConnectorTestResponse } from '../services/connectorService';
import { listWorkflows, executeWorkflow, createWorkflow, deleteWorkflow, type WorkflowExecuteResponse } from '../services/workflowService';
import { askAiGenerate, type AiSuggestion } from '../services/aiService';

type LeftTab = 'toolbox' | 'pages' | 'workflows' | 'data' | 'templates';
type MainTab = 'design' | 'code' | 'preview';
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

const templates = [
  {
    id: 'crud-form',
    title: 'CRUD Form',
    desc: 'Create or edit a record with validations',
    components: [
      { id: 'Row-1', widgetRef: 'Grid-2col', props: { columns: 2, colSpan: 12, rowSpan: 1 } },
      { id: 'Field-Name', widgetRef: 'Text', props: { label: 'Name', placeholder: 'Enter name', colSpan: 6, required: true } },
      { id: 'Field-Email', widgetRef: 'Text', props: { label: 'Email', placeholder: 'name@example.com', colSpan: 6, required: true } },
      { id: 'Field-Status', widgetRef: 'Select', props: { label: 'Status', colSpan: 4, placeholder: 'Pick status', staticOptions: 'New,In Progress,Done' } },
      { id: 'Field-Notes', widgetRef: 'TextArea', props: { label: 'Notes', placeholder: 'Optional notes', colSpan: 8 } },
      { id: 'Row-2', widgetRef: 'Grid-3col', props: { columns: 3, colSpan: 12, rowSpan: 1 } },
      { id: 'Btn-Save', widgetRef: 'Button', props: { label: 'Save', colSpan: 3, variant: 'strong', tone: 'primary' } },
      { id: 'Btn-Reset', widgetRef: 'Button', props: { label: 'Reset', colSpan: 3, variant: 'subtle', tone: 'neutral' } },
      { id: 'Btn-Delete', widgetRef: 'Button', props: { label: 'Delete', colSpan: 3, variant: 'subtle', tone: 'danger' } }
    ]
  },
  {
    id: 'list-detail',
    title: 'List + Detail',
    desc: 'Master-detail with filter/search',
    components: [
      { id: 'Row-List', widgetRef: 'Grid-2col', props: { columns: 2, colSpan: 12, rowSpan: 1 } },
      { id: 'Filter-Search', widgetRef: 'Text', props: { label: 'Search', placeholder: 'Search records', colSpan: 6 } },
      { id: 'Filter-Status', widgetRef: 'Select', props: { label: 'Status', colSpan: 6, placeholder: 'All statuses', staticOptions: 'All,Open,Closed' } },
      { id: 'Table-List', widgetRef: 'Table', props: { label: 'Records', colSpan: 6 } },
      { id: 'Detail-Panel', widgetRef: 'Grid-2col', props: { columns: 2, colSpan: 6, rowSpan: 2 } },
      { id: 'Detail-Field1', widgetRef: 'Text', props: { label: 'Field A', placeholder: 'Value', colSpan: 6 } },
      { id: 'Detail-Field2', widgetRef: 'Text', props: { label: 'Field B', placeholder: 'Value', colSpan: 6 } },
      { id: 'Detail-Notes', widgetRef: 'TextArea', props: { label: 'Notes', placeholder: 'Notes', colSpan: 12 } },
      { id: 'Btn-Update', widgetRef: 'Button', props: { label: 'Update', colSpan: 4, variant: 'strong', tone: 'primary' } }
    ]
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    desc: 'Cards and table snapshot',
    components: [
      { id: 'Row-Cards', widgetRef: 'Grid-3col', props: { columns: 3, colSpan: 12, rowSpan: 1 } },
      { id: 'Card-1', widgetRef: 'TableLayout', props: { label: 'Metric A', colSpan: 4 } },
      { id: 'Card-2', widgetRef: 'TableLayout', props: { label: 'Metric B', colSpan: 4 } },
      { id: 'Card-3', widgetRef: 'TableLayout', props: { label: 'Metric C', colSpan: 4 } },
      { id: 'Row-Chart', widgetRef: 'Grid-2col', props: { columns: 2, colSpan: 12, rowSpan: 1 } },
      { id: 'Table-Main', widgetRef: 'Table', props: { label: 'Recent activity', colSpan: 12 } }
    ]
  }
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
  const [inspectorTab, setInspectorTab] = useState<'layout' | 'style' | 'data' | 'logic' | 'state'>('layout');
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
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null);
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
  const [connectorTest, setConnectorTest] = useState<ConnectorTestResponse | null>(null);
  const [workflowRun, setWorkflowRun] = useState<WorkflowExecuteResponse | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isRunningWorkflow, setIsRunningWorkflow] = useState(false);
  const [persona, setPersona] = useState<'internal' | 'enduser'>('internal');
  const [breakpoint, setBreakpoint] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewZoom, setPreviewZoom] = useState<0.75 | 0.9 | 1>(1);
  const [newPageName, setNewPageName] = useState('');
  const [newWorkflowName, setNewWorkflowName] = useState('');
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

  const gridColumns = useMemo(() => {
    switch (breakpoint) {
      case 'tablet':
        return 8;
      case 'mobile':
        return 4;
      default:
        return 12;
    }
  }, [breakpoint]);

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
        props: { label: control, placeholder: `${control} placeholder`, colSpan: 4, rowSpan: 1 },
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
        props: { columns: layout === 'Grid-2col' ? 2 : 3, colSpan: 12, rowSpan: 1 },
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

  useEffect(() => {
    setConnectorTest(null);
    setWorkflowRun(null);
  }, [selectedId, selectedConnectorId, selectedWorkflowId, selectedPage]);

  const bindingChips = (c: ComponentsByPage[keyof ComponentsByPage][number]) => {
    const chips: string[] = [];
    if (c.props?.required) chips.push('Required');
    if (c.props?.connectorId) chips.push(`Connector: ${c.props.connectorId}`);
    if (c.props?.bindingPath) chips.push(`Path: ${c.props.bindingPath}`);
    if (c.props?.workflowId) chips.push(`Workflow: ${c.props.workflowId}`);
    if (c.props?.sampleBody) chips.push('Sample data set');
    if (c.props?.staticOptions) chips.push('Static options');
    if (c.props?.optionsLabelKey || c.props?.optionsValueKey) chips.push('Options from data');
    return chips;
  };

  const optionList = (c: ComponentsByPage[keyof ComponentsByPage][number]) => {
    const rawStatic = c.props?.staticOptions as string | undefined;
    if (rawStatic) {
      return rawStatic.split(',').map((s) => s.trim()).filter(Boolean);
    }
    const labelKey = (c.props?.optionsLabelKey as string) || '';
    const valueKey = (c.props?.optionsValueKey as string) || '';
    if (labelKey || valueKey) {
      return [`data.${labelKey || 'label'}`, `data.${valueKey || 'value'}`];
    }
    return null;
  };

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
        const opts = optionList(c) ?? ['Option 1', 'Option 2'];
        return (
          <select {...common}>
            {opts.map((o) => (
              <option key={o}>{o}</option>
            ))}
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

  const handleAddPage = () => {
    const name = newPageName.trim() || `Page${pages.length + 1}`;
    if (!name) return;
    const nextPages = Array.from(new Set([...(pages ?? []), name]));
    setPages(nextPages);
    setComponentsByPage((prev) => ({ ...prev, [name]: prev[name] ?? [] }));
    setSelectedPage(name);
    setNewPageName('');
    if (currentAppId) {
      const nextConfig = { ...config, pages: nextPages, pageLayouts: { ...componentsByPage } } as any;
      setConfig(nextConfig);
      updateApp(currentAppId, nextConfig, selectedAppName).catch(() => setStatusMsg('Save to backend failed'));
    }
  };

  const handleDeletePage = (name: string) => {
    if (!window.confirm(`Delete page "${name}"?`)) return;
    setComponentsByPage((prev) => {
      const { [name]: _, ...rest } = prev;
      return rest;
    });
    const nextPages = pages.filter((p) => p !== name);
    setPages(nextPages);
    const nextSelected = nextPages[0] ?? '';
    setSelectedPage(nextSelected);
    window.localStorage.removeItem(LOCAL_KEY(config.appId, name));
    if (currentAppId) {
      const nextConfig = { ...config, pages: nextPages, pageLayouts: componentsByPage } as any;
      setConfig(nextConfig);
      updateApp(currentAppId, nextConfig, selectedAppName).catch(() => setStatusMsg('Save to backend failed'));
    }
  };

  const handleTestConnector = async () => {
    if (!currentAppId) return;
    const connectorId = (selectedComponent?.props?.connectorId as string) || selectedConnectorId;
    if (!connectorId) {
      setStatusMsg('Pick a connector to test');
      return;
    }
    setIsTesting(true);
    try {
      const resp = await testConnector(currentAppId, connectorId, {
        path: String(selectedComponent?.props?.bindingPath ?? '/'),
        method: String(selectedComponent?.props?.method ?? 'GET'),
        body: selectedComponent?.props?.sampleBody ?? ''
      });
      setConnectorTest(resp);
      setStatusMsg(`Tested ${connectorId}`);
    } catch (e: any) {
      setStatusMsg(e?.message ?? 'Test failed');
    } finally {
      setIsTesting(false);
    }
  };

  const handleRunWorkflow = async () => {
    if (!currentAppId) return;
    const workflowId = (selectedComponent?.props?.workflowId as string) || selectedWorkflowId;
    if (!workflowId) {
      setStatusMsg('Pick a workflow to run');
      return;
    }
    setIsRunningWorkflow(true);
    try {
      const resp = await executeWorkflow(currentAppId, workflowId, {
        inputs: (selectedComponent?.props?.workflowInputs as Record<string, unknown>) ?? {},
        pageRef: selectedPage
      });
      setWorkflowRun(resp);
      setStatusMsg(`Ran workflow ${workflowId}`);
    } catch (e: any) {
      setStatusMsg(e?.message ?? 'Run failed');
    } finally {
      setIsRunningWorkflow(false);
    }
  };

  const applyAiTemplate = () => {
    if (!selectedPage) return;
    const template = [
      { id: 'Section-1', widgetRef: 'Grid-2col', props: { columns: 2, colSpan: 12, rowSpan: 1 } },
      { id: 'Input-Name', widgetRef: 'Text', props: { label: 'Name', placeholder: 'Enter name', colSpan: 6, required: true } },
      { id: 'Input-Email', widgetRef: 'Text', props: { label: 'Email', placeholder: 'user@example.com', colSpan: 6, required: true } },
      { id: 'Input-Status', widgetRef: 'Select', props: { label: 'Status', colSpan: 4, placeholder: 'Pick status', staticOptions: 'New,In Progress,Done' } },
      { id: 'Input-Notes', widgetRef: 'TextArea', props: { label: 'Notes', placeholder: 'Optional notes', colSpan: 8 } },
      { id: 'Action-Submit', widgetRef: 'Button', props: { label: 'Submit', colSpan: 3, required: true } },
      { id: 'Action-Reset', widgetRef: 'Button', props: { label: 'Reset', colSpan: 3 } },
      { id: 'Table-List', widgetRef: 'Table', props: { label: 'Records', colSpan: 12 } }
    ];
    setComponentsByPage((prev) => ({ ...prev, [selectedPage]: template }));
    setSelectedId('Input-Name');
    setStatusMsg('Applied AI-generated CRUD template');
  };

  const applyTemplate = (id: string) => {
    const tpl = templates.find((t) => t.id === id);
    if (!tpl || !selectedPage) return;
    setComponentsByPage((prev) => ({ ...prev, [selectedPage]: tpl.components }));
    setSelectedId(tpl.components[0]?.id ?? null);
    setStatusMsg(`Applied template: ${tpl.title}`);
  };

  const handleAddWorkflow = () => {
    const name = newWorkflowName.trim() || `Workflow${dataWorkflows.length + 1}`;
    if (!name || !currentAppId) return;
    createWorkflow(currentAppId, { name, version: '0.0.1' })
      .then((res) => {
        setDataWorkflows((prev) => Array.from(new Set([...prev, res.dto.name ?? name])));
        setSelectedWorkflowId(res.dto.id ?? res.dto.name ?? name);
        setStatusMsg(`Workflow created: ${name}`);
      })
      .catch(() => setStatusMsg('Create workflow failed'))
      .finally(() => setNewWorkflowName(''));
  };

  const handleDeleteWorkflow = (id: string) => {
    if (!currentAppId) return;
    if (!window.confirm(`Delete workflow "${id}"?`)) return;
    deleteWorkflow(currentAppId, id)
      .then(() => {
        setDataWorkflows((prev) => prev.filter((w) => w !== id));
        setSelectedWorkflowId((prev) => (prev === id ? null : prev));
        setStatusMsg(`Deleted workflow ${id}`);
      })
      .catch(() => setStatusMsg('Delete workflow failed'));
  };

  const sendAiPrompt = async () => {
    if (!aiInput.trim()) return;
    const prompt = aiInput.trim();
    setAiMessages((prev) => [...prev, { from: 'user', text: prompt }]);
    setAiLoading(true);
    setAiError(null);
    try {
      const suggestion = await askAiGenerate(prompt, {
        appId: currentAppId ?? config.appId,
        page: selectedPage,
        connectors: dataConnectors,
        workflows: dataWorkflows
      });
      setAiSuggestion(suggestion);
      setAiMessages((prev) => [...prev, { from: 'ai', text: suggestion.summary }]);
    } catch (e: any) {
      const msg = e?.message ?? 'AI failed';
      setAiError(msg);
      setAiMessages((prev) => [...prev, { from: 'ai', text: `AI error: ${msg}` }]);
    } finally {
      setAiInput('');
      setAiLoading(false);
    }
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
              <button className={leftTab === 'templates' ? 'active' : ''} onClick={() => setLeftTab('templates')}>
                Templates
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
                  <div className="inline-form">
                    <input
                      placeholder="New page name"
                      value={newPageName}
                      onChange={(e) => setNewPageName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddPage()}
                    />
                    <button className="ghost small" onClick={handleAddPage}>
                      Add
                    </button>
                  </div>
                  <ul className="select-list">
                    {pages.map((p) => (
                      <li
                        key={p}
                        className={p === selectedPage ? 'active' : ''}
                        onClick={() => handleSelectPage(p)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelectPage(p)}
                      >
                        <span>{p}</span>
                        <button
                          className="ghost small danger"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            handleDeletePage(p);
                          }}
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                    {pages.length === 0 && <li className="muted">No pages yet</li>}
                  </ul>
                </div>
              )}
              {leftTab === 'workflows' && (
                <div className="group">
                  <div className="group-title">Workflows</div>
                  <div className="inline-form">
                    <input
                      placeholder="New workflow"
                      value={newWorkflowName}
                      onChange={(e) => setNewWorkflowName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddWorkflow()}
                    />
                    <button className="ghost small" onClick={handleAddWorkflow}>
                      Add
                    </button>
                  </div>
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
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedWorkflowId(w);
                            setSelectedConnectorId(null);
                            setSelectedId(null);
                          }
                        }}
                      >
                        <span>{w}</span>
                        <button
                          className="ghost small danger"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            handleDeleteWorkflow(w);
                          }}
                        >
                          ✕
                        </button>
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
              {leftTab === 'templates' && (
                <div className="group">
                  <div className="group-title">Templates</div>
                  <div className="template-grid">
                    {templates.map((t) => (
                      <button key={t.id} className="template-card" onClick={() => applyTemplate(t.id)}>
                        <div className="template-title">{t.title}</div>
                        <div className="template-desc">{t.desc}</div>
                      </button>
                    ))}
                  </div>
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
                          <button className={mainTab === 'preview' ? 'active' : ''} onClick={() => setMainTab('preview')}>
                            Preview
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
                            <div className="canvas-actions-row">
                              <div className="btn-group">
                                <button className={`ghost small ${breakpoint === 'desktop' ? 'active' : ''}`} onClick={() => setBreakpoint('desktop')}>
                                  Desktop
                                </button>
                                <button className={`ghost small ${breakpoint === 'tablet' ? 'active' : ''}`} onClick={() => setBreakpoint('tablet')}>
                                  Tablet
                                </button>
                                <button className={`ghost small ${breakpoint === 'mobile' ? 'active' : ''}`} onClick={() => setBreakpoint('mobile')}>
                                  Mobile
                                </button>
                              </div>
                              <button className="ghost small" onClick={() => setSnapGrid((v) => !v)}>
                                {snapGrid ? 'Snap: On (5%)' : 'Snap: Off'}
                              </button>
                            </div>
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
                          <div className="component-surface" style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}>
                            {(componentsByPage[selectedPage]?.length ?? 0) === 0 && <div className="empty">No components yet. Drag from the left.</div>}
                            {(componentsByPage[selectedPage] ?? []).map((c) => (
                              <div
                                key={c.id}
                                className="component-card"
                                style={{
                                  gridColumn: `span ${Math.min(12, Math.max(1, Number(c.props?.colSpan ?? 4)))}`,
                                  gridRow: `span ${Math.max(1, Number(c.props?.rowSpan ?? 1))}`
                                }}
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
                                <div className="chip-row compact">
                                  {bindingChips(c).map((chip) => (
                                    <span key={`${c.id}-${chip}`} className="chip muted-chip">
                                      {chip}
                                    </span>
                                  ))}
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
                      ) : mainTab === 'preview' ? (
                        <div className="preview-panel">
                          <div className="preview-toolbar">
                            <div className="chip-row">
                              <span className="chip">Persona</span>
                              <button className={`ghost small ${persona === 'internal' ? 'active' : ''}`} onClick={() => setPersona('internal')}>
                                Internal
                              </button>
                              <button className={`ghost small ${persona === 'enduser' ? 'active' : ''}`} onClick={() => setPersona('enduser')}>
                                End user
                              </button>
                              <span className="chip">Breakpoint</span>
                              <button className={`ghost small ${breakpoint === 'desktop' ? 'active' : ''}`} onClick={() => setBreakpoint('desktop')}>
                                Desktop
                              </button>
                              <button className={`ghost small ${breakpoint === 'tablet' ? 'active' : ''}`} onClick={() => setBreakpoint('tablet')}>
                                Tablet
                              </button>
                              <button className={`ghost small ${breakpoint === 'mobile' ? 'active' : ''}`} onClick={() => setBreakpoint('mobile')}>
                                Mobile
                              </button>
                              <span className="chip">Zoom</span>
                              {[1, 0.9, 0.75].map((z) => (
                                <button
                                  key={z}
                                  className={`ghost small ${previewZoom === z ? 'active' : ''}`}
                                  onClick={() => setPreviewZoom(z as 0.75 | 0.9 | 1)}
                                >
                                  {Math.round(z * 100)}%
                                </button>
                              ))}
                            </div>
                            <div className="muted small">Preview uses mock data and bindings.</div>
                          </div>
                          <div className="preview-frame">
                            <div
                              className="preview-surface"
                              style={{
                                gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
                                maxWidth: breakpoint === 'desktop' ? 1280 : breakpoint === 'tablet' ? 920 : 480,
                                transform: `scale(${previewZoom})`,
                                transformOrigin: 'top center'
                              }}
                            >
                              {(componentsByPage[selectedPage] ?? []).length === 0 && <div className="empty">Add components to preview.</div>}
                              {(componentsByPage[selectedPage] ?? []).map((c) => (
                                <div
                                  key={`prev-${c.id}`}
                                  className="preview-block"
                                  style={{
                                    gridColumn: `span ${Math.min(12, Math.max(1, Number(c.props?.colSpan ?? 4)))}`,
                                    gridRow: `span ${Math.max(1, Number(c.props?.rowSpan ?? 1))}`
                                  }}
                                >
                                  <div className="muted small">{c.widgetRef}</div>
                                  <div className="chip-row compact">
                                    {bindingChips(c).map((chip) => (
                                      <span key={`prev-chip-${c.id}-${chip}`} className="chip muted-chip">
                                        {chip}
                                      </span>
                                    ))}
                                  </div>
                                  <div>{renderControl(c)}</div>
                                </div>
                              ))}
                            </div>
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
                      <div className="editor-tabs">
                        {(['layout', 'data', 'logic', 'style', 'state'] as const).map((tab) => (
                          <button key={tab} className={inspectorTab === tab ? 'active' : ''} onClick={() => setInspectorTab(tab)}>
                            {tab[0].toUpperCase() + tab.slice(1)}
                          </button>
                        ))}
                      </div>

                      {inspectorTab === 'layout' && (
                        <>
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
                          <div className="field-row">
                            <div className="prop-field">
                              <label>Columns span (1-12)</label>
                              <input
                                type="number"
                                value={Number(selectedComponent.props?.colSpan ?? 4)}
                                min={1}
                                max={12}
                                onChange={(e) => updateSelectedProp('colSpan', Math.max(1, Math.min(12, Number(e.target.value))))}
                              />
                            </div>
                            <div className="prop-field">
                              <label>Row span</label>
                              <input
                                type="number"
                                value={Number(selectedComponent.props?.rowSpan ?? 1)}
                                min={1}
                                onChange={(e) => updateSelectedProp('rowSpan', Math.max(1, Number(e.target.value)))}
                              />
                            </div>
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
                        </>
                      )}

                      {inspectorTab === 'data' && (
                        <>
                          <div className="prop-field">
                            <label>Connector binding</label>
                            <select
                              value={String(selectedComponent.props?.connectorId ?? '')}
                              onChange={(e) => updateSelectedProp('connectorId', e.target.value)}
                            >
                              <option value="">Select connector</option>
                              {dataConnectors.map((id) => (
                                <option key={id} value={id}>
                                  {id}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="prop-field">
                            <label>Binding path (JSONPath)</label>
                            <input
                              value={String(selectedComponent.props?.bindingPath ?? '$')}
                              onChange={(e) => updateSelectedProp('bindingPath', e.target.value)}
                            />
                          </div>
                          {['Select', 'ComboBox', 'MultiSelect', 'Autocomplete'].includes(selectedComponent.widgetRef) && (
                            <>
                              <div className="prop-field">
                                <label>Static options (comma)</label>
                                <input
                                  value={String(selectedComponent.props?.staticOptions ?? '')}
                                  onChange={(e) => updateSelectedProp('staticOptions', e.target.value)}
                                />
                              </div>
                              {['Select', 'ComboBox', 'MultiSelect'].includes(selectedComponent.widgetRef) && (
                                <div className="field-row">
                                  <div className="prop-field">
                                    <label>Label key (from data)</label>
                                    <input
                                      value={String(selectedComponent.props?.optionsLabelKey ?? '')}
                                      onChange={(e) => updateSelectedProp('optionsLabelKey', e.target.value)}
                                    />
                                  </div>
                                  <div className="prop-field">
                                    <label>Value key (from data)</label>
                                    <input
                                      value={String(selectedComponent.props?.optionsValueKey ?? '')}
                                      onChange={(e) => updateSelectedProp('optionsValueKey', e.target.value)}
                                    />
                                  </div>
                                  <div className="prop-field">
                                    <label>Sample options preview</label>
                                    <div className="chip-row compact">
                                      {(optionList(selectedComponent) ?? []).map((o) => (
                                        <span key={`${selectedComponent.id}-${o}`} className="chip muted-chip">
                                          {o}
                                        </span>
                                      ))}
                                      {(optionList(selectedComponent) ?? []).length === 0 && <span className="muted small">No options yet</span>}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                          <div className="prop-field">
                            <label>Sample body (for test)</label>
                            <input
                              value={String(selectedComponent.props?.sampleBody ?? '')}
                              onChange={(e) => updateSelectedProp('sampleBody', e.target.value)}
                            />
                          </div>
                          <div className="field-row">
                            <button className="ghost small" onClick={handleTestConnector} disabled={isTesting || !currentAppId}>
                              {isTesting ? 'Testing…' : 'Test connector'}
                            </button>
                            {connectorTest && <span className="muted small">Status: {connectorTest.status}</span>}
                          </div>
                          {connectorTest && (
                            <div className="json-pane">
                              <div className="small muted">Response</div>
                              <pre className="code-view">{JSON.stringify(connectorTest.body, null, 2)}</pre>
                            </div>
                          )}
                        </>
                      )}

                      {inspectorTab === 'logic' && (
                        <>
                          <div className="prop-field">
                            <label>Workflow action</label>
                            <select
                              value={String(selectedComponent.props?.workflowId ?? '')}
                              onChange={(e) => updateSelectedProp('workflowId', e.target.value)}
                            >
                              <option value="">Select workflow</option>
                              {dataWorkflows.map((id) => (
                                <option key={id} value={id}>
                                  {id}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="prop-field">
                            <label>Workflow inputs (JSON)</label>
                            <input
                              value={JSON.stringify(selectedComponent.props?.workflowInputs ?? {})}
                              onChange={(e) => {
                                try {
                                  const parsed = e.target.value ? JSON.parse(e.target.value) : {};
                                  updateSelectedProp('workflowInputs', parsed);
                                  setStatusMsg(null);
                                } catch {
                                  setStatusMsg('Invalid JSON for workflow inputs');
                                }
                              }}
                            />
                          </div>
                          <div className="field-row">
                            <button className="ghost small" onClick={handleRunWorkflow} disabled={isRunningWorkflow || !currentAppId}>
                              {isRunningWorkflow ? 'Running…' : 'Run workflow'}
                            </button>
                            {workflowRun && <span className="muted small">Status: {workflowRun.status}</span>}
                          </div>
                          {workflowRun && (
                            <div className="json-pane">
                              <div className="small muted">Output</div>
                              <pre className="code-view">{JSON.stringify(workflowRun.output, null, 2)}</pre>
                            </div>
                          )}
                        </>
                      )}

                      {inspectorTab === 'style' && (
                        <>
                          <div className="prop-field">
                            <label>Variant</label>
                            <select value={String(selectedComponent.props?.variant ?? 'default')} onChange={(e) => updateSelectedProp('variant', e.target.value)}>
                              <option value="default">Default</option>
                              <option value="subtle">Subtle</option>
                              <option value="strong">Strong</option>
                            </select>
                          </div>
                          <div className="prop-field">
                            <label>Tone</label>
                            <select value={String(selectedComponent.props?.tone ?? 'primary')} onChange={(e) => updateSelectedProp('tone', e.target.value)}>
                              <option value="primary">Primary</option>
                              <option value="neutral">Neutral</option>
                              <option value="success">Success</option>
                              <option value="warning">Warning</option>
                              <option value="danger">Danger</option>
                            </select>
                          </div>
                        </>
                      )}

                      {inspectorTab === 'state' && (
                        <>
                          <div className="prop-field">
                            <label>Local state key</label>
                            <input
                              value={String(selectedComponent.props?.stateKey ?? '')}
                              onChange={(e) => updateSelectedProp('stateKey', e.target.value)}
                            />
                          </div>
                          <div className="prop-field">
                            <label>Default value</label>
                            <input
                              value={String(selectedComponent.props?.defaultValue ?? '')}
                              onChange={(e) => updateSelectedProp('defaultValue', e.target.value)}
                            />
                          </div>
                        </>
                      )}

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
                        <div className="muted">Use the inspector to bind components to this connector.</div>
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
                    {aiError && <div className="ai-bubble secondary">AI error: {aiError}</div>}
                    {aiSuggestion && (
                      <div className="ai-bubble">
                        <div className="strong">{aiSuggestion.title}</div>
                        <div className="muted small">{aiSuggestion.generatedAt}</div>
                        <div className="small">{aiSuggestion.summary}</div>
                        <button className="ghost small" onClick={applyAiTemplate} style={{ marginTop: 6 }}>
                          Apply AI suggestion to page
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="ai-input-row">
                    <input
                      className="ai-input"
                      placeholder="Ask AI to scaffold an entity or page..."
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && aiInput.trim()) sendAiPrompt();
                      }}
                    />
                    <button
                      className="ghost small"
                      onClick={sendAiPrompt}
                      disabled={aiLoading}
                    >
                      {aiLoading ? 'Thinking…' : 'Send'}
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


