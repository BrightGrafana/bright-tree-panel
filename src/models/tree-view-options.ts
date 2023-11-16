export enum ToggleMode {
  Expanded = 'expanded',
  ExpandOnly = 'expandOnly',
  SingleClick = 'singleClick',
  ChevronOnly = 'chevronOnly',
}

export type TreeViewOptions = {
  multiSelect: boolean;
  showItemCount: boolean;
  toggleMode: ToggleMode;
  showSearch: boolean;
  dashboardVariableName: string;
};
