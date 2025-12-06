export interface AppConfig {
  appId: string;
  version: string;
  entities: string[];
  connectors: string[];
  pages: string[];
  widgets: string[];
  workflows: string[];
  themeRef?: string;
  permissionsRef?: string;
  exposure?: {
    routes?: { path: string; auth: 'public' | 'protected' }[];
  };
  environmentOverrides?: Record<string, unknown>;
}

export interface EntityConfig {
  name: string;
  version: string;
  fields: EntityField[];
}

export type EntityField =
  | PrimitiveField
  | ObjectField
  | ArrayField
  | ReferenceField;

export interface BaseField {
  name: string;
  constraints?: Constraints;
  display?: Display;
  derived?: { expression: string };
}

export interface PrimitiveField extends BaseField {
  kind: 'primitive';
  type: 'string' | 'number' | 'boolean' | 'date' | 'datetime';
}

export interface ObjectField extends BaseField {
  kind: 'object';
  fields?: EntityField[];
}

export interface ArrayField extends BaseField {
  kind: 'array';
  items?: EntityField;
}

export interface ReferenceField extends BaseField {
  kind: 'reference';
  ref: string;
  cardinality?: 'one' | 'list';
}

export interface Constraints {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enum?: string[];
  unique?: boolean;
  default?: unknown;
}

export interface Display {
  label?: string;
  help?: string;
  mask?: string;
}

export interface PageConfig {
  name: string;
  route: string;
  layout: string;
  components: PageComponent[];
}

export interface PageComponent {
  id: string;
  widgetRef: string;
  props?: Record<string, unknown>;
  bindings?: Record<string, string>;
  events?: Record<string, ActionSpec[]>;
  access?: { roles?: string[] };
}

export interface ActionSpec {
  type: string;
  params?: Record<string, unknown>;
}

export interface WidgetConfig {
  name: string;
  version: string;
  inputs?: Record<string, string>;
  outputs?: Record<string, string>;
  state?: Record<string, unknown>;
  composition?: { control: string; props?: Record<string, unknown> }[];
  actions?: string[];
}

export interface ConnectorConfig {
  id: string;
  kind: 'REST' | 'GraphQL' | 'DB' | 'Storage';
  authProfileRef?: string;
  request?: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    query?: Record<string, unknown>;
    body?: unknown;
  };
  response?: {
    transform?: string;
    map?: Record<string, unknown>;
  };
  retry?: { maxAttempts?: number; backoffMs?: number };
  cache?: { ttlMs?: number; key?: string };
  mock?: Record<string, unknown>;
  policy?: Record<string, unknown>;
}

export interface WorkflowConfig {
  id: string;
  version: string;
  bpmnRef: string;
  signals?: string[];
  variables?: Record<string, unknown>;
  userTasks?: { taskId: string; pageRef: string; payloadSchema?: Record<string, unknown> }[];
}

export interface ThemeConfig {
  name: string;
  version: string;
  tokens: Tokens;
  modes?: Record<string, Tokens>;
}

export interface Tokens {
  color?: Record<string, string>;
  typography?: Record<string, unknown>;
  spacing?: Record<string, unknown>;
  radius?: Record<string, unknown>;
  shadows?: Record<string, unknown>;
  motion?: Record<string, unknown>;
}

export interface PermissionsConfig {
  roles: string[];
  grants: { role: string; resource: string; action: string; condition?: string }[];
}


