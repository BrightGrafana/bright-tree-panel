export enum ToggleMode {
  NoToggle = 'noToggle',
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
