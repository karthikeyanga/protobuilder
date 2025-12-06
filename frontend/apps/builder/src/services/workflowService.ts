const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080';

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
  config?: string | null;
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
    body: JSON.stringify({ name: config.name, version: config.version, config: JSON.stringify(config) })
  });
  const dto = await handle<WorkflowDto>(res);
  return { dto, config: parseConfig(dto.config, dto.name) };
}

export async function updateWorkflow(appId: string, id: string, config: WorkflowConfig) {
  const res = await fetch(`${API_BASE}/api/apps/${appId}/workflows/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: config.name, version: config.version, config: JSON.stringify(config) })
  });
  const dto = await handle<WorkflowDto>(res);
  return { dto, config: parseConfig(dto.config, dto.name) };
}

function parseConfig(raw: string | null | undefined, name: string): WorkflowConfig {
  if (!raw) return { name, version: '0.0.1' };
  try {
    return JSON.parse(raw) as WorkflowConfig;
  } catch {
    return { name, version: '0.0.1' };
  }
}


