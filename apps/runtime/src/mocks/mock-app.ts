import type { AppConfig } from '@protobuilder/schema';
import { mockAppConfig as builderApp } from '../../../builder/src/mocks/mock-app';
import { mockPages as builderPages } from '../../../builder/src/mocks/mock-app';

// Reuse the builder mocks to keep the config consistent across builder/runtime.
export const mockAppConfig: AppConfig = builderApp;
export const mockPages = builderPages;


