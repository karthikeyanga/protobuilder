import type { AppConfig } from '@protobuilder/schema';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080';

export type EntityField = {
  name: string;
  kind: 'primitive' | 'object' | 'reference' | 'list';
  type?: string;
  ref?: string;
  cardinality?: 'one' | 'many';
  constraints?: {
    required?: boolean;
    min?: number;
    max?: number;
    allowedValues?: string[];
    pattern?: string;
  };
  display?: {
    label?: string;
    description?: string;
    placeholder?: string;
    hint?: string;
  };
  derivedFrom?: string;
};

export type EntityConfig = {
  name: string;
  version: string;
  fields: EntityField[];
};

export type EntityDto = {
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

export async function listEntities(appId: string): Promise<{ dto: EntityDto; config: EntityConfig }[]> {
  const res = await fetch(`${API_BASE}/api/apps/${appId}/entities`);
  const data = await handle<EntityDto[]>(res);
  return data.map((d) => ({
    dto: d,
    config: parseConfig(d.config, d.name)
  }));
}

export async function createEntity(appId: string, config: EntityConfig) {
  const res = await fetch(`${API_BASE}/api/apps/${appId}/entities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: config.name, version: config.version, config: JSON.stringify(config) })
  });
  const dto = await handle<EntityDto>(res);
  return { dto, config: parseConfig(dto.config, dto.name) };
}

export async function updateEntity(appId: string, id: string, config: EntityConfig) {
  const res = await fetch(`${API_BASE}/api/apps/${appId}/entities/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: config.name, version: config.version, config: JSON.stringify(config) })
  });
  const dto = await handle<EntityDto>(res);
  return { dto, config: parseConfig(dto.config, dto.name) };
}

function parseConfig(raw: string | null | undefined, name: string): EntityConfig {
  if (!raw) return { name, version: '0.0.1', fields: [] };
  try {
    return JSON.parse(raw) as EntityConfig;
  } catch {
    return { name, version: '0.0.1', fields: [] };
  }
}


