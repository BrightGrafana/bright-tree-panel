import {ClickMode, ToggleMode} from "./tree-view-options";
import {TreeLevelOrderMode} from "./tree-level-order-mode";

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
