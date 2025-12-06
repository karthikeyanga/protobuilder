import type { AppConfig, EntityConfig, PageConfig, ConnectorConfig } from '@protobuilder/schema';

const entities: EntityConfig[] = [
  {
    name: 'Vehicle',
    version: '1.0.0',
    fields: [
      { name: 'registrationNumber', kind: 'primitive', type: 'string', constraints: { required: true, pattern: '^[A-Z0-9-]{6,12}$' } },
      { name: 'make', kind: 'primitive', type: 'string', constraints: { required: true } },
      { name: 'model', kind: 'primitive', type: 'string' },
      { name: 'variant', kind: 'primitive', type: 'string' }
    ]
  }
];

const pages: PageConfig[] = [
  {
    name: 'VehicleSearch',
    route: '/vehicle/search',
    layout: 'single-column',
    components: [
      {
        id: 'searchInput',
        widgetRef: 'TextInput',
        props: { label: 'Registration Number', placeholder: 'Enter vehicle reg no' },
        bindings: { value: 'state.query' },
        events: { onChange: [{ type: 'callConnector', params: { id: 'vehicleSearch' } }] }
      },
      {
        id: 'searchResults',
        widgetRef: 'DataTable',
        props: { title: 'Results' },
        bindings: { rows: 'data.vehicleSearch.results' }
      }
    ]
  }
];

const connectors: ConnectorConfig[] = [
  {
    id: 'vehicleSearch',
    kind: 'REST',
    request: { method: 'GET', url: '/api/mock/vehicles?q={{query}}' }
  }
];

export const mockAppConfig: AppConfig = {
  appId: 'vehicle-ops',
  version: '0.0.1',
  entities: entities.map((e) => e.name),
  connectors: connectors.map((c) => c.id),
  pages: pages.map((p) => p.name),
  widgets: ['TextInput', 'DataTable', 'Autocomplete', 'MultiSelect', 'Stepper', 'FileUploader', 'DateRangePicker'],
  workflows: ['VehicleLookupFlow'],
  themeRef: 'Default',
  permissionsRef: 'Default',
  exposure: {
    routes: [
      { path: '/vehicle/search', auth: 'public' }
    ]
  },
  environmentOverrides: {}
};

export const mockEntities = entities;
export const mockPages = pages;
export const mockConnectors = connectors;


