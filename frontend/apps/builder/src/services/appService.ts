import type { AppConfig } from '@protobuilder/schema';

export type AppSummary = { id: string; name: string };

// Mock service; replace with real API calls later.
const mockApps: AppSummary[] = [
  { id: 'new', name: '+ New Application' },
  { id: 'claims', name: 'Claims Ops' },
  { id: 'vehicle', name: 'Vehicle Search' }
];

export async function fetchApps(): Promise<AppSummary[]> {
  return Promise.resolve(mockApps);
}

export async function fetchAppDetail(id: string): Promise<AppConfig | null> {
  if (id === 'claims' || id === 'vehicle') {
    return Promise.resolve({
      appId: id,
      version: '0.0.1',
      entities: [],
      connectors: [],
      pages: [],
      widgets: [],
      workflows: []
    });
  }
  return Promise.resolve(null);
}


