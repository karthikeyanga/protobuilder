const API_BASE =
  (import.meta as any).env?.VITE_API_BASE ??
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8080');

export type WorkflowConfig = {
  name: string;
  version: string;
  description?: string;
  pageRef?: string;
  steps?: any;
};

export type WorkflowDto = {
  id: string;
  appId: string;
  name: string;
  version: string;
  config?: WorkflowConfig | null;
};

export type WorkflowExecuteRequest = {
  inputs?: Record<string, unknown>;
  pageRef?: string;
};

export type WorkflowExecuteResponse = {
  status: number;
  output?: Record<string, unknown>;
  message?: string;
};

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function listWorkflows(appId: string): Promise<{ dto: WorkflowDto; config: WorkflowConfig }[]> {
  const res = await fetch(`${API_BASE}/api/apps/${appId}/workflows`);
  const data = await handle<WorkflowDto[]>(res);
  return data.map((d) => ({ dto: d, config: parseConfig(d.config, d.name) }));
}

export async function createWorkflow(appId: string, config: WorkflowConfig) {
  const res = await fetch(`${API_BASE}/api/apps/${appId}/workflows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: config.name, version: config.version, config })
  });
  const dto = await handle<WorkflowDto>(res);
  return { dto, config: parseConfig(dto.config, dto.name) };
}

export async function updateWorkflow(appId: string, id: string, config: WorkflowConfig) {
  const res = await fetch(`${API_BASE}/api/apps/${appId}/workflows/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: config.name, version: config.version, config })
  });
  const dto = await handle<WorkflowDto>(res);
  return { dto, config: parseConfig(dto.config, dto.name) };
}

export async function deleteWorkflow(appId: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/apps/${appId}/workflows/${id}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 404) {
    const body = await res.text();
    throw new Error(body || `HTTP ${res.status}`);
  }
}

export async function executeWorkflow(appId: string, id: string, payload: WorkflowExecuteRequest): Promise<WorkflowExecuteResponse> {
  const res = await fetch(`${API_BASE}/api/apps/${appId}/workflows/${id}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload ?? {})
  });
  return handle<WorkflowExecuteResponse>(res);
}

function parseConfig(raw: WorkflowConfig | null | undefined, name: string): WorkflowConfig {
  if (!raw) return { name, version: '0.0.1' };
  return raw;
}


