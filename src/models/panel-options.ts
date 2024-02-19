import { ToggleMode, TreeLevelOrderMode } from './';

export interface PanelOptions {
  multiSelect: boolean;
  orderLevels: TreeLevelOrderMode;
  idColumn: string;
  labelColumn: string;
  parentIdColumn: string;
  supportsDisabled: boolean;
  disabledColumn: string;
  displayedTreeDepth: number;
  showItemCount: boolean;
  showSearch: boolean;
  dashboardVariableName: string;
  toggleSelectMode: ToggleMode;
  hasDataLink: boolean;
  dataLinkUrl: string;
  dataLinkNewTab: boolean;
}
