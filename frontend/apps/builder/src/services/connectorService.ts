const API_BASE =
  (import.meta as any).env?.VITE_API_BASE ??
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8080');

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
  config?: ConnectorConfig | null;
};

export type ConnectorTestRequest = {
  path?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
};

export type ConnectorTestResponse = {
  status: number;
  headers?: Record<string, string>;
  body?: unknown;
  message?: string;
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
    body: JSON.stringify({ name: config.name, version: config.version, config })
  });
  const dto = await handle<ConnectorDto>(res);
  return { dto, config: parseConfig(dto.config, dto.name) };
}

export async function updateConnector(appId: string, id: string, config: ConnectorConfig) {
  const res = await fetch(`${API_BASE}/api/apps/${appId}/connectors/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: config.name, version: config.version, config })
  });
  const dto = await handle<ConnectorDto>(res);
  return { dto, config: parseConfig(dto.config, dto.name) };
}

export async function deleteConnector(appId: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/apps/${appId}/connectors/${id}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 404) {
    const body = await res.text();
    throw new Error(body || `HTTP ${res.status}`);
  }
}

export async function testConnector(appId: string, id: string, payload: ConnectorTestRequest): Promise<ConnectorTestResponse> {
  const res = await fetch(`${API_BASE}/api/apps/${appId}/connectors/${id}/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload ?? {})
  });
  return handle<ConnectorTestResponse>(res);
}

function parseConfig(raw: ConnectorConfig | null | undefined, name: string): ConnectorConfig {
  if (!raw) return { name, version: '0.0.1', kind: 'REST', request: { method: 'GET' } };
  return raw;
}


