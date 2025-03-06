import { PanelPlugin } from '@grafana/data';
import { PanelOptions } from './types';
import { TreePanel } from './components/TreePanel';
import { migrationHandler } from './migrationHandler';
import { panelOptions } from './panelOptions';

export const plugin = new PanelPlugin<PanelOptions>(TreePanel)
  .setPanelOptions(panelOptions)
  .setMigrationHandler(migrationHandler);
