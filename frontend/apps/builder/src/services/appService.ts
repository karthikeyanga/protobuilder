import type { AppConfig } from '@protobuilder/schema';

export type AppSummary = { id: string; name: string };
type AppDto = {
  id: string;
  name: string;
  version: string;
  config?: string | null;
};

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080';

const defaultConfig = (id: string): AppConfig => ({
  appId: id,
  version: '0.0.1',
  entities: [],
  connectors: [],
  pages: [],
  widgets: [],
  workflows: []
});

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function fetchApps(): Promise<AppSummary[]> {
  const res = await fetch(`${API_BASE}/api/apps`);
  const data = await handle<AppDto[]>(res);
  if (!Array.isArray(data) || data.length === 0) {
    return [{ id: 'new', name: '+ New Application' }];
  }
  return [{ id: 'new', name: '+ New Application' }, ...data.map((d) => ({ id: d.id, name: d.name }))];
}

export async function fetchAppDetail(id: string): Promise<AppConfig | null> {
  const res = await fetch(`${API_BASE}/api/apps/${id}`);
  if (res.status === 404) return defaultConfig(id);
  const dto = await handle<AppDto>(res);
  if (!dto) return defaultConfig(id);
  const parsed = dto.config ? safeParse(dto.config) : null;
  return parsed ?? defaultConfig(dto.id ?? id);
}

export async function createApp(name: string, config: AppConfig): Promise<AppSummary> {
  const res = await fetch(`${API_BASE}/api/apps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, version: config.version ?? '0.0.1', config: JSON.stringify(config) })
  });
  const dto = await handle<AppDto>(res);
  return { id: dto.id, name: dto.name };
}

export async function updateApp(id: string, config: AppConfig): Promise<void> {
  await fetch(`${API_BASE}/api/apps/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: id, version: config.version ?? '0.0.1', config: JSON.stringify(config) })
  }).then((res) => handle<AppDto>(res));
}

export async function deleteApp(id: string): Promise<void> {
  await fetch(`${API_BASE}/api/apps/${id}`, {
    method: 'DELETE'
  }).then((res) => {
    if (!res.ok && res.status !== 404) {
      return res.text().then((t) => {
        throw new Error(t || `HTTP ${res.status}`);
      });
    }
  });
}

function safeParse(payload: string): AppConfig | null {
  try {
    return JSON.parse(payload) as AppConfig;
  } catch {
    return null;
  }
}


