import { TreeLevelOrderMode } from "./";

export interface PanelOptions {
    multiSelect: boolean;
    orderLevels: TreeLevelOrderMode;
    idColumn: string;
    labelColumn: string;
    parentIdColumn: string;
    displayedTreeDepth: number;
    showItemCount: boolean;
    dashboardVariableName: string;
}
