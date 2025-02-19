export enum ToggleMode {
  NoTogle = 'noTogle',
  ExpandOnly = 'expandOnly',
  SingleClick = 'singleClick',
  ChevronOnly = 'chevronOnly',
}

export enum ClickMode {
  SetVariable = 'SetVariable',
  DataLink = 'DataLink',
}

export type TreeViewOptions = {
  clickMode: ClickMode;
  multiSelect: boolean;
  showItemCount: boolean;
  toggleMode: ToggleMode;
  supportsDisabled: boolean;
  showSearch: boolean;
  dashboardVariableName: string;
  dataLinkUrl: string;
  dataLinkNewTab: boolean;
};

export interface TreeNode {
  id: string;
  name: string;
  children: TreeNode[];
  disabled: boolean;
  link?: string;
}

export enum TreeLevelOrderMode {
  Asc = 'asc',
  Desc = 'desc',
  Source = 'source',
}

export interface RawNode {
  id: string;
  parent?: string;
  name: string;
  disabled: boolean;
  link?: string;
}

export interface PanelOptions {
  clickMode: ClickMode;
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
  dataLinkUrl: string;
  dataLinkNewTab: boolean;
}
