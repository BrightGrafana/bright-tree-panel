export enum ToggleMode {
  NoTogle = 'noTogle',
  ExpandOnly = 'expandOnly',
  SingleClick = 'singleClick',
  ChevronOnly = 'chevronOnly',
}

export type TreeViewOptions = {
  multiSelect: boolean;
  showItemCount: boolean;
  toggleMode: ToggleMode;
  supportsDisabled: boolean;
  showSearch: boolean;
  dashboardVariableName: string;
  hasDataLink: boolean;
  dataLinkUrl: string;
  dataLinkNewTab: boolean;
};
