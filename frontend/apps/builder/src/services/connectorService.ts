const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080';

export type ConnectorConfig = {
  name: string;
  version: string;
  kind: 'REST' | 'GraphQL' | 'DB' | 'Storage';
  request?: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    bodyTemplate?: string;
  };
  auth?: {
    type: 'none' | 'apiKey' | 'bearer';
    keyName?: string;
    token?: string;
  };
};

export type ConnectorDto = {
  id: string;
  appId: string;
  name: string;
  version: string;
  config?: string | null;
};

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function listConnectors(appId: string): Promise<{ dto: ConnectorDto; config: ConnectorConfig }[]> {
  const res = await fetch(`${API_BASE}/api/apps/${appId}/connectors`);
  const data = await handle<ConnectorDto[]>(res);
  return data.map((d) => ({ dto: d, config: parseConfig(d.config, d.name) }));
}

export async function createConnector(appId: string, config: ConnectorConfig) {
  const res = await fetch(`${API_BASE}/api/apps/${appId}/connectors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: config.name, version: config.version, config: JSON.stringify(config) })
  });
  const dto = await handle<ConnectorDto>(res);
  return { dto, config: parseConfig(dto.config, dto.name) };
}

export async function updateConnector(appId: string, id: string, config: ConnectorConfig) {
  const res = await fetch(`${API_BASE}/api/apps/${appId}/connectors/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: config.name, version: config.version, config: JSON.stringify(config) })
  });
  const dto = await handle<ConnectorDto>(res);
  return { dto, config: parseConfig(dto.config, dto.name) };
}

function parseConfig(raw: string | null | undefined, name: string): ConnectorConfig {
  if (!raw) return { name, version: '0.0.1', kind: 'REST', request: { method: 'GET' } };
  try {
    return JSON.parse(raw) as ConnectorConfig;
  } catch {
    return { name, version: '0.0.1', kind: 'REST', request: { method: 'GET' } };
  }
}


